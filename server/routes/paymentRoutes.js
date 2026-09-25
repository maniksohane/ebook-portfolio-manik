const express = require("express");
const { paymentMethods } = require("../controllers/paymentMethodsController");

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  downloadEbook,
  getPurchases,
} = require("../controllers/paymentController");

const {
  requireUser,
} = require("../middleware/auth");

const router = express.Router();

router.get("/methods", paymentMethods);

router.post(
  "/create-order",
  createRazorpayOrder
);

router.post(
  "/verify-payment",
  verifyRazorpayPayment
);

router.get(
  "/download/:downloadId",
  downloadEbook
);

router.get(
  "/purchases",
  requireUser,
  getPurchases
);

module.exports = router;
