const mongoose = require("mongoose");

// Image Schema with metadata
const imageSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: true,
    trim: true 
  },
  publicId: { 
    type: String, // for Cloudinary or other cloud storage
    trim: true 
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
}, { _id: true });

// Size Schema
const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, default: 0 },
});

// Main Product Schema
const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    brand: { 
      type: String, 
      required: true,
      trim: true 
    },
    price: { 
      type: Number, 
      required: true,
      min: 0 
    },
    category: { 
      type: String, 
      enum: ["jersey", "boots"], 
      required: true 
    },
    subcategory: { 
      type: String, 
      required: true 
    },
    sizes: { 
      type: [sizeSchema], 
      default: [] 
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: function(images) {
          return images.length > 0 && images.length <= 10;
        },
        message: "Product must have between 1 and 10 images"
      },
      default: [{
        url: "https://via.placeholder.com/400x400?text=No+Image",
        alt: "Default Product Image",
        isPrimary: true,
        order: 0
      }]
    },
    status: {
      type: String,
      enum: ["Active", "Limited", "Out of Stock"],
      default: "Active",
    },
    description: { type: String },
  },
  { 
    timestamps: true 
  }
);

// Virtual to get primary image - WITH SAFETY CHECK
productSchema.virtual('primaryImage').get(function() {
  // Safety check: ensure images array exists and has items
  if (!this.images || !Array.isArray(this.images) || this.images.length === 0) {
    return {
      url: "https://via.placeholder.com/400x400?text=No+Image",
      alt: "Default Product Image",
      isPrimary: true,
      order: 0
    };
  }
  
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Method to set primary image
productSchema.methods.setPrimaryImage = function(imageId) {
  this.images.forEach(img => {
    img.isPrimary = img._id.toString() === imageId.toString();
  });
  return this.save();
};

// Method to reorder images
productSchema.methods.reorderImages = function(imageOrder) {
  imageOrder.forEach((id, index) => {
    const img = this.images.id(id);
    if (img) img.order = index;
  });
  this.images.sort((a, b) => a.order - b.order);
  return this.save();
};

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Product", productSchema);