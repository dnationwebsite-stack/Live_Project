"use client"

import { useEffect } from "react"
import ProductCard from "./Product"
import useProductStore from "../../store/ProductSlice"   // 👈 apna zustand store import kar
import { Link } from "react-router-dom"

export default function ProductGrid() {
  const { products, fetchProducts, loading, error } = useProductStore()

  useEffect(() => {
    fetchProducts()   // ✅ mount hote hi products le aayega
  }, [fetchProducts])

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>
  }

  return (
    <>
      {/* Heading 1 */}
      <div className="px-5 py-4 text-center mb-5">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight pb-2">
          Products
        </h1>
      </div>

      {/* Grid with products from API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-10 px-5">
        {products.length > 0 ? (
          products.slice(0, 10).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">
            No products available
          </p>
        )}
      </div>

      {/* Heading 2 */}
      <div className="px-5 py-6 text-center">
        <Link to="/cartpage">
          <h1 className="text-lg md:text-xl font-semibold cursor-pointer">
            View Products
          </h1>
        </Link>
      </div>
    </>
  )
}
