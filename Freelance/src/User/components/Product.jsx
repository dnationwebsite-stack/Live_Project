"use client"

import React, { useState } from "react"
import { Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material"
import { useNavigate } from "react-router-dom"
import useCartStore from "../../store/CartSlice"

export default function ProductCard({ product }) {
  const { addToCart, error } = useCartStore()
  const navigate = useNavigate()
  const [selectedSize, setSelectedSize] = useState("")

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    if (!selectedSize) return alert("Please select a size before adding to cart")

    try {
      await addToCart(product._id, 1, selectedSize)
      alert(`✅ ${product.name} (Size ${selectedSize}) added to cart!`)
    } catch {
      alert(`❌ ${error || "Failed to add product"}`)
    }
  }

  const handleNavigate = () => {
    navigate(`/detailpage/${product._id}`)
  }

  return (
    <div
      onClick={handleNavigate}
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Product Image */}
      <div className="relative aspect-square p-4">
        <img
          src={product.image || "https://via.placeholder.com/200"}
          alt={product.name}
          className="w-full h-full object-contain"
        />
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
  )
}
