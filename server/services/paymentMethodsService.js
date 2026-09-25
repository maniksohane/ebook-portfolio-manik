// The public Methods API requires Key ID only, not the Orders API's secret.
const METHODS_URL = "https://api.razorpay.com/v1/methods";

function createPaymentMethodsService({ fetchImpl = fetch, getKeyId = () => process.env.RAZORPAY_KEY_ID, now = Date.now, ttlMs = 60000 } = {}) {
  let cached;
  let inFlight;

  async function readMethods(keyId) {
    const mode = keyId.startsWith("rzp_test_") ? "test" : "live";
    const response = await fetchImpl(METHODS_URL, {
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:`).toString("base64")}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Payment methods are temporarily unavailable.");
    const data = await response.json();
    if (data?.entity !== "methods" || typeof data.upi !== "boolean") {
      throw new Error("Payment methods are temporarily unavailable.");
    }
    // Intent may be advertised in test mode even though its checkout flow is
    // live-only. Do not mistake that flag for an available sandbox UPI method.
    const result = { keyId, mode, upi: data.upi || (mode === "live" && data.upi_intent === true) };
    cached = { keyId, expiresAt: now() + ttlMs, result };
    return result;
  }

  return async function getPaymentMethods() {
    const keyId = getKeyId();
    if (typeof keyId !== "string" || !/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) {
      throw new Error("Payment methods are not configured.");
    }
    if (cached?.keyId === keyId && cached.expiresAt > now()) return cached.result;
    if (inFlight?.keyId === keyId) return inFlight.promise;
    const request = { keyId, promise: readMethods(keyId) };
    inFlight = request;
    try { return await request.promise; }
    finally { if (inFlight === request) inFlight = null; }
  };
}

module.exports = { createPaymentMethodsService };
