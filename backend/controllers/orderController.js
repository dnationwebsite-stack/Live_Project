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

   const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.shippingAddress = { fullName, phoneNumber, line1, line2, city, state, postalCode };
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Shipping address saved successfully",
      shippingAddress: cart.shippingAddress,
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
    const pendingOrder = await Order.findOne({ user: userId, status: "pending" })
     .sort({ createdAt: 1 });
    if (!pendingOrder || !pendingOrder.shippingAddress) {
      return res.status(400).json({ message: "No saved address found" });
    }

    // Step 4: Create new order
    const newOrder = new Order({
      user: userId,
      shippingAddress: cart.shippingAddress,
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
      status: "confirmed",
    });

    await newOrder.save();

    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while placing order" });
  }
};

// orderController.js
const getAllUserOrders = async (req, res) => {
  ("========================================");
  ("📥 GET /api/order/my-orders called");
  ("========================================");
  
  try {
    // Log the entire req.user object
    ("🔍 req.user:", JSON.stringify(req.user, null, 2));
    
    const userId = req.user?.id || req.user?._id;
    ("🔍 Extracted userId:", userId);
    
    if (!userId) {
      ("❌ No userId found! req.user structure:", req.user);
      return res.status(401).json({ 
        message: "Unauthorized - No user ID",
        debug: { 
          hasReqUser: !!req.user,
          reqUserKeys: req.user ? Object.keys(req.user) : []
        }
      });
    }

    ("🔍 Querying orders for user:", userId);
    
    const orders = await Order.find({ 
      user: userId,
  $or: [
    { status: { $ne: "pending" } },           // ✅ all non-pending orders
    { status: "pending", "items.0": { $exists: true } } // ✅ pending orders that have items
  ]
})
      .populate("items.productId", "name brand price image")
      .sort({ createdAt: -1 });

    (`✅ Found ${orders.length} orders`);

    ("Orders", typeof orders);
    


    res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      totalOrders: orders.length,
      orders:orders,
    });
    
  } catch (error) {
    console.error("========================================");
    console.error("❌ ERROR in getAllUserOrders:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("========================================");
    
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching user orders",
      error: error.message,
      errorName: error.name
    });
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