const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

exports.getDashboardStats = async (req, res) => {
  try {
    // sab parallel fetch hoga — fast response
    const [totalProducts, totalOrders, totalCustomers, recentOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.find()
        .populate("user", "name email") // user ka name/email milega
        .sort({ createdAt: -1 })
        .limit(6)
        .select("user totalPrice status createdAt"),
    ]);

    // Frontend ke liye clean structure
    const formattedOrders = recentOrders.map((order) => ({
      _id: order._id,
      customOrderId: order.customOrderId?._id || "N/A",
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      recentOrders: formattedOrders,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
