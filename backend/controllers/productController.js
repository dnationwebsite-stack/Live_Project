const Product = require("../models/productModel");
const cloudinary = require("../utils/cloudinary");

// Helper function: calculate status based on total stock
const calculateStatus = (sizes) => {
  const totalStock = sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
  if (totalStock === 0) return "Out of Stock";
  if (totalStock < 15) return "Limited";
  return "Active";
};

const addProduct = async (req, res) => {
  try {
    const { name, brand, price, category, subcategory, sizes, description } = req.body;

    // 🔹 Validation for required fields
    if (!name || !brand || !price || !category || !subcategory || !sizes) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    // 🔹 Parse sizes (if frontend sent as string)
    const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Sizes array is required" });
    }

    // 🔹 Handle Cloudinary Upload
    let imageUrl = null;
    if (req.file) {
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(fileBuffer);
        });
      };

      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } else if (req.body.image) {
      // If frontend already gives an image URL
      imageUrl = req.body.image;
    }

    // 🔹 Determine stock status automatically
    const status = calculateStatus(parsedSizes);

    // 🔹 Create and Save Product
    const newProduct = new Product({
      name,
      brand,
      price,
      category,
      subcategory,
      description: description || "",
      sizes: parsedSizes,
      image: imageUrl,
      status,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "✅ Product added successfully!",
      product: newProduct,
    });
  } catch (err) {
    console.error("Add Product error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ✅ Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get All Products error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Get Product error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update Product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const { name, brand, price, category, subcategory, sizes, description } = req.body;
console.log(product)
console.log("first", name)
    if (name) product.name = name;
    if (brand) product.brand = brand;
    if (price) product.price = price;
    if (category) product.category = category;
    if (subcategory) product.subcategory = subcategory;
    if (description) product.description = description;

    if (sizes) {
      const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      product.sizes = parsedSizes;
    }

    // Cloudinary image upload
    if (req.file) {
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "products" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(fileBuffer);
        });
      };
      const result = await uploadToCloudinary(req.file.buffer);
      product.image = result.secure_url;
    }

    // Update status
    product.status = calculateStatus(product.sizes);

    await product.save();
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Update Product error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Check if product exists
const checkProductExists = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json({ exists: !!product });
  } catch (error) {
    console.error("Check Product error:", error.message);
    res.status(500).json({ exists: false, message: "Server error" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  checkProductExists,
};
