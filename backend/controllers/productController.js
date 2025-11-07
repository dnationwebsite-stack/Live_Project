const Product = require("../models/productModel");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary (add to your config file)
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
    const { name, brand, price, category, subcategory, sizes, description, status } = req.body;
    
    // Handle multiple image uploads
    const images = [];
    
    if (req.files && req.files.length > 0) {
      // Upload each file to Cloudinary
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          folder: "products",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" }
          ]
        });
        
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          alt: `${name} - Image ${i + 1}`,
          isPrimary: i === 0, // First image is primary
          order: i
        });
      }
    }

    const product = new Product({
      name,
      brand,
      price,
      category,
      subcategory,
      sizes: sizes ? JSON.parse(sizes) : [],
      images: images.length > 0 ? images : undefined, // Use default if no images
      description,
      status
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message
    });
  }
};

// ============================================
// GET ALL PRODUCTS
// ============================================
exports.getAllProducts = async (req, res) => {
  try {
    const { category, subcategory, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (status) filter.status = status;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
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
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message
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
        message: "Product not found"
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided"
      });
    }

    // Check total images limit
    if (product.images.length + req.files.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 images allowed per product"
      });
    }

    // Upload new images
    const newImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const result = await cloudinary.uploader.upload(req.files[i].path, {
        folder: "products",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" }
        ]
      });
      
      newImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        alt: `${product.name} - Image ${product.images.length + i + 1}`,
        isPrimary: false,
        order: product.images.length + i
      });
    }

    product.images.push(...newImages);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Images added successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add images",
      error: error.message
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
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const image = product.images.id(imageId);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    // Don't allow deleting if it's the only image
    if (product.images.length === 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the only image. Product must have at least one image."
      });
    }

    // Delete from Cloudinary if publicId exists
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    // If deleting primary image, set the next image as primary
    if (image.isPrimary && product.images.length > 1) {
      product.images[0]._id.toString() === imageId.toString() 
        ? product.images[1].isPrimary = true 
        : product.images[0].isPrimary = true;
    }

    product.images.pull(imageId);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message
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
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await product.setPrimaryImage(imageId);

    res.status(200).json({
      success: true,
      message: "Primary image updated successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to set primary image",
      error: error.message
    });
  }
};

// ============================================
// REORDER IMAGES
// ============================================
exports.reorderImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageOrder } = req.body; // Array of image IDs in desired order
    
    if (!Array.isArray(imageOrder)) {
      return res.status(400).json({
        success: false,
        message: "imageOrder must be an array"
      });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await product.reorderImages(imageOrder);

    res.status(200).json({
      success: true,
      message: "Images reordered successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reorder images",
      error: error.message
    });
  }
};

// ============================================
// UPDATE PRODUCT
// ============================================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message
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
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Delete all images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message
    });
  }
};