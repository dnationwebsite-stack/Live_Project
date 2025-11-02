const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ["jersey", "boots"], required: true },
    subcategory: { type: String, required: true },
    sizes: { type: [sizeSchema], default: [] }, // multi-size with stock
    image: {
      type: String,
      default: "https://via.placeholder.com/400x400?text=No+Image", // ✅ default image
    },
    status: {
      type: String,
      enum: ["Active", "Limited", "Out of Stock"],
      default: "Active",
    },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
