const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");

function setup(options = {}) {
  const state = { orders: 0, transactions: 0, checks: 0 };
  const ebook = { id: "book_test", title: "Book", price: 499, currency: "INR", file_path: "book.pdf" };
  const context = { module: { exports: {} }, Buffer, process: { env: { RAZORPAY_KEY_ID: "test-key", ...options.env } },
    require(name) {
      if (name === "crypto") return crypto;
      if (name === "../services/publicApiOrigin") return require(name);
      if (name === "../services/emailService") return { sendPurchaseEmail() { assert.fail("Creating an order must never send the ebook"); } };
      if (name === "../services/razorpayService") return { orders: { async create(order) {
        state.orders++;
        assert.equal(state.checks, 1);
        assert.equal(order.amount, 49900, "Amount must come from stored price, not browser input");
        assert.equal(order.currency, "INR");
        if (options.providerFailure) throw Object.assign(new Error("Provider unavailable"), { status: 502 });
        return { id: "order_test", amount: 49900, currency: "INR" };
      } } };
      if (name === "../config/supabase") return {
        from(table) {
          return { select() { return this; }, eq() { return this; },
            insert(row) { state.transactions++; assert.equal(row.status, "created"); return this; },
            async single() { return { data: table === "ebooks" ? ebook : { id: "tx_test" }, error: null }; },
          };
        },
        storage: { from(bucket) { assert.equal(bucket, "ebook-files"); return { async createSignedUrl(filename) {
          state.checks++;
          assert.equal(filename, "book.pdf");
          return options.missingFile ? { error: {}, data: null } : { data: { signedUrl: "https://storage.example.test/private" }, error: null };
        } }; } },
      };
      throw new Error(`Unexpected dependency ${name}`);
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../controllers/paymentController.js"), "utf8"), context);
  return { state, async create() {
    const result = { status: 200 };
    const res = { status(code) { result.status = code; return this; }, json(body) { result.body = body; } };
    await context.module.exports.createRazorpayOrder({ body: { ebookId: "book_test", firstName: "Test", lastName: "Buyer", email: "buyer@example.test", phone: "0000000000", amount: 1 } }, res, error => { result.status = error.status || 500; });
    return result;
  } };
}

test("orders use stored prices and require an available ebook before contacting Razorpay", async () => {
  const api = setup();
  const result = await api.create();
  assert.equal(result.status, 200);
  assert.equal(result.body.amount, 49900);
  assert.equal(api.state.orders, 1);
  assert.equal(api.state.transactions, 1);
});

test("missing ebooks cannot create a payment order or a transaction", async () => {
  const api = setup({ missingFile: true });
  const result = await api.create();
  assert.equal(result.status, 409);
  assert.match(result.body.message, /No payment has been started/);
  assert.equal(api.state.orders, 0);
  assert.equal(api.state.transactions, 0);
});

test("a failed order request cannot be reported as a successful purchase", async () => {
  const api = setup({ providerFailure: true });
  assert.equal((await api.create()).status, 502);
  assert.equal(api.state.transactions, 0);
});

test("production cannot take payment while email links point to localhost or no API", async () => {
  for (const PUBLIC_API_URL of [undefined, "http://localhost:5000", "https://localhost:5000"]) {
    const api = setup({ env: { NODE_ENV: "production", PUBLIC_API_URL } });
    assert.equal((await api.create()).status, 503);
    assert.equal(api.state.orders, 0);
    assert.equal(api.state.transactions, 0);
  }
});
