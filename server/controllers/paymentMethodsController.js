const { createPaymentMethodsService } = require("../services/paymentMethodsService");
const getPaymentMethods = createPaymentMethodsService();

async function paymentMethods(req, res) {
  res.set("Cache-Control", "no-store");
  try {
    res.json({ success: true, ...await getPaymentMethods() });
  } catch {
    // Availability failures must not expose credentials or block default Checkout.
    res.status(503).json({ success: false, message: "Payment methods could not be checked. Razorpay will show the available options." });
  }
}

module.exports = { paymentMethods };
