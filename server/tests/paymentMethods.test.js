const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createPaymentMethodsService } = require("../services/paymentMethodsService");
const client = import("../../client/lib/paymentMethods.mjs");
const testKey = "rzp_test_example";

test("Methods API authenticates with public Key ID only and filters its response", async () => {
  const getMethods = createPaymentMethodsService({
    getKeyId: () => testKey,
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://api.razorpay.com/v1/methods");
      assert.equal(Buffer.from(options.headers.Authorization.slice(6), "base64").toString(), `${testKey}:`);
      assert.ok(options.signal instanceof AbortSignal);
      return { ok: true, json: async () => ({ entity: "methods", upi: false, upi_intent: true, irrelevant: "not returned" }) };
    },
  });
  assert.deepEqual(await getMethods(), { keyId: testKey, mode: "test", upi: false });
});

test("supported sandbox UPI remains selectable", async () => {
  const getMethods = createPaymentMethodsService({ getKeyId: () => testKey, fetchImpl: async () => ({ ok: true, json: async () => ({ entity: "methods", upi: true }) }) });
  assert.equal((await getMethods()).upi, true);
});

test("live-mode intent capability is recognized without enabling test-mode intent", async () => {
  const getMethods = createPaymentMethodsService({ getKeyId: () => "rzp_live_example", fetchImpl: async () => ({ ok: true, json: async () => ({ entity: "methods", upi: false, upi_intent: true }) }) });
  assert.deepEqual(await getMethods(), { keyId: "rzp_live_example", mode: "live", upi: true });
});

test("availability lookups coalesce, expire and cannot use another key's cache", async () => {
  let currentKey = testKey, time = 0, calls = 0;
  const getMethods = createPaymentMethodsService({
    getKeyId: () => currentKey, now: () => time, ttlMs: 60,
    fetchImpl: async () => { calls++; return { ok: true, json: async () => ({ entity: "methods", upi: true }) }; },
  });
  await Promise.all([getMethods(), getMethods()]);
  await getMethods();
  assert.equal(calls, 1);
  time = 61;
  await getMethods();
  assert.equal(calls, 2);
  currentKey = "rzp_live_example";
  assert.equal((await getMethods()).mode, "live");
  assert.equal(calls, 3);
});

test("provider errors and malformed metadata never enable UPI or stay cached", async () => {
  for (const response of [{ ok: false }, { ok: true, json: async () => ({}) }, { ok: true, json: async () => ({ entity: "methods", upi: "false" }) }]) {
    let calls = 0;
    const getMethods = createPaymentMethodsService({ getKeyId: () => testKey, fetchImpl: async () => { calls++; return response; } });
    await assert.rejects(getMethods(), /temporarily unavailable/);
    await assert.rejects(getMethods(), /temporarily unavailable/);
    assert.equal(calls, 2);
  }
  const invalid = createPaymentMethodsService({ getKeyId: () => "", fetchImpl: () => assert.fail("Unexpected request") });
  await assert.rejects(invalid(), /not configured/);
});

test("public availability endpoint returns sanitized metadata and safe failures", async () => {
  const source = fs.readFileSync(path.join(__dirname, "../controllers/paymentMethodsController.js"), "utf8");
  for (const fail of [false, true]) {
    const context = { module: { exports: {} }, require: () => ({ createPaymentMethodsService: () => async () => {
      if (fail) throw new Error("Provider details that should stay private");
      return { keyId: testKey, mode: "test", upi: false };
    } }) };
    vm.runInNewContext(source, context);
    const result = { status: 200, headers: {} };
    const res = { set(k, v) { result.headers[k] = v; return this; }, status(n) { result.status = n; return this; }, json(body) { result.body = body; return this; } };
    await context.module.exports.paymentMethods({}, res);
    assert.equal(result.headers["Cache-Control"], "no-store");
    assert.equal(result.status, fail ? 503 : 200);
    assert.equal(result.body.success, !fail);
    assert.doesNotMatch(JSON.stringify(result.body), /Provider details/);
  }
});

test("client availability request is public, bounded and validates the key's mode", async () => {
  const { fetchPaymentMethods } = await client;
  const data = { success: true, keyId: testKey, mode: "test", upi: false };
  const result = await fetchPaymentMethods({ fetchImpl: async (url, options) => {
    assert.ok(url.endsWith("/api/payment/methods"));
    assert.equal(options.headers, undefined);
    assert.equal(options.cache, "no-store");
    return { ok: true, json: async () => data };
  } });
  assert.deepEqual(result, { keyId: testKey, mode: "test", upi: false });
  for (const invalid of [{ ...data, mode: "live" }, { ...data, upi: "false" }, { ...data, success: false }]) {
    await assert.rejects(fetchPaymentMethods({ fetchImpl: async () => ({ ok: true, json: async () => invalid }) }), /could not be checked/);
  }
});

test("stalled or dismissed availability checks can be cancelled", async () => {
  const { fetchPaymentMethods } = await client;
  const stalled = async (url, { signal }) => new Promise((resolve, reject) => {
    const abort = () => reject(new Error("Aborted"));
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  });
  await assert.rejects(fetchPaymentMethods({ fetchImpl: stalled, timeoutMs: 10 }), /Aborted/);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(fetchPaymentMethods({ fetchImpl: stalled, signal: controller.signal }), /Aborted/);
});
