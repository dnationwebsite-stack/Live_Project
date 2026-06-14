const Product = require("../models/productModel");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================
// CREATE PRODUCT WITH MULTIPLE IMAGES
// ============================================
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      category,
      subcategory,
      sizes,
      description,
      status,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    const images = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        try {
          const result = await cloudinary.uploader.upload(req.files[i].path, {
            folder: "products",
            quality: "auto",
            fetch_format: "auto",
            width: 800,
            crop: "limit",
          });

          images.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: `${name} - Image ${i + 1}`,
            isPrimary: i === 0,
            order: i,
          });

          fs.unlink(req.files[i].path, (err) => {
            if (err) console.error(`Error deleting file ${req.files[i].path}:`, err);
          });
        } catch (uploadError) {
          console.error(`❌ Error uploading image ${i}:`, uploadError);
          fs.unlink(req.files[i].path, (err) => {
            if (err) console.error(`Error deleting file:`, err);
          });
        }
      }
      console.log(`✅ Successfully uploaded ${images.length} images to Cloudinary`);
    }

    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      } catch (e) {
        console.error("❌ Error parsing sizes:", e);
        return res.status(400).json({
          success: false,
          message: "Invalid sizes format",
        });
      }
    }

    const product = new Product({
      name,
      brand,
      price,
      category,
      subcategory,
      sizes: parsedSizes,
      images: images.length > 0 ? images : undefined,
      description,
      status: status || "Active",
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("❌ Create Product Error:", error);

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error(`Error deleting file:`, err);
        });
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// ============================================
// GET ALL PRODUCTS — with category filter,
// subcategory filter, search & pagination
// ============================================
exports.getAllProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // ── Build filter ──────────────────────────────────────
    const filter = {};

    // Category: case-insensitive exact match
    if (category && category !== "all") {
      filter.category = category.toLowerCase().trim();
    }

    // Subcategory: case-insensitive exact match
    if (subcategory && subcategory !== "all") {
      filter.subcategory = { $regex: `^${subcategory.trim()}$`, $options: "i" };
    }

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Search across name and description
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { brand: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // ── Pagination & sorting ──────────────────────────────
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // cap at 100
    const skip     = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;

    // ── Queries (run in parallel for performance) ─────────
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select("+images +sizes")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    console.log(`📦 Fetched ${products.length} products (total matching: ${total})`);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
      // Keep legacy field for any existing frontend code
      totalProducts: total,
    });
  } catch (error) {
    console.error("❌ Get All Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ============================================
// GET ALL DISTINCT CATEGORIES
// Returns sorted list of unique category values
// ============================================
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");

    // Filter out null/empty, sort alphabetically
    const sorted = categories
      .filter(Boolean)
      .map((c) => c.trim())
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      success: true,
      data: sorted,
      total: sorted.length,
    });
  } catch (error) {
    console.error("❌ Get Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// ============================================
// GET ALL DISTINCT SUBCATEGORIES
// Optional: pass ?category=mens to filter subcategories
// for a specific category only
// ============================================
exports.getSubcategories = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = category ? { category: category.toLowerCase().trim() } : {};
    const subcategories = await Product.distinct("subcategory", filter);

    const sorted = subcategories
      .filter(Boolean)
      .map((s) => s.trim())
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      success: true,
      data: sorted,
      total: sorted.length,
    });
  } catch (error) {
    console.error("❌ Get Subcategories Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories",
      error: error.message,
    });
  }
};

// ============================================
// GET SINGLE PRODUCT
// ============================================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ============================================
// ADD IMAGES TO EXISTING PRODUCT
// ============================================
exports.addImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided",
      });
    }

    if (product.images.length + req.files.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 images allowed per product",
      });
    }

    const newImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const result = await cloudinary.uploader.upload(req.files[i].path, {
        folder: "products",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
        ],
      });

      newImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        alt: `${product.name} - Image ${product.images.length + i + 1}`,
        isPrimary: false,
        order: product.images.length + i,
      });
    }

    product.images.push(...newImages);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Images added successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add images",
      error: error.message,
    });
  }
};

