const express = require("express");

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