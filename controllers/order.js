const Order = require("../models/orders");
//for adjusting the stock accordingly with orders
// const Product = require("../models/product");

const bigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/cError");

exports.createOrder = bigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new customError("please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedInOrders = bigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new customError("please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});


// async function updateProductStock(productId, quantity) {
//   const product = await Product.findById(productId);
//
//   product.stock = product.stock - quantity;
//
//   await product.save({ validateBeforeSave: false });
// }
