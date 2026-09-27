const test = require("node:test");
const assert = require("node:assert/strict");
const completed = { paymentVerified: true, paymentStatus: "captured", download: { url: "/download/book" }, emailAddress: "buyer@example.test" };

test("confirmation clearly shows verified payment, download and the actual email recipient", async () => {
  const { purchaseConfirmation } = await import("../../client/lib/purchaseConfirmation.mjs");
  const result = purchaseConfirmation({ ...completed, emailSent: true });
  assert.equal(result.title, "Payment verified");
  assert.match(result.description, /ready to download/);
  assert.equal(result.emailTitle, "Email sent");
  assert.match(result.emailDescription, /download link and payment receipt/);
  assert.match(result.emailDescription, /buyer@example.test/);
});

test("failed or unknown email delivery never claims the email was sent", async () => {
  const { purchaseConfirmation } = await import("../../client/lib/purchaseConfirmation.mjs");
  for (const emailSent of [false, undefined, "true"]) {
    const result = purchaseConfirmation({ ...completed, emailSent });
    assert.equal(result.title, "Payment verified");
    assert.equal(result.emailTitle, "Email not sent yet");
    assert.match(result.emailDescription, /not be charged again/);
    assert.match(result.emailDescription, /Download your ebook now/);
  }
});

test("pending, failed or unverified payments cannot show a verified confirmation", async () => {
  const { purchaseConfirmation } = await import("../../client/lib/purchaseConfirmation.mjs");
  for (const result of [null, {}, { ...completed, paymentVerified: false }, { ...completed, paymentStatus: "failed" }, { ...completed, paymentStatus: "authorized" }, { ...completed, download: null }]) {
    assert.equal(purchaseConfirmation(result), null);
  }
});
