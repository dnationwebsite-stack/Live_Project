const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

const app = express();

/* ---------------------- MIDDLEWARE ---------------------- */
app.use(express.json());
app.use(cookieParser());

connectDB();

/* ---------------------- CORS FIX ------------------------- */
/* Add your domain + IP + localhost for development */
app.use(cors({
    origin: [
        "http://localhost:5173",           // Local development
        "https://dripnation.co.in",         // Live domain
        "https://dripnation.co.in",        // If you use HTTPS
        "https://82.112.231.28",            // VPS public IP
        "https://82.112.231.28:5000"        // Allow IP with port
    ],
    credentials: true
}));

/* ---------------------- ROUTES --------------------------- */
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const coustomerRoutes = require("./routes/coustomerRoutes");
const { getDashboardStats } = require("./controllers/dashboardController");

app.use("/api/users", userRoutes);
app.use("/api/product", productRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dash", getDashboardStats);
app.use("/api/admin", coustomerRoutes);

/* ---------------------- START SERVER ----------------------- */
const PORT = process.env.PORT || 5000;

// IMPORTANT: "0.0.0.0" makes the server accessible publicly
app.listen(PORT, "::", () => {
    console.log(`🚀 Server running at: https://82.112.231.28:${PORT}`);
});
