const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../services/emailService.js"), "utf8");
const purchase = () => ({
  transaction: { customer_email: "buyer@example.test", customer_first_name: "<b>Reader</b>", currency: "INR", amount_paise: 49900, razorpay_order_id: "order_test" },
  ebook: { title: "CRM & <script>guide</script>" },
  download: { url: "https://example.test/download/book?a=1&b=2", expiresAt: new Date(Date.now() + 86400000).toISOString() },
});

function load({ env = {}, sendError, verifyError, accepted = ["buyer@example.test"] } = {}) {
  const state = { transports: [], messages: [], closed: 0, verified: 0 };
  const context = {
    module: { exports: {} }, URL,
    process: { env: { SMTP_USER: "sender@gmail.com", SMTP_APP_PASSWORD: "x".repeat(16), EMAIL_FROM: "Publishing <sender@gmail.com>", ...env } },
    require(name) {
      assert.equal(name, "nodemailer");
      return { createTransport(options) {
        state.transports.push(options);
        return {
          async sendMail(message) { state.messages.push(message); if (sendError) throw sendError; return { accepted, messageId: "message_test" }; },
          async verify() { state.verified++; if (verifyError) throw verifyError; return true; },
          close() { state.closed++; },
        };
      } };
    },
  };
  vm.runInNewContext(source, context);
  return { ...context.module.exports, state };
}

test("Gmail uses TLS and sends an escaped ebook link and plain-text receipt", async () => {
  const service = load();
  const result = await service.sendPurchaseEmail(purchase());
  assert.equal(result.provider, "gmail");
  const options = service.state.transports[0];
  assert.equal(options.host, "smtp.gmail.com");
  assert.equal(options.port, 465);
  assert.equal(options.secure, true);
  assert.ok(options.socketTimeout <= 15000);
  assert.equal(options.disableFileAccess, true);
  assert.equal(options.disableUrlAccess, true);
  const message = service.state.messages[0];
  assert.equal(message.from, "Publishing <sender@gmail.com>");
  assert.equal(message.replyTo, "sender@gmail.com");
  assert.equal(message.to, "buyer@example.test");
  assert.match(message.html, /&lt;script&gt;/);
  assert.doesNotMatch(message.html, /<script>|<b>Reader/);
  assert.match(message.html, /a=1&amp;b=2/);
  assert.match(message.text, /Payment receipt/);
  assert.match(message.text, /INR 499\.00/);
  assert.match(message.text, /IST/);
  assert.equal(service.state.closed, 1);
});

test("missing or placeholder app passwords fail before a network connection", async () => {
  for (const value of ["", "YOUR_GMAIL_APP_PASSWORD", "short"]) {
    const service = load({ env: { SMTP_APP_PASSWORD: value } });
    await assert.rejects(service.sendPurchaseEmail(purchase()), { code: "EMAIL_NOT_CONFIGURED" });
    assert.equal(service.state.transports.length, 0);
  }
});

test("spaces in the Google App Password are removed", async () => {
  const service = load({ env: { SMTP_APP_PASSWORD: Array(4).fill("x".repeat(4)).join(" ") } });
  await service.verifyEmailConnection();
  assert.equal(service.state.transports[0].auth.pass.length, 16);
});

test("the old domain cannot be used as the Gmail sender", async () => {
  const service = load({ env: { EMAIL_FROM: "Publishing <books@example.test>" } });
  await assert.rejects(service.sendPurchaseEmail(purchase()), { code: "EMAIL_NOT_CONFIGURED" });
  assert.equal(service.state.transports.length, 0);
});

test("email check verifies authentication without sending", async () => {
  const service = load();
  const result = await service.verifyEmailConnection();
  assert.equal(result.sender, "sender@gmail.com");
  assert.equal(service.state.verified, 1);
  assert.equal(service.state.messages.length, 0);
  assert.equal(service.state.closed, 1);
});

test("SMTP errors are useful without leaking raw provider responses", async () => {
  for (const [code, expected] of [["EAUTH", "EMAIL_AUTH_FAILED"], ["ETIMEDOUT", "EMAIL_UNAVAILABLE"], ["EENVELOPE", "EMAIL_DELIVERY_FAILED"]]) {
    const service = load({ sendError: Object.assign(new Error("private provider response"), { code }) });
    await assert.rejects(service.sendPurchaseEmail(purchase()), (error) => {
      assert.equal(error.code, expected);
      assert.doesNotMatch(error.message, /private provider response/);
      return true;
    });
    assert.equal(service.state.closed, 1);
  }
});

test("BCC success does not hide rejection of the buyer", async () => {
  const service = load({ accepted: ["owner@example.test"], env: { OWNER_NOTIFICATION_EMAIL: "owner@example.test" } });
  await assert.rejects(service.sendPurchaseEmail(purchase()), { code: "EMAIL_DELIVERY_FAILED" });
});

test("expired links and invalid recipients are not emailed", async () => {
  const service = load();
  const expired = purchase();
  expired.download.expiresAt = "2000-01-01T00:00:00.000Z";
  await assert.rejects(service.sendPurchaseEmail(expired), { code: "EMAIL_DELIVERY_FAILED" });
  const invalid = purchase();
  invalid.transaction.customer_email = "invalid";
  await assert.rejects(service.sendPurchaseEmail(invalid), { code: "EMAIL_DELIVERY_FAILED" });
  assert.equal(service.state.messages.length, 0);
});
