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

  // ✅ Dynamic categories & brands from products
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category))).filter(Boolean)], [products])
  const brands = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.brand))).filter(Boolean)], [products])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(true)

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
      const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesStock = !showInStockOnly || product.inStock

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesStock
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
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, showInStockOnly, sortBy, products])

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All")
    setSelectedBrand("All")
    setPriceRange([0, 50000])
    setShowInStockOnly(false)
    setSortBy("featured")
  }

  return (
    <div className="min-h-screen mt-18">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="w-full px-26 py-4 flex items-center justify-between ">
          <Typography variant="h5" className="text-foreground font-bold">
            Products
          </Typography>
        </div>
      </header>

      <div className="w-[90%] mx-auto px-4 py-6 flex gap-6">
        {/* Filters Sidebar */}
        <aside className={`w-80 ${showFilters ? "block" : "hidden lg:block"} h-[80vh] overflow-y-auto sticky top-0`}>
          <Card className="bg-sidebar border-sidebar-border">
            <CardHeader title="Filters" className="text-sidebar-foreground sticky top-0 bg-sidebar z-10" />
            <CardContent className="!space-y-6">
              {/* Category */}
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Brand */}
              <FormControl fullWidth size="small">
                <InputLabel>Brand</InputLabel>
                <Select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
                  {brands.map(brand => (
                    <MenuItem key={brand} value={brand}>
                      {brand}
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

            <CardActions className="flex gap-2 sticky bottom-0 bg-sidebar p-2 z-10">
              <Button onClick={resetFilters} variant="outlined" size="small" className="flex-1 bg-transparent">
                Reset
              </Button>
              <Button size="small" className="flex-1">
                Apply Filters
              </Button>
            </CardActions>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-[120vh] overflow-y-auto">
          {/* Sort & info sticky */}
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 !py-5 !p-2 bg-white">
            <Typography variant="body2" className="text-muted-foreground">
              {filteredAndSortedProducts.length} products found
            </Typography>
            <div className="flex items-center gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
