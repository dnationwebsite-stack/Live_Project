const express = require("express");
const router = express.Router();
const { saveShippingAddress, placeCODOrder } = require("../controllers/orderController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// POST /api/orders/address
router.post("/shippingAddress", authMiddleware(), saveShippingAddress);

router.post("/cod", authMiddleware(), placeCODOrder);

module.exports = router;
