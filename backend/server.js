const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

const app = express();

/* -------- MIDDLEWARE -------- */
app.use(express.json());
app.use(cookieParser());

connectDB();

/* ---------- IMPORTANT CORS FIX (for production) ---------- */
app.use(cors({
    origin: [
        "http://localhost:5173",          // local dev
        "http://dripnation.co.in",        // your live frontend domain
        "http://82.112.231.28"              // if accessing directly via IP
    ],
    credentials: true
}));

/* -------- ROUTES -------- */
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

/* -------- START SERVER -------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://82.112.231.28:${PORT}`);
});
