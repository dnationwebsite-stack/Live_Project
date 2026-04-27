"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  Button,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Typography,
  Checkbox,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"

import ProductCard from "../components/Product"
import useProductStore from "../../store/ProductSlice"

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
]

export default function ProductsPage() {
  const { products, fetchProducts } = useProductStore()
  const { category } = useParams() // 🔥 URL se category

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSubcategory, setSelectedSubcategory] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // 🔥 URL category sync
  useEffect(() => {
    if (category) {
      setSelectedCategory(category.toLowerCase())
    }
  }, [category])

  const categories = useMemo(() => {
    return ["All", ...new Set(products.map(p => p.category?.toLowerCase()))]
  }, [products])

  const subcategories = useMemo(() => {
    return ["All", ...new Set(products.map(p => p.subcategory))]
  }, [products])

  // 🔥 MAIN FILTER LOGIC FIXED
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesCategory =
        selectedCategory === "All" ||
        product.category?.toLowerCase() === selectedCategory

      const matchesSubcategory =
        selectedSubcategory === "All" ||
        product.subcategory === selectedSubcategory

      const matchesPrice =
        product.price >= priceRange[0] &&
        product.price <= priceRange[1]

      const matchesStock =
        !showInStockOnly || product.inStock

      return (
        matchesCategory &&
        matchesSubcategory &&
        matchesPrice &&
        matchesStock
      )
    })

    // Sorting
    if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price)
    if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price)
    if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating)

    return filtered
  }, [products, selectedCategory, selectedSubcategory, priceRange, showInStockOnly, sortBy])

  const resetFilters = () => {
    setSelectedCategory("All")
    setSelectedSubcategory("All")
    setPriceRange([0, 50000])
    setShowInStockOnly(false)
    setSortBy("featured")
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-20">

      {/* HEADER */}
      <div className="sticky top-0 bg-white z-20 shadow-sm px-5 py-4 flex justify-between items-center">
        <Typography variant="h5" className="font-bold">
          {selectedCategory !== "All"
            ? selectedCategory.toUpperCase()
            : "All Products"}
        </Typography>

        <Button
          className="lg:hidden"
          variant="outlined"
          onClick={() => setShowFilters(true)}
        >
          Filters
        </Button>
      </div>

      <div className="flex w-[95%] mx-auto gap-6 py-6">

        {/* FILTER SIDEBAR */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowFilters(false)}
          />
        )}

        <aside className={`
          ${showFilters ? "block" : "hidden"} 
          lg:block bg-white shadow rounded-xl p-4 
          fixed lg:static w-full lg:w-72 h-full lg:h-auto z-50
        `}>

          <Typography variant="h6" className="mb-4 font-semibold">
            Filters
          </Typography>

          {/* Category */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              label="Category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Subcategory */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="subcategory-label">Subcategory</InputLabel>
            <Select
              labelId="subcategory-label"
              label="Subcategory"
              value={selectedSubcategory}
              onChange={e => setSelectedSubcategory(e.target.value)}
            >
              {subcategories.map(sub => (
                <MenuItem key={sub} value={sub}>
                  {sub}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Price */}
          <Typography variant="body2">
            ₹{priceRange[0]} - ₹{priceRange[1]}
          </Typography>
          <Slider
            value={priceRange}
            onChange={(e, val) => setPriceRange(val)}
            max={50000}
          />

          {/* Stock */}
          <div className="flex items-center mt-3">
            <Checkbox
              checked={showInStockOnly}
              onChange={e => setShowInStockOnly(e.target.checked)}
            />
            <Typography>In Stock</Typography>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <Button fullWidth variant="outlined" onClick={resetFilters}>
              Reset
            </Button>
            <Button fullWidth onClick={() => setShowFilters(false)}>
              Apply
            </Button>
          </div>
        </aside>

        {/* PRODUCTS */}
        <main className="flex-1">

          <div className="flex justify-between mb-4">
            <Typography>
              {filteredProducts.length} Products
            </Typography>

            <FormControl size="small">
              <Select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                {sortOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center mt-20">
              <Typography>No products found</Typography>
              <Button onClick={resetFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}