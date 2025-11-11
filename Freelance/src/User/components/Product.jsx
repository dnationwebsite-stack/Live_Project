"use client";

import React, { useState } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/CartSlice";

export default function ProductCard({ product }) {
  const { addToCart, error } = useCartStore();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState("");
  const [hovered, setHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!selectedSize) return alert("Please select a size before adding to cart");

    try {
      await addToCart(product._id, 1, selectedSize);
      alert(`✅ ${product.name} (Size ${selectedSize}) added to cart!`);
    } catch {
      alert(`❌ ${error || "Failed to add product"}`);
    }
  };

  const handleNavigate = () => {
    navigate(`/detailpage/${product._id}`);
  };

  // ✅ Handle image URLs properly
  const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/400x400?text=No+Image";
    if (img.startsWith("http")) return img;
    return `http://localhost:5000/uploads/${img}`;
  };

  // ✅ Handle hover slider logic
  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url || img)
      : [product.image || "https://via.placeholder.com/400x400?text=No+Image"];

  // When hovered, start cycling through images
  const handleMouseEnter = () => {
    setHovered(true);
    if (images.length > 1) {
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % images.length;
        setCurrentImage(index);
      }, 1000); // change image every 1 second
      setHoverInterval(interval);
    }
  };

  const [hoverInterval, setHoverInterval] = useState(null);

  const handleMouseLeave = () => {
    setHovered(false);
    setCurrentImage(0);
    if (hoverInterval) clearInterval(hoverInterval);
  };

  return (
    <div
      onClick={handleNavigate}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Product Image Section */}
      <div className="relative aspect-square p-4 bg-gray-50 overflow-hidden">
        {images.map((img, index) => (
          <img
            key={index}
            src={getImageUrl(img)}
            alt={product.name || "Product"}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400x400?text=No+Image";
            }}
          />
        ))}
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500">{product.brand}</p>
        <span className="text-lg font-bold text-gray-900">₹{product.price}</span>

        {/* Status */}
        <p
          className={`text-xs font-medium ${
            product.status === "Out of Stock"
              ? "text-red-500"
              : product.status === "Limited"
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {product.status}
        </p>

        {/* Size Selector */}
        {product.sizes?.length > 0 && (
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <InputLabel>Select Size</InputLabel>
            <Select
              value={selectedSize}
              label="Select Size"
              onChange={(e) => setSelectedSize(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              {product.sizes.map((s) => (
                <MenuItem key={s.size} value={s.size}>
                  {s.size} ({s.stock} left)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Add to Cart */}
        <Button
          variant="contained"
          disabled={!selectedSize || product.status === "Out of Stock"}
          onClick={handleAddToCart}
          className={`w-full h-9 text-sm font-medium ${
            !selectedSize || product.status === "Out of Stock"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {!selectedSize
            ? "Select Size"
            : product.status === "Out of Stock"
            ? "Unavailable"
            : "Add"}
        </Button>
      </div>
    </div>
  );
}
