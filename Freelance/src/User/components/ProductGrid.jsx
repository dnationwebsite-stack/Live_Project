"use client"

import { useEffect } from "react"
import ProductCard from "./Product"
import useProductStore from "../../store/ProductSlice"
import { Link } from "react-router-dom"

export default function ProductGrid() {
  const { products, fetchProducts, loading, error } = useProductStore()

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-lg">
        Loading products...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-20 text-lg">
        {error}
      </div>
    )
  }

  return (
    <>
      {/* Heading */}
      <div className="px-4 md:px-8 py-5 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Products
        </h1>
      </div>

      {/* Product Grid */}
      <div className="
        grid 
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4 
        lg:grid-cols-4 
        xl:grid-cols-5 
        gap-6 
        px-4 
        md:px-8
      ">
        {products.length > 0 ? (
          products.slice(0, 10).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg">
            No products available
          </p>
        )}
      </div>

      {/* Bottom Link */}
      <div className="px-4 py-8 text-center">
        <Link to="/cartpage">
          <h1 className="text-base sm:text-lg md:text-xl font-semibold cursor-pointer">
            View Products
          </h1>
        </Link>
      </div>
    </>
  )
}
