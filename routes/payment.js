const express = require("express");
const router = express.Router();

const {
  sendRazorpayKey,
  sendStripeKey,
  captureStripePayment,
  captureRazorpayPayment} = require("../controllers/payment");

const { userMiddleware } = require("../middlewares/user");

router.route("/stripekey").get(userMiddleware, sendStripeKey);
router.route("/razorpaykey").get(userMiddleware, sendRazorpayKey);

router.route("/payment/stripe").post(userMiddleware, captureStripePayment);
router.route("/payment/razorpay").post(userMiddleware, captureRazorpayPayment);

module.exports = router;
