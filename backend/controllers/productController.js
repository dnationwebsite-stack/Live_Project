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
    const { category, subcategory, status } = req.query;

    const filter = {};
    if (category) filter.category = category.toLowerCase();
    if (subcategory) filter.subcategory = subcategory;
    if (status) filter.status = status;

    // ✅ Use .lean() for faster queries and ensure all fields are returned
    const products = await Product.find(filter)
      .select("+images +sizes") // ✅ Explicitly include subdocument arrays
      .sort({ createdAt: -1 })
       .limit(10000) 
      .lean(); // ✅ Returns plain JavaScript objects

    const total = await Product.countDocuments(filter);

    // ✅ Log to verify data structure
    console.log("📦 Fetched Products Count:", products.length);
    if (products.length > 0) {
      console.log("📦 Sample Product:", {
        _id: products[0]._id,
        name: products[0].name,
        imagesCount: products[0].images?.length || 0,
        sizesCount: products[0].sizes?.length || 0,
        hasAllFields: !!(products[0].name && products[0].price && products[0].category)
      });
    }

    res.status(200).json({
      success: true,
      data: products,
      totalProducts: total
    });
  } catch (error) {
    console.error("❌ Get All Products Error:", error);
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
// DELETE IMAGE FROM PRODUCT - FIXED
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

    const imageIndex = product.images.findIndex(img => img._id.toString() === imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    const image = product.images[imageIndex];

    // Don't allow deleting if it's the only image
    if (product.images.length === 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the only image. Product must have at least one image."
      });
    }

    // Delete from Cloudinary if publicId exists
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // If deleting primary image, set the first remaining image as primary
    if (image.isPrimary) {
      // Find the first image that isn't the one being deleted
      const nextPrimaryIndex = imageIndex === 0 ? 1 : 0;
      product.images[nextPrimaryIndex].isPrimary = true;
    }

    // Remove the image from array
    product.images.splice(imageIndex, 1);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: product
    });
  } catch (error) {
    console.error("Delete Image Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message
    });
  }
};

// ============================================
// SET PRIMARY IMAGE - FIXED
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

    // Find the image
    const targetImage = product.images.find(img => img._id.toString() === imageId);
    
    if (!targetImage) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    // Set all images to not primary
    product.images.forEach(img => {
      img.isPrimary = false;
    });

    // Set the target image as primary
    targetImage.isPrimary = true;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Primary image updated successfully",
      data: product
    });
  } catch (error) {
    console.error("Set Primary Image Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set primary image",
      error: error.message
    });
  }
};

// ============================================
// REORDER IMAGES - FIXED
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

    // Validate that all image IDs exist
    if (imageOrder.length !== product.images.length) {
      return res.status(400).json({
        success: false,
        message: "Image order array length must match number of product images"
      });
    }

    // Create a new ordered array
    const reorderedImages = [];
    
    for (let i = 0; i < imageOrder.length; i++) {
      const imageId = imageOrder[i];
      const image = product.images.find(img => img._id.toString() === imageId);
      
      if (!image) {
        return res.status(400).json({
          success: false,
          message: `Image with ID ${imageId} not found`
        });
      }
      
      // Update the order property
      image.order = i;
      reorderedImages.push(image);
    }

    // Replace the images array with the reordered one
    product.images = reorderedImages;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Images reordered successfully",
      data: product
    });
  } catch (error) {
    console.error("Reorder Images Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder images",
      error: error.message
    });
  }
};

// ============================================
// UPDATE PRODUCT - FIXED WITH IMAGE SUPPORT
// ============================================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Update Product - ID:", id);
    console.log("Update Product - Request Body:", req.body);
    console.log("Update Product - Files:", req.files?.length || 0);
    console.log("Content-Type:", req.headers['content-type']);

    // Check if body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty. Please provide data to update.",
        hint: "Make sure Content-Type header is set correctly and middleware is configured"
      });
    }

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    console.log("Product found:", product._id);

    // Extract fields from request body
    const { name, brand, price, category, subcategory, sizes, description, status } = req.body;

    // Track what's being updated
    let updated = false;

    // Update only provided fields
    if (name !== undefined && name !== '') {
      product.name = name;
      console.log("Updating name to:", name);
      updated = true;
    }
    
    if (brand !== undefined && brand !== '') {
      product.brand = brand;
      console.log("Updating brand to:", brand);
      updated = true;
    }
    
    if (price !== undefined && price !== '') {
      product.price = parseFloat(price);
      console.log("Updating price to:", price);
      updated = true;
    }
    
    if (category !== undefined && category !== '') {
      product.category = category;
      console.log("Updating category to:", category);
      updated = true;
    }
    
    if (subcategory !== undefined && subcategory !== '') {
      product.subcategory = subcategory;
      console.log("Updating subcategory to:", subcategory);
      updated = true;
    }
    
    if (description !== undefined) {
      product.description = description;
      console.log("Updating description");
      updated = true;
    }
    
    if (status !== undefined && status !== '') {
      product.status = status;
      console.log("Updating status to:", status);
      updated = true;
    }
    
    // Handle sizes - parse if it's a string
    if (sizes !== undefined) {
      try {
        product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        console.log("Updating sizes to:", product.sizes);
        updated = true;
      } catch (parseError) {
        console.error("Error parsing sizes:", parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid sizes format. Must be valid JSON array."
        });
      }
    }

    // ✅ Handle NEW image uploads
    if (req.files && req.files.length > 0) {
      console.log("Processing", req.files.length, "new images");
      
      // Check total images limit (existing + new)
      if (product.images.length + req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: `Maximum 10 images allowed. You have ${product.images.length} existing images.`
        });
      }

      // Upload new images to Cloudinary
      const newImages = [];
      for (let i = 0; i < req.files.length; i++) {
        try {
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
            isPrimary: product.images.length === 0 && i === 0, // First image is primary if no existing images
            order: product.images.length + i
          });
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload images to cloud storage"
          });
        }
      }

      // Add new images to product
      product.images.push(...newImages);
      console.log("Added", newImages.length, "new images");
      updated = true;
    }

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update"
      });
    }

    // Mark the document as modified (important for subdocuments)
    product.markModified('sizes');
    product.markModified('images');

    console.log("Saving product...");
    
    // Save with validation
    const savedProduct = await product.save({ validateBeforeSave: true });
    
    console.log("Product saved successfully:", savedProduct._id);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: savedProduct
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============================================
// DELETE PRODUCT - FIXED
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
    for (const image of product.images) {
      if (image.publicId) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (cloudinaryError) {
        }
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
}