const express = require("express");
const router = express.Router();

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getCategories,       // ✅ NEW
  getSubcategories,    // ✅ NEW
  addImages,
  deleteImage,
  setPrimaryImage,
  reorderImages,
} = require("../controllers/productController");

const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// ─────────────────────────────────────────────────
// PUBLIC GET routes
// NOTE: Specific routes (/categories, /subcategories)
// MUST come before parameterised routes (/:id)
// ─────────────────────────────────────────────────
router.get("/getAllProduct",      getAllProducts);
router.get("/categories",         getCategories);        // ✅ GET /api/products/categories
router.get("/subcategories",      getSubcategories);     // ✅ GET /api/products/subcategories?category=mens
router.get("/getProductById/:id", getProductById);

// ─────────────────────────────────────────────────
// ADMIN POST routes
// ─────────────────────────────────────────────────
router.post(
  "/addProduct",
  authMiddleware("admin"),
  upload.array("images", 10),
  createProduct
);

router.post(
  "/addImages/:id",
  authMiddleware("admin"),
  upload.array("images", 5),
  addImages
);

// ─────────────────────────────────────────────────
// ADMIN PUT routes
// ─────────────────────────────────────────────────
router.put(
  "/updateProduct/:id",
  authMiddleware("admin"),
  upload.array("images", 10),
  updateProduct
);

router.put(
  "/setPrimaryImage/:id/:imageId",
  authMiddleware("admin"),
  setPrimaryImage
);

router.put(
  "/reorderImages/:id",
  authMiddleware("admin"),
  reorderImages
);

// ─────────────────────────────────────────────────
// ADMIN DELETE routes
// ─────────────────────────────────────────────────
router.delete(
  "/deleteProduct/:id",
  authMiddleware("admin"),
  deleteProduct
);

router.delete(
  "/deleteImage/:id/:imageId",
  authMiddleware("admin"),
  deleteImage
);

module.exports = router;