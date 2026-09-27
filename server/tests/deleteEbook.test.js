const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const express = require("express");

const ebookId = "d4e6a28a-b8d5-4d3c-b2b8-a8dd0f5fe9c1";

function loadModule(file, dependencies) {
  const context = { module: { exports: {} }, require(name) {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, file), "utf8"), context);
  return context.module.exports;
}

function setup(options = {}) {
  const state = { deletions: [], authChecks: 0 };
  const db = {
    auth: { async getUser(token) {
      state.authChecks++;
      if (!["admin-session", "customer-session"].includes(token)) return { data: { user: null }, error: {} };
      return { data: { user: { id: token, user_metadata: { role: "admin" } } }, error: null };
    } },
    from(table) {
      let filterId;
      if (table === "profiles") {
        return { select() { return this; }, eq(column, id) { assert.equal(column, "id"); filterId = id; return this; }, async single() {
          return { data: { role: filterId === "admin-session" ? "admin" : "customer" }, error: null };
        } };
      }
      assert.equal(table, "ebooks", "Only the requested ebook listing may be deleted");
      return { delete() { return this; }, eq(column, id) { assert.equal(column, "id"); filterId = id; return this; }, async select(columns) {
        assert.equal(columns, "id");
        assert.ok(filterId, "Unscoped deletes are forbidden");
        state.deletions.push(filterId);
        if (options.throws) throw new Error("Private database failure");
        return options.result || { data: [{ id: filterId }], error: null };
      } };
    },
    storage: new Proxy({}, { get() { assert.fail("Deleting a listing must not delete storage files"); } }),
  };
  const controller = loadModule("../controllers/deleteEbookController.js", { "../config/supabase": db });
  const auth = loadModule("../middleware/auth.js", { "../config/supabase": db });
  return { state, controller, auth, async remove(id = ebookId) {
    const result = { status: 200 };
    const response = { status(code) { result.status = code; return this; }, json(data) { result.body = data; return this; } };
    await controller.deleteEbook({ params: { id } }, response, error => { throw error; });
    return result;
  } };
}

test("delete only removes the exact requested ebook and retains uploaded files", async () => {
  const api = setup();
  const result = await api.remove();
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(result.body.deletedId, ebookId);
  assert.match(result.body.message, /kept in storage/);
  assert.deepEqual(api.state.deletions, [ebookId]);
});

test("invalid or missing ebook IDs never reach the database", async () => {
  const api = setup();
  for (const id of [null, "", "all", "../ebooks", "id=*"]) {
    assert.equal((await api.remove(id)).status, 400);
  }
  assert.equal(api.state.deletions.length, 0);
});

test("transaction or download references prevent deletion and recommend unpublishing", async () => {
  const api = setup({ result: { data: null, error: { code: "23503", message: "private foreign key details" } } });
  const result = await api.remove();
  assert.equal(result.status, 409);
  assert.equal(result.body.success, false);
  assert.match(result.body.message, /Unpublish/);
  assert.doesNotMatch(result.body.message, /private/);
});

test("missing or previously deleted ebook reports 404 without false success", async () => {
  const result = await setup({ result: { data: [], error: null } }).remove();
  assert.equal(result.status, 404);
  assert.equal(result.body.success, false);
});

test("database errors are reported safely and never reported as successful deletion", async () => {
  for (const options of [{ result: { data: null, error: { code: "XX000", message: "Private database failure" } } }, { throws: true }]) {
    const result = await setup(options).remove();
    assert.equal(result.status, 500);
    assert.equal(result.body.success, false);
    assert.doesNotMatch(result.body.message, /Private/);
  }
});

test("DELETE route requires a verified session and an admin database role", async () => {
  const api = setup();
  const unused = () => assert.fail("Unexpected admin action");
  const router = loadModule("../routes/adminRoutes.js", {
    express,
    "../middleware/auth": api.auth,
    "../controllers/deleteEbookController": api.controller,
    "../controllers/coverController": { uploadCover: unused, importCover: unused },
    "../controllers/ebookController": { createEbook: unused, listAdminEbooks: unused, updateEbook: unused, createUploadUrl: unused },
  });
  const app = express();
  app.use("/api/admin", router);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  try {
    const url = `http://127.0.0.1:${server.address().port}/api/admin/ebooks/${ebookId}`;
    const remove = token => fetch(url, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
    assert.equal((await remove()).status, 401);
    assert.equal((await remove("invalid-session")).status, 401);
    // Editable user_metadata says admin, but the database role is customer.
    assert.equal((await remove("customer-session")).status, 403);
    assert.equal(api.state.deletions.length, 0);
    const response = await remove("admin-session");
    assert.equal(response.status, 200);
    assert.equal((await response.json()).deletedId, ebookId);
    assert.deepEqual(api.state.deletions, [ebookId]);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
