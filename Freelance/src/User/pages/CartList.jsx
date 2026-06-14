"use client"

import { useState, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"  // ← yeh add karo
import {
  Button,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material"

import ProductCard from "../components/Product"
import useProductStore from "../../store/ProductSlice"

const sortOptions = [
  { value: "featured",   label: "Featured" },
  { value: "price-low",  label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest",     label: "Newest" },
]

export default function ProductsPage() {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    fetchProducts,
    fetchCategories,
    loading,
    error,
  } = useProductStore()

  const [selectedSubcategory, setSelectedSubcategory] = useState("All")
  const [priceRange, setPriceRange]                   = useState([0, 50000])
  const [showInStockOnly, setShowInStockOnly]          = useState(false)
  const [sortBy, setSortBy]                           = useState("featured")
  const [showFilters, setShowFilters]                 = useState(false)
  const [mounted, setMounted]                         = useState(false)  // ← portal ke liye

  useEffect(() => {
    setMounted(true)  // SSR safe
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts(selectedCategory === "All" ? null : selectedCategory)
    setSelectedSubcategory("All")
  }, [selectedCategory])

  // Drawer open hone pe body scroll band karo
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [showFilters])

  const subcategories = useMemo(() => {
    const filtered = selectedCategory === "All"
      ? products
      : products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())
    return ["All", ...new Set(filtered.map(p => p.subcategory).filter(Boolean))]
  }, [products, selectedCategory])

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSubcategory =
        selectedSubcategory === "All" || product.subcategory === selectedSubcategory
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1]
      const totalStock = product.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) ?? 0
      const matchesStock = !showInStockOnly || totalStock > 0
      return matchesSubcategory && matchesPrice && matchesStock
    })
    if (sortBy === "price-low")  result = [...result].sort((a, b) => a.price - b.price)
    if (sortBy === "price-high") result = [...result].sort((a, b) => b.price - a.price)
    if (sortBy === "newest")     result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return result
  }, [products, selectedSubcategory, priceRange, showInStockOnly, sortBy])

  const resetFilters = () => {
    setSelectedCategory("All")
    setSelectedSubcategory("All")
    setPriceRange([0, 50000])
    setShowInStockOnly(false)
    setSortBy("featured")
  }

  const FilterContent = ({ onApply }) => (
    <div className="flex flex-col gap-5">

      <div>
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Category</p>
        <FormControl fullWidth size="small">
          <Select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            sx={{ borderRadius: "10px", fontSize: "13px" }}
          >
            {categories.length > 0
              ? categories.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))
              : <MenuItem value="All">All</MenuItem>
            }
          </Select>
        </FormControl>
      </div>

      <div>
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Subcategory</p>
        <div className="flex flex-wrap gap-2">
          {subcategories.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-3 py-1.5 rounded-full text-[12px] border transition-all
                ${selectedSubcategory === sub
                  ? "bg-[#EEEDFE] text-[#3C3489] border-[#AFA9EC]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Price range</p>
        <div className="flex justify-between mb-2">
          <span className="text-[12px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg">
            ₹{priceRange[0].toLocaleString()}
          </span>
          <span className="text-[12px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg">
            ₹{priceRange[1].toLocaleString()}
          </span>
        </div>
        <Slider
          value={priceRange}
          onChange={(e, val) => setPriceRange(val)}
          min={0}
          max={50000}
          step={500}
          valueLabelDisplay="auto"
          sx={{ color: "#534AB7", "& .MuiSlider-thumb": { width: 16, height: 16 } }}
        />
      </div>

      <div>
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Availability</p>
        <div
          className="flex justify-between items-center px-3 py-2.5 rounded-[10px] border border-gray-200 cursor-pointer"
          onClick={() => setShowInStockOnly(v => !v)}
        >
          <span className="text-[13px] text-gray-700">In stock only</span>
          <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 flex-shrink-0 ${showInStockOnly ? "bg-[#534AB7]" : "bg-gray-200"}`}>
            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all duration-200 ${showInStockOnly ? "right-[3px]" : "left-[3px]"}`} />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={resetFilters}
          className="flex-1 py-2.5 rounded-[10px] border border-gray-200 text-[13px] text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onApply}
          className="flex-[2] py-2.5 rounded-[10px] bg-[#534AB7] text-white text-[13px] font-medium hover:bg-[#4840a0] transition-colors"
        >
          Apply filters
        </button>
      </div>
    </div>
  )

  // ← PORTAL — body ke andar directly render hoga, navbar ka koi asar nahi
  const MobileDrawer = mounted ? createPortal(
    <div
      className="fixed inset-0 z-[9999] lg:hidden flex"
      onClick={() => setShowFilters(false)}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 w-[300px] bg-white flex flex-col h-full rounded-r-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer header — hamesha top:0 pe rahega */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="text-[16px] font-medium text-gray-800">Filters</span>
          <button
            onClick={() => setShowFilters(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          <FilterContent onApply={() => setShowFilters(false)} />
        </div>
      </div>
    </div>,
    document.body  // ← directly body mein
  ) : null

  return (
    <div
      className="flex flex-col bg-gray-50 mt-20"
      style={{ height: "calc(100vh - 80px)" }}
    >
      {/* HEADER */}
      <div className="bg-white shadow-sm px-5 py-4 flex justify-between items-center flex-shrink-0 z-20">
        <Typography variant="h5" className="font-bold">
          {selectedCategory !== "All" ? selectedCategory.toUpperCase() : "All Products"}
        </Typography>
        <button
          onClick={() => setShowFilters(true)}
          className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
        </button>
      </div>

      {/* MOBILE DRAWER — portal ke through render hoga */}
      {showFilters && MobileDrawer}

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden w-[95%] mx-auto gap-6 py-6">

        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-4 overflow-y-auto scrollbar-hide h-full">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-5">Filters</p>
            <FilterContent onApply={() => {}} />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="body2" className="text-gray-500">
              {loading ? "Loading…" : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`}
            </Typography>
            <FormControl size="small">
              <Select value={sortBy} onChange={e => setSortBy(e.target.value)} sx={{ borderRadius: "8px", fontSize: "13px" }}>
                {sortOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {error && <div className="text-center text-red-500 py-10">{error}</div>}

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64" />
              ))}
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center mt-20">
              <Typography variant="h6" className="text-gray-500 mb-3">No products found</Typography>
              <Button variant="outlined" onClick={resetFilters}>Clear Filters</Button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
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