export function getRazorpayMode(keyId) {
  if (typeof keyId !== "string") return "unknown";
  if (/^rzp_test_[A-Za-z0-9]+$/.test(keyId)) return "test";
  if (/^rzp_live_[A-Za-z0-9]+$/.test(keyId)) return "live";
  return "unknown";
}

// Use the key/amount returned with the server-created order, never client prices.
export function buildRazorpayCheckoutOptions({ order, title, buyer, preference = "upi" }) {
  const mode = getRazorpayMode(order?.keyId);
  if (mode === "unknown" || !order?.orderId || !Number.isSafeInteger(order.amount) || order.amount <= 0 || !/^[A-Z]{3}$/.test(order.currency || "")) {
    throw new Error("Payment settings could not be loaded. Please try again or contact support.");
  }
  const supportsUpi = order.currency === "INR";
  const preferUpi = supportsUpi && preference === "upi";
  const options = {
    key: order.keyId,
    order_id: order.orderId,
    amount: order.amount,
    currency: order.currency,
    name: "Manikya Publishing",
    description: title,
    prefill: {
      name: `${buyer.firstName} ${buyer.lastName}`,
      email: buyer.email,
      contact: buyer.phone,
      ...(preferUpi ? { method: "upi" } : {}),
    },
    theme: { color: "#2563eb" },
  };

  if (supportsUpi) {
    // Test mode uses Razorpay's simulated UPI flow. Intent and QR require live
    // mode, account activation and a supported device. Do not force them in test.
    const instrument = mode === "test"
      ? { method: "upi" }
      : { method: "upi", flows: ["qr", "intent"] };
    options.config = {
      display: {
        blocks: {
          upi: {
            name: mode === "test" ? "UPI (Test payment)" : "UPI apps & QR code",
            instruments: [instrument],
          },
        },
        sequence: preferUpi ? ["block.upi"] : ["card", "netbanking", "block.upi"],
        // Keep account-enabled alternatives available if UPI is unavailable.
        preferences: { show_default_blocks: true },
      },
    };
  }
  return options;
}
