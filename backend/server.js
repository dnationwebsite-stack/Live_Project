const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");

const app = express();

const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/* ---------------------- MIDDLEWARE ---------------------- */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

connectDB();

/* ---------------------- CORS FIX ------------------------- */
/* Add your domain + IP + localhost for development */
app.use(cors({
    origin: [
        "http://localhost:5173",           // Local development
        "https://dripnation.co.in",       // If you use HTTPS
        "http://82.112.231.28",            // VPS public IP
        "http://82.112.231.28:5000"        // Allow IP with port
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

/* ---------------------- MULTER ERROR HANDLING ---------------------- */
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File size too large. Maximum 10MB per file allowed.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: error.message
  });
});

/* ---------------------- START SERVER ----------------------- */
const PORT = process.env.PORT || 5000;

// IMPORTANT: "0.0.0.0" makes the server accessible publicly
app.listen(PORT, "::", () => {
    console.log(`🚀 Server running at: http://82.112.231.28:${PORT}`);
});
