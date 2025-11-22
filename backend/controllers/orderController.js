const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// ✅ Save or Update Shipping Address
const saveShippingAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const { fullName, phoneNumber, line1, line2, city, state, postalCode } = req.body;

    if (!fullName || !phoneNumber || !line1 || !city || !state || !postalCode) {
      return res.status(400).json({ message: "All required address fields must be provided" });
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

    order.shippingAddress = { fullName, phoneNumber, line1, line2, city, state, postalCode };
    await order.save();

    res.status(200).json({
      success: true,
      message: "Shipping address saved successfully",
      shippingAddress: order.shippingAddress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while saving shipping address" });
  }
};

// ✅ Place COD Order with Size-Based Stock Management
const placeCODOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { totalPrice: clientTotal } = req.body;
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty. Cannot place order." });
    }

    // Step 1: Validate and update stock
    for (const item of cart.products) {
      const product = await Product.findById(item.productId._id);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId?.name || "Unknown"}` });
      }

      const sizeObj = product.sizes.find((s) => s.size === item.size);
      if (!sizeObj) {
        return res.status(400).json({
          message: `Size "${item.size}" not available for product "${product.name}"`,
        });
      }

      if (sizeObj.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}" - Size ${item.size}. Available: ${sizeObj.stock}`,
        });
      }

      sizeObj.stock -= item.quantity;
      await product.save();
    }

    // Step 2: Calculate totals
    const backendTotal = cart.products.reduce(
      (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
      0
    );

    const shippingCharge = 15;
    const deliveryCharges = 50;
    const finalTotal = Math.round(backendTotal + shippingCharge + deliveryCharges);

    if (clientTotal && Math.abs(clientTotal - backendTotal) > 2) {
    }

    // Step 3: Get shipping address
    const pendingOrder = await Order.findOne({ user: userId, status: "pending" });
    if (!pendingOrder || !pendingOrder.shippingAddress) {
      return res.status(400).json({ message: "No saved address found" });
    }

    // Step 4: Create new order
    const newOrder = new Order({
      user: userId,
      shippingAddress: pendingOrder.shippingAddress,
      items: cart.products.map((item) => ({
        productId: item.productId?._id || item.productId,
        name: item.productId?.name,
        quantity: item.quantity,
        size: item.size,
        price: item.productId?.price,
        image: item.productId?.image,
      })),
      totalPrice: finalTotal,
      paymentMethod: "COD",
      paymentStatus: "pending",
      status: "pending",
    });

    await newOrder.save();

    // Step 5: Clear cart and pending order
    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();
    await Order.deleteOne({ _id: pendingOrder._id });

    res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while placing order" });
  }
};

// ✅ Get all orders for the logged-in user
const getAllUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ user: userId })
      .populate("items.productId", "name brand price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching user orders" });
  }
};

// ✅ Get all orders (admin only) - FIXED VERSION
const getAllOrders = async (req, res) => {
  try {
    
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.productId", "name brand price image")
      .sort({ createdAt: -1 });


    // ✅ FIXED: Return 200 with empty array instead of 404
    res.status(200).json({
      success: true,
      message: orders.length === 0 ? "No orders yet" : "All orders fetched successfully",
      totalOrders: orders.length,
      orders: orders, // Always return array (empty or filled)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching all orders",
      error: error.message 
    });
  }
};

// ✅ Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "shipping", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      updatedOrder: order,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error while updating order status",
      error: error.message 
    });
  }
};

module.exports = {
  saveShippingAddress,
  placeCODOrder,
  getAllUserOrders,
  getAllOrders,
  updateOrderStatus,
};