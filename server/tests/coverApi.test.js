const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const express = require("express");
const { randomUUID } = require("node:crypto");
const { coverError, MAX_COVER_BYTES } = require("../services/coverConversion");

function loadModule(filename, dependencies, globals = {}) {
  const context = { module: { exports: {} }, Buffer, ...globals, require(name) {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, filename), "utf8"), context);
  return context.module.exports;
}

test("storage conversion uses only ebook-covers, unique PNG paths and no overwrite", async () => {
  const calls = [];
  const storage = loadModule("../services/coverStorage.js", {
    "node:crypto": { randomUUID },
    "../config/supabase": { storage: { from(bucket) {
      assert.equal(bucket, "ebook-covers");
      return { async upload(target, bytes, options) { calls.push({ target, bytes, options }); return { error: null }; },
        getPublicUrl(target) { return { data: { publicUrl: `https://example.invalid/ebook-covers/${target}` } }; } };
    } } },
    "./coverConversion": { coverError, MAX_COVER_BYTES, async convertCover(bytes, name) { assert.equal(name, "test.pdf"); return Buffer.from("generated-png"); } },
  });
  const first = await storage.saveCover(Buffer.from("pdf"), "test.pdf");
  const second = await storage.saveCover(Buffer.from("pdf"), "test.pdf");
  assert.notEqual(first.cover_path, second.cover_path);
  for (const call of calls) {
    assert.match(call.target, /^covers\/generated-[a-f0-9-]+\.png$/);
    assert.equal(call.options.contentType, "image/png");
    assert.equal(call.options.upsert, false);
  }
  for (const bad of ["https://attacker.example/cover.pdf", "../private.pdf", "covers/../private.pdf", "covers/%2e%2e/private.pdf", "/etc/passwd", "covers/a\\b.pdf", "covers/a.pdf?x", null]) {
    assert.throws(() => storage.validateStoragePath(bad));
  }
  assert.equal(storage.validateStoragePath("covers/My Cover.pdf"), "covers/My Cover.pdf");
});

test("storage imports enforce size limits and do not expose arbitrary URL fetches", async () => {
  let fetched = 0;
  let cancelled = false;
  const storage = loadModule("../services/coverStorage.js", {
    "node:crypto": { randomUUID },
    "../config/supabase": { storage: { from(bucket) { assert.equal(bucket, "ebook-covers"); return { getPublicUrl(target) { return { data: { publicUrl: `https://storage.example/ebook-covers/${target}` } }; } }; } } },
    "./coverConversion": { coverError, MAX_COVER_BYTES },
  }, { AbortSignal, async fetch(url, options) {
    fetched++;
    assert.equal(url, "https://storage.example/ebook-covers/covers/large.pdf");
    assert.equal(options.redirect, "error");
    return { ok: true, headers: new Map([["content-length", String(MAX_COVER_BYTES + 1)]]), body: { async cancel() { cancelled = true; } } };
  } });
  await assert.rejects(storage.downloadCover("http://127.0.0.1/private"));
  assert.equal(fetched, 0);
  await assert.rejects(storage.downloadCover("covers/large.pdf"), error => error.status === 413);
  assert.equal(cancelled, true);
});

test("cover endpoints enforce admin auth, accept binary uploads and safely report conversion errors", async () => {
  const calls = [];
  const controller = loadModule("../controllers/coverController.js", {
    "../services/coverStorage": {
      async saveCover(bytes, filename) {
        calls.push(filename);
        assert.ok(Buffer.isBuffer(bytes));
        if (filename === "broken.pdf") throw coverError("Invalid PDF", 422);
        if (filename === "secret.pdf") throw new Error("private backend detail");
        return { cover_path: "covers/generated-test.png" };
      },
      async importStoredCover(target) { calls.push(target); return { cover_path: "covers/generated-import.png" }; },
    },
  });
  const auth = loadModule("../middleware/auth.js", {
    "../config/supabase": {
      auth: { async getUser(token) { return { data: { user: token ? { id: token, user_metadata: { role: "admin" } } : null }, error: null }; } },
      from() { let id; return { select() { return this; }, eq(field, value) { id = value; return this; }, async single() { return { data: { role: id === "admin-session" ? "admin" : "customer" }, error: null }; } }; },
    },
  });
  const unused = () => assert.fail("Unexpected route");
  const routes = loadModule("../routes/adminRoutes.js", {
    express, "../middleware/auth": auth, "../controllers/coverController": controller,
    "../controllers/deleteEbookController": { deleteEbook: unused },
    "../controllers/ebookController": { createEbook: unused, listAdminEbooks: unused, updateEbook: unused, createUploadUrl: unused },
  });
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.use("/api/admin", routes);
  app.use((error, req, res, next) => res.status(error.status || 500).json({ success: false }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const root = `http://127.0.0.1:${server.address().port}/api/admin`;
  const upload = (name, token, bytes = Buffer.from("cover")) => fetch(`${root}/covers?filename=${encodeURIComponent(name)}`, { method: "POST", headers: { "Content-Type": "application/octet-stream", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: bytes });
  try {
    assert.equal((await upload("test.pdf")).status, 401);
    assert.equal((await upload("test.pdf", "customer-session")).status, 403);
    assert.equal(calls.length, 0);
    assert.equal((await upload("My cover.PDF", "admin-session")).status, 201);
    assert.equal(calls[0], "My cover.PDF");
    assert.equal((await upload("broken.pdf", "admin-session")).status, 422);
    const failed = await upload("secret.pdf", "admin-session");
    assert.equal(failed.status, 502);
    assert.doesNotMatch(await failed.text(), /private backend/);
    assert.equal((await upload("large.pdf", "admin-session", Buffer.alloc(MAX_COVER_BYTES + 1))).status, 413);
    const unauthorizedImport = await fetch(`${root}/covers/import`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "covers/source.pdf" }) });
    assert.equal(unauthorizedImport.status, 401);
    const imported = await fetch(`${root}/covers/import`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer admin-session" }, body: JSON.stringify({ path: "covers/source.pdf" }) });
    assert.equal(imported.status, 201);
    assert.equal((await imported.json()).cover_path, "covers/generated-import.png");
  } finally { await new Promise(resolve => server.close(resolve)); }
});
