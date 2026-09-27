const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const webhookSecret = "w".repeat(32);
const payment = { id: "pay_test", order_id: "order_test", amount: 49900, currency: "INR", status: "captured", created_at: 1700000000, method: "upi" };

function setup(options = {}) {
  const state = {
    transaction: { id: "tx_test", ebook_id: "book_test", razorpay_order_id: "order_test", amount_paise: 49900, currency: "INR", status: "captured", customer_email: "buyer@example.test", ebooks: { id: "book_test", title: "Book", file_path: "private.pdf" }, ...options.transaction },
    download: { id: "download_test", transaction_id: "tx_test", ebook_id: "book_test", expires_at: new Date(Date.now() + 60000).toISOString(), download_count: 0, download_limit: 3, ebooks: { file_path: "private.pdf" }, ...options.download },
    emails: 0, signings: 0, changes: [],
  };
  const db = {
    from(table) {
      let values;
      const filters = [];
      const query = {
        select() { return this; }, eq(key, value) { filters.push([key, value]); return this; },
        lt() { return this; }, update(input) { values = input; return this; },
        single: run, maybeSingle: run, then(resolve, reject) { return run().then(resolve, reject); },
      };
      async function run() {
        const row = table === "transactions" ? state.transaction : state.download;
        if (table === "downloads" && options.notFound) return { data: null, error: null };
        if (values) {
          if (table === "downloads") {
            assert.ok(filters.some(([key, value]) => key === "download_count" && value === state.download.download_count), "Use compare-and-set for the counter");
            if (options.claimMiss) return { data: null, error: null };
          }
          state.changes.push({ table, values });
          Object.assign(row, values);
        }
        return { data: { ...row }, error: null };
      }
      return query;
    },
    storage: { from(bucket) {
      assert.equal(bucket, "ebook-files");
      return { async createSignedUrl(filename, seconds, settings) {
        state.signings++;
        assert.equal(filename, "private.pdf");
        if (settings) assert.equal(settings.download, true);
        assert.ok(seconds > 0 && seconds <= 300);
        if (options.signingError) return { data: null, error: {} };
        return { data: { signedUrl: "https://storage.example.test/private-download" }, error: null };
      } };
    } },
  };
  const context = { module: { exports: {} }, Buffer, console: { error() {} },
    process: { env: { RAZORPAY_WEBHOOK_SECRET: Object.hasOwn(options, "secret") ? options.secret : webhookSecret, RAZORPAY_KEY_SECRET: "x".repeat(32), PUBLIC_API_URL: "https://api.example.test" } },
    require(name) {
      if (name === "crypto") return crypto;
      if (name === "../services/publicApiOrigin") return require(name);
      if (name === "../config/supabase") return db;
      if (name === "../services/razorpayService") return {};
      if (name === "../services/emailService") return { async sendPurchaseEmail() { state.emails++; } };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../controllers/paymentController.js"), "utf8"), context);
  async function invoke(method, request) {
    const result = { status: 200, headers: {} };
    const response = {
      status(code) { result.status = code; return this; }, json(body) { result.body = body; }, send(body) { result.body = body; },
      setHeader(name, value) { result.headers[name] = value; }, redirect(code, url) { result.status = code; result.url = url; },
    };
    await context.module.exports[method](request, response, error => { result.status = error.status || 500; result.error = error.message; });
    return result;
  }
  return { state, download: () => invoke("downloadEbook", { params: { downloadId: "download_test" } }),
    webhook: (overrides = {}, secret = webhookSecret) => {
      const body = Buffer.from(JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { ...payment, ...overrides } } } }));
      const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
      return invoke("razorpayWebhook", { body, headers: { "x-razorpay-signature": signature } });
    },
  };
}

test("webhooks fail closed with missing, placeholder or incorrect secrets", async () => {
  for (const secret of ["", undefined, "YOUR_WEBHOOK_SECRET", "placeholder"]) {
    const api = setup({ secret });
    assert.equal((await api.webhook({}, secret || "")).status, 400);
    assert.equal(api.state.changes.length, 0);
    assert.equal(api.state.emails, 0);
  }
  assert.equal((await setup().webhook({}, "wrong-secret")).status, 400);
});

test("signed webhooks reject mismatched or uncaptured payments", async () => {
  for (const changes of [{ amount: 1 }, { currency: "USD" }, { status: "authorized" }, { order_id: "order_other" }]) {
    const api = setup();
    assert.equal((await api.webhook(changes)).status, 409);
    assert.equal(api.state.changes.length, 0);
    assert.equal(api.state.emails, 0);
  }
  const refunded = setup({ transaction: { status: "refunded" } });
  assert.equal((await refunded.webhook()).status, 409);
});

test("matching captured webhook sends email once on sequential retries", async () => {
  const api = setup();
  assert.equal((await api.webhook()).status, 200);
  assert.equal(api.state.transaction.webhook_received, true);
  assert.equal(api.state.emails, 1);
  assert.equal((await api.webhook()).status, 200);
  assert.equal(api.state.emails, 1);
});

test("verified download triggers a file download and enforces its click limit", async () => {
  const api = setup();
  for (let count = 1; count <= 3; count++) {
    const result = await api.download();
    assert.equal(result.status, 302);
    assert.equal(result.headers["Cache-Control"], "no-store");
    assert.equal(result.url, "https://storage.example.test/private-download");
    assert.equal(api.state.download.download_count, count);
  }
  assert.equal((await api.download()).status, 403);
  assert.equal(api.state.signings, 3);
});

test("missing, expired, unverified or refunded purchases do not release ebooks", async () => {
  for (const [options, status] of [
    [{ notFound: true }, 404],
    [{ download: { expires_at: "2000-01-01T00:00:00Z" } }, 410],
    [{ download: { expires_at: "invalid" } }, 410],
    [{ transaction: { status: "created" } }, 403],
    [{ transaction: { status: "refunded" } }, 403],
    [{ transaction: { ebook_id: "another-book" } }, 403],
  ]) {
    const api = setup(options);
    assert.equal((await api.download()).status, status);
    assert.equal(api.state.signings, 0);
    assert.equal(api.state.changes.length, 0);
  }
});

test("file preparation failures do not consume a download attempt", async () => {
  const api = setup({ signingError: true });
  assert.equal((await api.download()).status, 502);
  assert.equal(api.state.download.download_count, 0);
});

test("concurrent download claims cannot bypass the download counter", async () => {
  const api = setup({ claimMiss: true });
  const result = await api.download();
  assert.equal(result.status, 409);
  assert.equal(result.url, undefined);
  assert.equal(api.state.download.download_count, 0);
});
