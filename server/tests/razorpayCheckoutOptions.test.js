const test = require("node:test");
const assert = require("node:assert/strict");

const order = { keyId: "rzp_test_example", orderId: "order_example", amount: 49900, currency: "INR" };
const buyer = { firstName: "Test", lastName: "Buyer", email: "buyer@example.test", phone: "+919000000000" };
const args = { order, buyer, title: "Test ebook", availability: { keyId: order.keyId, mode: "test", upi: true } };
const helpers = import("../../client/lib/razorpayCheckoutOptions.mjs");

test("test UPI does not restrict Checkout to unsupported QR or intent flows", async () => {
  const { buildRazorpayCheckoutOptions } = await helpers;
  const options = buildRazorpayCheckoutOptions(args);
  assert.deepEqual(options.config.display.blocks.upi.instruments, [{ method: "upi" }]);
  assert.deepEqual(options.config.display.sequence, ["block.upi"]);
  assert.equal(options.config.display.preferences.show_default_blocks, true);
  assert.equal(options.prefill.method, "upi");
});

test("live UPI enables QR and app intent without inventing a payment QR", async () => {
  const { buildRazorpayCheckoutOptions } = await helpers;
  const options = buildRazorpayCheckoutOptions({ ...args, order: { ...order, keyId: "rzp_live_example" }, availability: { keyId: "rzp_live_example", mode: "live", upi: true } });
  assert.deepEqual(options.config.display.blocks.upi.instruments, [{ method: "upi", flows: ["qr", "intent"] }]);
  assert.match(options.config.display.blocks.upi.name, /QR/);
});

test("other methods preference retains UPI but does not preselect it", async () => {
  const { buildRazorpayCheckoutOptions } = await helpers;
  const options = buildRazorpayCheckoutOptions({ ...args, preference: "other" });
  assert.equal(options.prefill.method, undefined);
  assert.deepEqual(options.config.display.sequence, ["card", "netbanking", "block.upi"]);
  assert.equal(options.config.display.preferences.show_default_blocks, true);
});

test("Checkout uses only server order key, amount and currency", async () => {
  const { buildRazorpayCheckoutOptions } = await helpers;
  const options = buildRazorpayCheckoutOptions({ ...args, order: { ...order, amount: 12345 } });
  assert.equal(options.key, order.keyId);
  assert.equal(options.order_id, order.orderId);
  assert.equal(options.amount, 12345);
  assert.equal(options.currency, "INR");
  assert.equal(options.prefill.email, buyer.email);
  assert.equal(options.prefill.contact, buyer.phone);
  assert.equal(options.key_secret, undefined);
});

test("non-INR orders do not force UPI", async () => {
  const { buildRazorpayCheckoutOptions } = await helpers;
  const options = buildRazorpayCheckoutOptions({ ...args, order: { ...order, currency: "USD" } });
  assert.equal(options.config, undefined);
  assert.equal(options.prefill.method, undefined);
});

test("disabled, unknown or mismatched UPI availability never forces a UPI block", async () => {
  const { buildRazorpayCheckoutOptions } = await helpers;
  for (const availability of [undefined, null, { keyId: order.keyId, upi: false }, { keyId: "rzp_test_other", upi: true }]) {
    const options = buildRazorpayCheckoutOptions({ ...args, availability });
    assert.equal(options.config, undefined);
    assert.equal(options.prefill.method, undefined);
    assert.equal(options.order_id, order.orderId);
  }
});

test("missing or malformed server order prevents checkout", async () => {
  const { buildRazorpayCheckoutOptions, getRazorpayMode } = await helpers;
  for (const override of [{ keyId: "" }, { keyId: "not-a-razorpay-key" }, { orderId: "" }, { amount: 0 }, { amount: NaN }, { amount: 1.5 }, { currency: "" }]) {
    assert.throws(() => buildRazorpayCheckoutOptions({ ...args, order: { ...order, ...override } }), /Payment settings/);
  }
  assert.throws(() => buildRazorpayCheckoutOptions({ ...args, order: null }), /Payment settings/);
  assert.equal(getRazorpayMode(undefined), "unknown");
  assert.equal(getRazorpayMode("rzp_test_example"), "test");
  assert.equal(getRazorpayMode("rzp_live_example"), "live");
});
