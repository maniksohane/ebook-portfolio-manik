export function checkoutAction({ paymentDetails, download, emailSent }) {
  if (download?.url) return !paymentDetails || emailSent ? "done" : "email";
  return paymentDetails ? "verify" : "pay";
}

// Re-check the original payment. This endpoint never creates a new order.
export async function verifyPaymentDetails(details, { fetchImpl = fetch, timeoutMs = 45000 } = {}) {
  if (![details?.razorpayPaymentId, details?.razorpayOrderId, details?.razorpaySignature]
    .every((value) => typeof value === "string" && value.length > 0)) {
    throw new Error("The payment confirmation is incomplete. Please contact support; do not pay again.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetchImpl(`${api}/api/payment/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.download?.url) {
      throw new Error("Payment confirmation could not be completed. Please retry confirmation; do not pay again.");
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}