// ============================================
// DELETE IMAGE FROM PRODUCT
// ============================================
exports.deleteImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const imageIndex = product.images.findIndex(
      (img) => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    if (product.images.length === 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the only image. Product must have at least one image.",
      });
    }

    const image = product.images[imageIndex];

    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
      }
    }

    if (image.isPrimary) {
      const nextPrimaryIndex = imageIndex === 0 ? 1 : 0;
      product.images[nextPrimaryIndex].isPrimary = true;
    }

    product.images.splice(imageIndex, 1);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error("Delete Image Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};

// ============================================
// SET PRIMARY IMAGE
// ============================================
exports.setPrimaryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const targetImage = product.images.find(
      (img) => img._id.toString() === imageId
    );

    if (!targetImage) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    product.images.forEach((img) => { img.isPrimary = false; });
    targetImage.isPrimary = true;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Primary image updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Set Primary Image Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set primary image",
      error: error.message,
    });
  }
};

// ============================================
// REORDER IMAGES
// ============================================
exports.reorderImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageOrder } = req.body;

    if (!Array.isArray(imageOrder)) {
      return res.status(400).json({ success: false, message: "imageOrder must be an array" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (imageOrder.length !== product.images.length) {
      return res.status(400).json({
        success: false,
        message: "Image order array length must match number of product images",
      });
    }

    const reorderedImages = [];
    for (let i = 0; i < imageOrder.length; i++) {
      const image = product.images.find(
        (img) => img._id.toString() === imageOrder[i]
      );
      if (!image) {
        return res.status(400).json({
          success: false,
          message: `Image with ID ${imageOrder[i]} not found`,
        });
      }
      image.order = i;
      reorderedImages.push(image);
    }

    product.images = reorderedImages;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Images reordered successfully",
      data: product,
    });
  } catch (error) {
    console.error("Reorder Images Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder images",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE PRODUCT
// ============================================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty. Please provide data to update.",
      });
    }

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { name, brand, price, category, subcategory, sizes, description, status } = req.body;

    let updated = false;

    if (name !== undefined && name !== "")        { product.name        = name;              updated = true; }
    if (brand !== undefined && brand !== "")      { product.brand       = brand;             updated = true; }
    if (price !== undefined && price !== "")      { product.price       = parseFloat(price); updated = true; }
    if (category !== undefined && category !== "") { product.category   = category;          updated = true; }
    if (subcategory !== undefined && subcategory !== "") { product.subcategory = subcategory; updated = true; }
    if (description !== undefined)                { product.description = description;       updated = true; }
    if (status !== undefined && status !== "")    { product.status      = status;            updated = true; }

    if (sizes !== undefined) {
      try {
        product.sizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
        updated = true;
      } catch (parseError) {
        return res.status(400).json({ success: false, message: "Invalid sizes format. Must be valid JSON array." });
      }
    }

    if (req.files && req.files.length > 0) {
      if (product.images.length + req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: `Maximum 10 images allowed. You have ${product.images.length} existing images.`,
        });
      }

      const newImages = [];
      for (let i = 0; i < req.files.length; i++) {
        try {
          const result = await cloudinary.uploader.upload(req.files[i].path, {
            folder: "products",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto" },
            ],
          });
          newImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: `${product.name} - Image ${product.images.length + i + 1}`,
            isPrimary: product.images.length === 0 && i === 0,
            order: product.images.length + i,
          });
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res.status(500).json({ success: false, message: "Failed to upload images to cloud storage" });
        }
      }
      product.images.push(...newImages);
      updated = true;
    }

    if (!updated) {
      return res.status(400).json({ success: false, message: "No valid fields provided to update" });
    }

    product.markModified("sizes");
    product.markModified("images");

    const savedProduct = await product.save({ validateBeforeSave: true });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: savedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors: messages });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ============================================
// DELETE PRODUCT
// ============================================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    for (const image of product.images) {
      if (image.publicId) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (cloudinaryError) {
          console.error("Cloudinary delete error:", cloudinaryError);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};