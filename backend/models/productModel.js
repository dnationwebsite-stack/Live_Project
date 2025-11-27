const mongoose = require("mongoose");

// Define Image Subdocument Schema
const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    default: ""
  },
  alt: {
    type: String,
    default: "Product Image"
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true }); // ✅ Ensure _id is generated for subdocuments

// Define Size Subdocument Schema
const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
}, { _id: true });

// Main Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxlength: [200, "Product name cannot exceed 200 characters"]
  },
  brand: {
    type: String,
    required: [true, "Brand is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
    lowercase: true
  },
  subcategory: {
    type: String,
    required: [true, "Subcategory is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  status: {
    type: String,
    enum: ["Active", "Limited", "Out of Stock"],
    default: "Active"
  },
  images: {
    type: [imageSchema], // ✅ Use the imageSchema
    validate: {
      validator: function(images) {
        return images.length <= 10;
      },
      message: "Maximum 10 images allowed"
    },
    default: []
  },
  sizes: {
    type: [sizeSchema], // ✅ Use the sizeSchema
    required: [true, "At least one size is required"],
    validate: {
      validator: function(sizes) {
        return sizes.length > 0;
      },
      message: "Product must have at least one size"
    }
  }
}, {
  timestamps: true, // ✅ Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Indexes for better query performance
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: "text", description: "text" });

// ✅ Virtual for total stock
productSchema.virtual("totalStock").get(function() {
  return this.sizes.reduce((total, size) => total + size.stock, 0);
});

// ✅ Pre-save hook to ensure at least one primary image
productSchema.pre("save", function(next) {
  if (this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);