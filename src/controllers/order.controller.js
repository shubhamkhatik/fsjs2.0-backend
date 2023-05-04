import Product from "../models/product.schema.js";
import Coupon from "../models/coupon.schema.js";
import Order from "../models/order.schema.js";
import asyncHandler from "../service/asyncHandler.js";
import CustomError from "../utils/customError.js";
import razorpay from "../config/razorpay.config.js";

import OrderStatus from "../utils/orderStatus.js";
export const generateRazorpayOrderId = asyncHandler(async (req, res) => {
  const { products, couponCode } = req.body;

  if (!products || products.length === 0) {
    throw new CustomError("No product found in req", 400);
  }
  let totalAmount = 0;
  let discountAmount = 0;

  // TODO: DO product calculation based on DB calls

  let productPriceCalc = Promise.all(
    products.map(async (product) => {
      const { productId, count } = product;
      const productFromDB = await Product.findById(productId);
      if (!productFromDB) {
        throw new CustomError("No product found in db", 400);
      }
      if (productFromDB.stock < count) {
        return res.status(400).json({
          error: "Product quantity not in stock",
        });
      }
      totalAmount += productFromDB.price * count;
    })
  );

  await productPriceCalc;

  //todo: check for coupon discount, if applicable
  if (couponCode) {
    const validCoupon = await Coupon.find({ code: couponCode, active: true });
    if (!validCoupon) {
      throw new CustomError("coupon is not valid", 400);
    }
    discountAmount = validCoupon.discount;
    totalAmount -= discountAmount;
  }

  const options = {
    amount: Math.round(totalAmount * 100),
    currency: "INR",
    receipt: `receipt_${new Date().getTime()}`,
  };
  const order = await razorpay.orders.create(options);

  if (!order) {
    throw new CustomError("UNable to generate order", 400);
  }

  res.status(200).json({
    success: true,
    message: "razorpay order id generated successfully",
    order,
  });
});

// Todo: add order in database and update product stock
export const generateOrder = asyncHandler(async (req, res) => {
  const { user } = req;
  const { transactionId, products, coupon, address, phoneNumber, amount } =
    req.body;

  // Validate input data
  if (
    !transactionId ||
    !Array.isArray(products) ||
    products.length === 0 ||
    !coupon ||
    !address ||
    !phoneNumber ||
    !amount
  ) {
    res.status(400).json({ error: "Invalid input data" });
    return;
  }

 
//session define in middleware
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const session = req.session;
    // Update product stock and sold quantity
    const productUpdates = products.map(async (product) => {
      const { productId, count } = product;
      const productFromDB = await Product.findById(productId).session(session);
      if (!productFromDB) {
        throw new CustomError("No product found in db", 400);
      }
      productFromDB.stock -= count;
      productFromDB.sold += count;
      await productFromDB.save();
    });
    await Promise.all(productUpdates);

    const createOrder = await Order.create({
      product: products,
      transactionId,
      coupon,
      address,
      phoneNumber,
      amount,
      user,
    },
    {session});
    // Create order in another way
    // const order = new Order({
    //   product: products,
    //   transactionId,
    //   coupon,
    //   address,
    //   phoneNumber,
    //   amount,
    //   user: user,
    // });
    // const createOrder = await order.save({ session });

    if (!createOrder) {
      throw new CustomError("Error while generating order", 404);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Order successfully created",
      user,
      order: createOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Handle errors
    if (error instanceof CustomError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});








//Todo: get only my orders
//in isLoggedin middelware we r saved name email and role in req.user
export const getMyOrders = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const myOrder = await Order.find({ email: email });
  if (!myOrder) {
    throw new CustomError("Order not found", 400);
  }
  res.status(200).json({
    success: true,
    order: myOrder,
  });
});

//Todo: get all my orders: Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const adminOrder = await Order.find({});
  if (!adminOrder) {
    throw new CustomError("Order not found", 400);
  }
  res.status(200).json({
    success: true,
    order: adminOrder,
  });
});

//Todo: update order Status: Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id: orderid } = req.params;
  const { status } = req.body;
  if (!Object.values(OrderStatus).includes(status)) {
    throw new CustomError("invalid status", 404);
  }

  const orderUpdate = await Order.findByIdAndUpdate(
    orderid,
    {
      status: status,
    },
    {
      new: true, //return updated collection not older one
      runValidators: true, //check validation which is mention in schema like maxlength
    }
  );

  if (!orderUpdate) {
    throw new CustomError("Order not found", 400);
  }
  res.status(200).json({
    success: true,
    status: orderUpdate.status,
    order: orderUpdate,
  });
});
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id: orderid } = req.params;
  const { status } = req.body;
  if (
    !Object.values(OrderStatus).includes(status) &&
    status !== OrderStatus.CANCELLED
  ) {
    throw new CustomError("invalid status pass CANCELLED", 404);
  }

  const orderUpdate = await Order.findByIdAndUpdate(
    orderid,
    {
      status: status,
    },
    {
      new: true, //return updated collection not older one
      runValidators: true, //check validation which is mention in schema like maxlength
    }
  );

  if (!orderUpdate) {
    throw new CustomError("Order not found", 400);
  }
  res.status(200).json({
    success: true,
    status: orderUpdate.status,
    order: orderUpdate,
  });
});
