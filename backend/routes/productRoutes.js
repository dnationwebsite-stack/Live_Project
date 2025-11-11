const express = require("express");
const router = express.Router();

const {
  createProduct,      // Changed from addProduct
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  addImages,          // Added
  deleteImage,        // Added
  setPrimaryImage,    // Added
  reorderImages       // Added
} = require("../controllers/productController");

const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// GET routes
router.get("/getAllProduct", getAllProducts);
router.get("/getProductById/:id", getProductById);

// POST routes
router.post("/addProduct", authMiddleware("admin"), upload.array("images", 10), createProduct); // Changed to upload.array
router.post("/addImages/:id", authMiddleware("admin"), upload.array("images", 5), addImages);

// PUT routes
router.put("/updateProduct/:id", authMiddleware("admin"),upload.array("images", 10), updateProduct);
router.put("/setPrimaryImage/:id/:imageId", authMiddleware("admin"), setPrimaryImage);
router.put("/reorderImages/:id", authMiddleware("admin"), reorderImages);

// DELETE routes
router.delete("/deleteProduct/:id", authMiddleware("admin"), deleteProduct);
router.delete("/deleteImage/:id/:imageId", authMiddleware("admin"), deleteImage);

module.exports = router;