const express = require("express");
const { addToCart, getCart, removeFromCart, updateCartQuantity } = require("../controllers/cartController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/addToCart", authMiddleware(), addToCart);
router.get("/getCart", authMiddleware(), getCart);
router.delete("/removeFromCart", authMiddleware(), removeFromCart);
router.put("/updateCart", authMiddleware(), updateCartQuantity);

module.exports = router;
