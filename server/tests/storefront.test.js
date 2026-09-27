const test = require("node:test");
const assert = require("node:assert/strict");
const { getPublicApiOrigin } = require("../services/publicApiOrigin");

test("deployed API requests reject localhost, missing settings and non-HTTPS origins", async () => {
  const { resolveApiOrigin } = await import("../../client/lib/apiTransport.mjs");
  for (const value of ["", "http://localhost:5000", "https://localhost:5000", "https://127.0.0.1", "http://api.example.test", "https://project.supabase.co", "https://api.example.test/api", "https://user:password@api.example.test"]) {
    assert.throws(() => resolveApiOrigin({ value, production: true, pageOrigin: "https://store.example.test" }), /unavailable/);
  }
  assert.equal(resolveApiOrigin({ value: "https://api.example.test/", production: true }), "https://api.example.test");
  assert.equal(resolveApiOrigin({ value: "", production: false }), "http://localhost:5000");
  assert.throws(() => resolveApiOrigin({ value: "", production: true }), /unavailable/);
});

test("API responses distinguish JSON errors, missing routes, failures and cancellation", async () => {
  const { requestJson } = await import("../../client/lib/apiTransport.mjs");
  const call = (fetchImpl) => requestJson("/api/payment/create-order", {}, { apiOrigin: "https://api.example.test", fetchImpl });
  assert.deepEqual(await call(async () => new Response(JSON.stringify({ success: true }))), { success: true });
  await assert.rejects(call(async () => new Response("<html>404</html>", { status: 404 })), /unavailable/);
  await assert.rejects(call(async () => new Response(JSON.stringify({ message: "Invalid email" }), { status: 400 })), /Invalid email/);
  await assert.rejects(call(async () => new Response(JSON.stringify({ message: "private database error" }), { status: 500 })), /unavailable/);
  await assert.rejects(call(async () => { throw new TypeError("Failed to fetch"); }), /Could not reach/);
  await assert.rejects(requestJson("/api/health", {}, {
    apiOrigin: "https://api.example.test", timeoutMs: 5,
    fetchImpl: (_, { signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true })),
  }), /Could not reach/);
});

test("public catalogue queries published metadata, retains all books and maps covers", async () => {
  const { loadPublishedEbooks, PUBLIC_EBOOK_FIELDS } = await import("../../client/lib/catalogue.mjs");
  assert.doesNotMatch(PUBLIC_EBOOK_FIELDS, /file_path|preview_path|\*/);
  const rows = Array.from({ length: 5 }, (_, n) => ({ id: `book-${n}`, title: `Book ${n}`, cover_path: `cover-${n}.png` }));
  let failure = false;
  const query = {
    select(fields) { assert.equal(fields, PUBLIC_EBOOK_FIELDS); return this; },
    eq(field, value) { assert.equal(field, "is_published"); assert.equal(value, true); return this; },
    order(field, options) { assert.ok(["is_featured", "created_at"].includes(field)); assert.equal(options.ascending, false); return this; },
    abortSignal(signal) { assert.ok(signal); return this; },
    then(resolve) { return Promise.resolve({ data: failure ? null : rows, error: failure ? {} : null }).then(resolve); },
  };
  const client = {
    from(table) { assert.equal(table, "ebooks"); return query; },
    storage: { from(bucket) { assert.equal(bucket, "ebook-covers"); return { getPublicUrl: (path) => ({ data: { publicUrl: `https://storage.example.test/${path}` } }) }; } },
  };
  const result = await loadPublishedEbooks(client, { signal: new AbortController().signal });
  assert.equal(result.ebooks.length, 5);
  assert.equal(result.ebooks[0].coverImage, "https://storage.example.test/cover-0.png");
  failure = true;
  await assert.rejects(loadPublishedEbooks(client), /couldn't load/);
});

test("production purchase links require an explicit public API origin", () => {
  for (const PUBLIC_API_URL of [undefined, "http://localhost:5000", "https://localhost:5000", "http://api.example.test", "https://project.supabase.co", "https://api.example.test/api", "https://api.example.test?token=private"]) {
    assert.throws(() => getPublicApiOrigin({ NODE_ENV: "production", PUBLIC_API_URL }), /unavailable/);
  }
  assert.equal(getPublicApiOrigin({ NODE_ENV: "production", PUBLIC_API_URL: "https://api.example.test/" }), "https://api.example.test");
  assert.equal(getPublicApiOrigin({}), "http://localhost:5000");
});
