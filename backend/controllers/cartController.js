const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// ✅ Add to Cart
const addToCart = async (req, res) => {
  try {
    console.log("first")
    const { productId, quantity } = req.body;
    const userId = req.user.id; // 👈 JWT middleware se aa raha hoga

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // User ka cart check karo
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      console.log("Cart Not present")
      // Cart create karo
      cart = new Cart({
        userId,
        products: [{ productId, quantity }],
      });
    } else {
      console.log("Already cart hai")
      // Already cart hai → product check karo
      const existingProduct = cart.products.find((p) => p.productId.toString() === productId);

      if (existingProduct) {
        existingProduct.quantity += quantity; // increase quantity
      } else {
        cart.products.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Add to Cart error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) return res.status(200).json({ success: true, cart: { products: [] } });

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Get Cart error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Remove Product from Cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.products = cart.products.filter((p) => p.productId.toString() !== productId);

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Remove Cart error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const productInCart = cart.products.find((p) => p.productId.toString() === productId);

    if (!productInCart) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    productInCart.quantity = quantity; // update karega

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Update Cart Quantity error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
};
