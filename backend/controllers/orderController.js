const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

// ✅ Save/Update Shipping Address
const saveShippingAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { fullName, phoneNumber, line1, line2, city, state, postalCode } =
      req.body;

    // ✅ Validate address
    if (!fullName || !phoneNumber || !line1 || !city || !state || !postalCode) {
      return res
        .status(400)
        .json({ message: "All required address fields must be provided" });
    }

    let order = await Order.findOne({ user: userId, status: "pending" });

    if (!order) {
      order = new Order({
        user: userId,
        status: "pending",
        paymentMethod: "COD",
        paymentStatus: "pending",
        items: [],
        totalPrice: 0,
      });
    }

    order.shippingAddress = {
      fullName,
      phoneNumber,
      line1,
      line2,
      city,
      state,
      postalCode,
    };

    await order.save();

    return res.status(200).json({
      message: "Shipping address saved successfully",
      shippingAddress: order.shippingAddress,
    });
  } catch (error) {
    console.error("❌ Save Shipping Address Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const placeCODOrder = async (req, res) => {
  try {
    console.log("🟢 placeCODOrder API Hit");
    console.log("Logged in User ID:", req.user?.id);

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { totalPrice: clientTotal } = req.body;
    console.log("🟢 Request Body:", req.body);

    // ✅ 1. Fetch user's cart with populated product details
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    console.log("🟢 Cart Found:", cart);

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty. Cannot place order." });
    }

    // ✅ 2. Recalculate total to ensure consistency with backend
    const backendTotal = cart.products.reduce((sum, item) => {
      const price = item.productId?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    // ✅ Optional: small safety check between frontend & backend total
    if (clientTotal && Math.abs(clientTotal - backendTotal) > 2) {
      console.warn("⚠️ Frontend and backend totals mismatch");
    }

    // ✅ Add delivery charges / discounts if needed (optional)
    const shippingCharge = 50;
    const finalTotal = Math.round(backendTotal + shippingCharge);

    // ✅ Update cart totalPrice
    cart.totalPrice = finalTotal;
    await cart.save();

    // ✅ 3. Get saved address from pending order
    const pendingOrder = await Order.findOne({ user: userId, status: "pending" });
    if (!pendingOrder || !pendingOrder.shippingAddress) {
      return res.status(400).json({ message: "No saved address found" });
    }

    // ✅ 4. Create final confirmed COD order
    const newOrder = await Order.create({
      user: userId,
      shippingAddress: pendingOrder.shippingAddress,
      items: cart.products.map((item) => ({
        productId: item.productId?._id || item.productId,
        name: item.productId?.name,
        quantity: item.quantity,
        price: item.productId?.price,
        image: item.productId?.image,
      })),
      totalPrice: finalTotal, // ✅ Correctly calculated total
      paymentMethod: "COD",
      paymentStatus: "pending",
      status: "pending",
    });

    // ✅ 5. Clear the cart
    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();

    // ✅ 6. Delete the temporary pending order
    await pendingOrder.deleteOne();

    res.status(201).json({
      success: true,
      message: "✅ COD Order placed successfully",
      order: newOrder,
    });

  } catch (error) {
    console.error("❌ COD order error:", error);
    res.status(500).json({ message: "Server error while placing order" });
  }
};

module.exports = { placeCODOrder };


module.exports = { saveShippingAddress, placeCODOrder };
