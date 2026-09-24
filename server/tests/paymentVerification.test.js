const test = require("node:test");
const assert = require("node:assert/strict");
const helper = () => import("../../client/lib/paymentVerification.mjs");
const details = { razorpayOrderId: "order_test", razorpayPaymentId: "pay_test", razorpaySignature: "proof_test" };

test("a paid purchase never offers another payment, even if its retry proof is lost", async () => {
  const { checkoutAction } = await helper();
  assert.equal(checkoutAction({}), "pay");
  assert.equal(checkoutAction({ paymentDetails: details }), "verify");
  assert.equal(checkoutAction({ paymentDetails: details, download: { url: "/book" }, emailSent: false }), "email");
  assert.equal(checkoutAction({ paymentDetails: details, download: { url: "/book" }, emailSent: true }), "done");
  assert.equal(checkoutAction({ download: { url: "/book" } }), "done");
});

test("retry posts the existing payment proof only to verification, never create-order", async () => {
  const { verifyPaymentDetails } = await helper();
  let called = 0;
  const result = await verifyPaymentDetails(details, { fetchImpl: async (url, options) => {
    called++;
    assert.ok(url.endsWith("/api/payment/verify-payment"));
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), details);
    return { ok: true, json: async () => ({ success: true, emailSent: false, download: { url: "/book" } }) };
  } });
  assert.equal(called, 1);
  assert.equal(result.emailSent, false);
});

test("pending capture and malformed success responses stay recoverable", async () => {
  const { verifyPaymentDetails } = await helper();
  for (const response of [{ ok: false, json: async () => ({ message: "pending" }) }, { ok: true, json: async () => ({ success: true }) }]) {
    await assert.rejects(verifyPaymentDetails(details, { fetchImpl: async () => response }), /do not pay again/);
  }
});

test("incomplete proof is rejected without a request", async () => {
  const { verifyPaymentDetails } = await helper();
  await assert.rejects(verifyPaymentDetails({}, { fetchImpl: () => assert.fail("Must not request") }), /incomplete/);
});

test("stalled verification is cancelled", async () => {
  const { verifyPaymentDetails } = await helper();
  await assert.rejects(verifyPaymentDetails(details, { timeoutMs: 10, fetchImpl: (_, { signal }) => new Promise((_, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  }) }), /aborted/);
});
