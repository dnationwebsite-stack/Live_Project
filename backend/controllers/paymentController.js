const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order (Authenticated)
exports.createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { amount, currency = "INR" } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // in paise
      currency,
      receipt: `receipt_${user._id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        ...order,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("❌ Razorpay Order Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 🔐 Step 1: Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // ✅ Step 2: Fetch user cart
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty. Cannot place order." });
    }

    // ✅ Step 3: Size-wise stock validation & deduction
    const stockUpdates = [];
    for (const item of cart.products) {
      const product = await Product.findById(item.productId._id);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId?.name || "Unknown"}` });
      }

      const sizeObj = product.sizes.find(s => s.size === item.size);
      if (!sizeObj) {
        return res.status(400).json({ message: `Size "${item.size}" not available for "${product.name}"` });
      }

      if (sizeObj.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}" (Size ${item.size})`,
        });
      }

      sizeObj.stock -= item.quantity;
      await product.save();

      stockUpdates.push({
        productName: product.name,
        size: item.size,
        newStock: sizeObj.stock,
      });
    }

    // ✅ Step 4: Recalculate backend total
    const backendTotal = cart.products.reduce((sum, item) => {
      const price = item.productId?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    const shippingCharge = 15;
    const deliveryCharge = 50;
    const finalTotal = Math.round(backendTotal + shippingCharge + deliveryCharge);

    // ✅ Step 5: Validate shipping address
    if (!orderDetails?.shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    // ✅ Step 6: Create new order
    const newOrder = new Order({
      user: userId,
      items: cart.products.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
        size: item.size,
        image: item.productId.image,
      })),
      shippingAddress: orderDetails.shippingAddress,
      totalPrice: finalTotal,
      paymentMethod: "Razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
      status: "pending",
    });

    await newOrder.save();

    // ✅ Step 7: Clear cart
    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();

    // ✅ Step 8: Respond success
    res.status(201).json({
      success: true,
      message: "✅ Online order placed successfully",
      orderId: newOrder._id,
      stockUpdates,
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment verification",
      error: error.message,
    });
  }
};


exports.createOrderInDB = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      totalAmount,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
    } = req.body;

    const order = await Order.create({
      userId: req.user._id,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod,
      paymentStatus: "paid",
      razorpayOrderId,
      razorpayPaymentId,
      orderStatus: "processing",
    });

    res.json({
      success: true,
      message: "Order created successfully",
      orderId: order._id,
      order,
    });
  } catch (err) {
    console.error("❌ Order Creation Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
