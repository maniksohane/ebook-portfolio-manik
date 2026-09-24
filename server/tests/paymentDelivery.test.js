const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../controllers/paymentController.js"), "utf8");
const signingKey = "x".repeat(32);
const proof = {
  razorpayPaymentId: "pay_test", razorpayOrderId: "order_test",
  razorpaySignature: crypto.createHmac("sha256", signingKey).update("order_test|pay_test").digest("hex"),
};

function setup(options = {}) {
  const state = {
    transaction: { id: "tx_test", ebook_id: "book_test", status: "created", razorpay_order_id: "order_test", amount_paise: 49900, currency: "INR", customer_email: "buyer@example.test", ebooks: { id: "book_test", title: "Test book", file_path: "book.pdf" } },
    downloads: [], emails: 0, emailFailure: options.emailFailure,
  };
  const db = { from(table) {
    let action = "select", values;
    const conditions = [];
    const query = {
      select() { return query; }, eq(k, v) { conditions.push([k, v]); return query; },
      update(v) { action = "update"; values = v; return query; },
      insert(v) { action = "insert"; values = v; return query; },
      single: execute, maybeSingle: execute, then(resolve, reject) { return execute().then(resolve, reject); },
    };
    async function execute() {
      if (table === "transactions") {
        if (action === "update") {
          if (options.emailStatusFailure && Object.keys(values).some(k => k.startsWith("delivery_email_"))) {
            return { error: { code: "DATABASE_ERROR" }, data: null };
          }
          Object.assign(state.transaction, values);
        }
        return { data: { ...state.transaction }, error: null };
      }
      if (table === "downloads") {
        if (action === "insert") {
          const row = { id: `download_${state.downloads.length + 1}`, ...values };
          state.downloads.push(row);
          return { data: row, error: null };
        }
        return { data: state.downloads.find(row => conditions.every(([k, v]) => row[k] === v)) || null, error: null };
      }
      throw new Error(`Unexpected table ${table}`);
    }
    return query;
  } };
  const context = {
    module: { exports: {} }, Buffer,
    process: { env: { RAZORPAY_KEY_SECRET: signingKey, PUBLIC_API_URL: "https://example.test" } },
    console: { error() {} },
    require(name) {
      if (name === "crypto") return crypto;
      if (name === "../config/supabase") return db;
      if (name === "../services/razorpayService") return { payments: { fetch: async () => ({ order_id: "order_test", amount: 49900, status: "captured", method: "card", created_at: 1700000000, ...options.payment }) } };
      if (name === "../services/emailService") return { sendPurchaseEmail: async () => {
        state.emails++;
        if (state.emailFailure) throw Object.assign(new Error("Gmail authentication failed."), { code: "EMAIL_AUTH_FAILED" });
        return { id: "message_test" };
      } };
      throw new Error(`Unexpected dependency ${name}`);
    },
  };
  vm.runInNewContext(source, context);
  return { state, async verify(body = proof) {
    const result = { status: 200 };
    const response = { status(n) { result.status = n; return this; }, json(data) { result.body = data; return this; } };
    await context.module.exports.verifyRazorpayPayment({ body }, response, error => { result.status = error.status || 500; result.error = error; });
    return result;
  } };
}

test("capture reports email acceptance independently from payment success", async () => {
  const api = setup();
  const result = await api.verify();
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(result.body.emailSent, true);
  assert.match(result.body.download.url, /download/);
  assert.equal(api.state.transaction.status, "captured");
  assert.ok(api.state.transaction.delivery_email_sent_at);
  assert.doesNotMatch(result.body.message, /domain|verified/);
});

test("email rejection preserves the paid download and records the failure", async () => {
  const api = setup({ emailFailure: true });
  const result = await api.verify();
  assert.equal(result.status, 200);
  assert.equal(result.body.emailSent, false);
  assert.ok(result.body.download.url);
  assert.equal(api.state.transaction.status, "captured");
  assert.match(api.state.transaction.delivery_email_error, /Gmail/);
  assert.doesNotMatch(result.body.emailMessage, /domain|App Password|SMTP/);
});

test("retry after email repair reuses the delivery, then skips already sent emails", async () => {
  const api = setup({ emailFailure: true });
  const first = await api.verify();
  api.state.emailFailure = false;
  const retry = await api.verify();
  assert.equal(retry.body.emailSent, true);
  assert.equal(retry.body.download.url, first.body.download.url);
  assert.equal(api.state.downloads.length, 1);
  assert.equal(api.state.transaction.delivery_email_error, null);
  await api.verify();
  assert.equal(api.state.emails, 2);
});

test("delivery-status write failure does not hide an accepted email or download", async () => {
  const api = setup({ emailStatusFailure: true });
  const result = await api.verify();
  assert.equal(result.status, 200);
  assert.equal(result.body.emailSent, true);
  assert.ok(result.body.download.url);
});

test("uncaptured or mismatched payments never receive a delivery", async () => {
  for (const payment of [{ status: "authorized" }, { amount: 1 }, { order_id: "different_order" }]) {
    const api = setup({ payment });
    const result = await api.verify();
    assert.equal(result.status, 409);
    assert.equal(api.state.emails, 0);
    assert.equal(api.state.downloads.length, 0);
  }
});

test("incomplete or invalid payment proof does not send an email", async () => {
  const api = setup();
  assert.equal((await api.verify({})).status, 400);
  assert.equal((await api.verify({ ...proof, razorpaySignature: "invalid" })).status, 400);
  assert.equal(api.state.emails, 0);
});
