import { getRazorpayMode } from "./razorpayCheckoutOptions.mjs";

// Public checkout metadata: no customer login or Supabase token is required.
export async function fetchPaymentMethods({ signal, fetchImpl = fetch, timeoutMs = 10000 } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, timeoutMs);
  try {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetchImpl(`${api}/api/payment/methods`, { signal: controller.signal, cache: "no-store" });
    const data = await response.json();
    if (!response.ok || data.success !== true || getRazorpayMode(data.keyId) !== data.mode || data.mode === "unknown" || typeof data.upi !== "boolean") {
      throw new Error("Payment methods could not be checked.");
    }
    return { keyId: data.keyId, mode: data.mode, upi: data.upi };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
