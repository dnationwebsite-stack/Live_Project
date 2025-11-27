"use client"

import { useState, useMemo, useEffect } from "react"
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

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category))).filter(Boolean)], [products])
  const subcategories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.subcategory))).filter(Boolean)], [products])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSubcategory, setSelectedSubcategory] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false) // 🔥 mobile default: false

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
      const matchesSubcategory = selectedSubcategory === "All" || product.subcategory === selectedSubcategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesStock = !showInStockOnly || product.inStock

      return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice && matchesStock
    })

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.sort((a, b) => b.id - a.id)
        break
      default:
        break
    }

    return filtered
  }, [searchQuery, selectedCategory, selectedSubcategory, priceRange, showInStockOnly, sortBy, products])

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All")
    setSelectedSubcategory("All")
    setPriceRange([0, 50000])
    setShowInStockOnly(false)
    setSortBy("featured")
  }

  return (
    <div className="min-h-screen mt-18">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="w-full px-5 py-4 flex items-center justify-between ">
          <Typography variant="h5" className="text-foreground font-bold">
            Products
          </Typography>

          {/* 🔥 MOBILE FILTER BUTTON */}
          <Button className="lg:hidden" variant="outlined" onClick={() => setShowFilters(true)}>
            Filters
          </Button>
        </div>
      </header>

      <div className="w-[90%] mx-auto px-4 py-6 flex gap-6">
        {/* FILTER SIDEBAR (Desktop normal / Mobile FULL SCREEN) */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden" onClick={() => setShowFilters(false)}></div>
        )}

        <aside
          className={`
            ${showFilters ? "block" : "hidden"}
            lg:block 
            bg-white shadow-lg
            lg:relative lg:w-80

            /* Mobile fullscreen */
            fixed lg:static
            top-0 left-0 
            w-full h-full 
            z-50 
            p-4 overflow-y-auto
          `}
        >
          <Card className="bg-sidebar border-sidebar-border h-full overflow-y-auto">
            <CardHeader title="Filters" className="text-sidebar-foreground sticky top-0 bg-sidebar z-10" />
            <CardContent className="!space-y-6">

              {/* Category */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Subcategory */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Subcategory</InputLabel>
                <Select value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)}>
                  {subcategories.map(subcategory => (
                    <MenuItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Price */}
              <div>
                <Typography variant="body2">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  max={50000}
                  min={0}
                  step={100}
                />
              </div>

              {/* In stock */}
              <div className="flex items-center space-x-2">
                <Checkbox checked={showInStockOnly} onChange={e => setShowInStockOnly(e.target.checked)} />
                <Typography variant="body2" className="text-sidebar-foreground">
                  In stock only
                </Typography>
              </div>
            </CardContent>

            {/* Buttons */}
            <CardActions className="flex gap-2 sticky bottom-0 bg-sidebar p-2 z-10">
              <Button onClick={resetFilters} variant="outlined" size="small" className="flex-1 bg-transparent">
                Reset
              </Button>

              {/* 🔥 APPLY FILTERS CLOSES MOBILE SIDEBAR */}
              <Button
                size="small"
                className="flex-1"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </CardActions>
          </Card>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 h-[120vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 !py-5 !p-2 bg-white">
            <Typography variant="body2" className="text-muted-foreground">
              {filteredAndSortedProducts.length} products found
            </Typography>

            <FormControl size="small">
              <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Typography variant="body2" className="text-muted-foreground">
                No products found matching your criteria.
              </Typography>
              <Button onClick={resetFilters} variant="outlined" className="mt-4 bg-transparent">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAndSortedProducts.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}