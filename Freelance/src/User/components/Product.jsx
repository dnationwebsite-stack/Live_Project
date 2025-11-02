"use client"

import React, { useState } from "react"
import { Button } from "@mui/material"
import { useNavigate } from "react-router-dom"
import useCartStore from "../../store/CartSlice"

export default function ProductCard({ product }) {
  const { addToCart, error } = useCartStore()
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    try {
      await addToCart(product._id, 1)
      alert(`✅ ${product.name} added to cart!`)
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
      {/* Product Image Container */}
      <div className="relative aspect-square p-4">
        <img
          src={product.images?.[0]}
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

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
        </div>

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

        <Button
          variant="contained"
          disabled={product.status === "Out of Stock"}
          onClick={handleAddToCart}
          className={`w-full h-9 text-sm font-medium ${
            product.status === "Out of Stock"
              ? "bg-gray-700 text-white cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {product.status === "Out of Stock" ? "Unavailable" : "Add"}
        </Button>
      </div>
    </div>
  )
}
