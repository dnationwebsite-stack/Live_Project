"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import useProductStore from "../../store/ProductSlice";
import ProductCard from "../components/Product";
import useCartStore from "../../store/CartSlice";

export default function ProductDetailPage() {
  const { addToCart, error } = useCartStore();
  const { id } = useParams();
  const { getProductById, products } = useProductStore();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // ✅ Helper function to get product images
  const getProductImages = () => {
    if (!product) return [];

    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }

    return [];
  };

  // ✅ Get current selected image URL
  const getCurrentImageUrl = () => {
    const images = getProductImages();
    
    if (images.length === 0) {
      return "https://via.placeholder.com/600x600?text=No+Image";
    }

    return images[selectedImageIndex]?.url || "https://via.placeholder.com/600x600?text=No+Image";
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!selectedSize) {
      alert("Please select a size first!");
      return;
    }
    try {
      await addToCart(product._id, 1, selectedSize?.size);
      alert(`✅ ${product.name} (Size: ${selectedSize?.size}) added to cart!`);
    } catch {
      alert(`❌ ${error || "Failed to add product"}`);
    }
  };

  useEffect(() => {
    if (id) {
      getProductById(id).then((data) => {
        const productData = data?.product || data;

        // Set first available size
        if (productData.sizes && productData.sizes.length > 0) {
          const firstAvailable = productData.sizes.find((s) => s.stock > 0) || productData.sizes[0];
          setSelectedSize(firstAvailable);
        }

        setProduct(productData);
        setSelectedImageIndex(0); // Reset to first image
      });
    }
  }, [id, getProductById]);

  // ✅ Similar products
  const similarProducts = useMemo(() => {
    if (!product || !products) return [];
    return products
      .filter((p) => p._id !== product._id && p.category === product.category)
      .slice(0, 5);
  }, [product, products]);

  const isSizeSelectable = (sizeObj) => sizeObj?.stock > 0;

  if (!product)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500 text-lg">Loading product details...</p>
      </div>
    );

  const productImages = getProductImages();

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ===== Image Section with Thumbnails ===== */}
        <div className="lg:col-span-7 flex gap-4">
          
          {/* Thumbnail Gallery - LEFT SIDE */}
          {productImages.length > 1 && (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-2">
              {productImages.map((img, index) => (
                <div
                  key={img._id || index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`
                    flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden 
                    cursor-pointer border-2 transition-all
                    ${selectedImageIndex === index ? 'border-green-500 shadow-md' : 'border-gray-200'}
                    hover:border-green-400 hover:shadow-sm
                  `}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover bg-gray-50"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80x80?text=Error";
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Main Image - RIGHT SIDE */}
          <div className="flex-1 rounded-2xl overflow-hidden bg-gray-50 shadow-lg flex items-center justify-center">
            <img
              src={getCurrentImageUrl()}
              alt={product.name}
              className="w-full h-full object-contain max-h-[600px] transition-opacity duration-300"
              style={{ aspectRatio: '1/1' }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x600?text=Error+Loading+Image";
              }}
            />
          </div>
        </div>

        {/* ===== Product Details ===== */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h1 className="text-3xl font-semibold text-gray-900 leading-snug">{product.name}</h1>

          <div className="text-gray-500 text-sm space-y-1">
            <p>
              <span className="font-medium text-gray-700">Brand:</span> {product.brand}
            </p>
            <p>
              <span className="font-medium text-gray-700">Category:</span> {product.category} → {product.subcategory}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-green-600">₹{product.price}</span>
          </div>

          {/* ===== Size Selection ===== */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Selected Size:</span>
                <span className="text-lg font-semibold text-green-600">{selectedSize?.size || "None"}</span>
                {selectedSize && (
                  <span className="text-sm text-gray-500">({selectedSize.stock} in stock)</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sizeObj) => (
                  <Button
                    key={sizeObj.size}
                    variant={selectedSize?.size === sizeObj.size ? "contained" : "outlined"}
                    color={isSizeSelectable(sizeObj) ? "success" : "inherit"}
                    size="medium"
                    disabled={!isSizeSelectable(sizeObj)}
                    onClick={() => setSelectedSize(sizeObj)}
                    sx={{
                      minWidth: '60px',
                      fontWeight: selectedSize?.size === sizeObj.size ? 'bold' : 'normal',
                      textDecoration: !isSizeSelectable(sizeObj) ? 'line-through' : 'none'
                    }}
                  >
                    {sizeObj.size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* ===== Stock & Status ===== */}
          <div className="flex flex-col gap-2">
            <span
              className={`inline-block w-fit px-4 py-1.5 rounded-full text-sm font-semibold ${
                product.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : product.status === "Limited"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.status}
            </span>
            {product.status === "Limited" && selectedSize && (
              <p className="text-orange-600 text-sm font-medium">
                ⚠️ Hurry! Only {selectedSize.stock} left for size {selectedSize.size}
              </p>
            )}
            {product.status === "Out of Stock" && (
              <p className="text-red-600 text-sm font-medium">
                ❌ Currently out of stock
              </p>
            )}
          </div>

          {/* ===== Add to Cart Button ===== */}
          <div className="flex gap-4 pt-2">
            <Button
              variant="contained"
              color="success"
              fullWidth
              size="large"
              disabled={!isSizeSelectable(selectedSize)}
              onClick={handleAddToCart}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              {!selectedSize 
                ? "Select a Size" 
                : !isSizeSelectable(selectedSize)
                ? "Out of Stock"
                : "Add to Cart"}
            </Button>
          </div>

          {/* ===== Description ===== */}
          <div className="pt-5 border-t border-gray-200">
            <p className="font-semibold text-gray-900 mb-2 text-lg">Description</p>
            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description || "No description available for this product."}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Additional Information Section ===== */}
      <div className="mt-16 pt-12 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Order Process */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Order</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. Select your size from available options</p>
              <p>2. Click "Add to Cart" button</p>
              <p>3. Review your cart and proceed to checkout</p>
              <p>4. Enter shipping address and select payment method</p>
              <p>5. Place order and receive within 3-5 business days</p>
            </div>
          </div>

          {/* Size Guide */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Size Guide</h3>
            <div className="space-y-3 text-sm text-gray-600">
              {product.category === "jersey" ? (
                <>
                  <p><strong>S:</strong> Chest 36-38" | Length 27"</p>
                  <p><strong>M:</strong> Chest 38-40" | Length 28"</p>
                  <p><strong>L:</strong> Chest 40-42" | Length 29"</p>
                  <p><strong>XL:</strong> Chest 42-44" | Length 30"</p>
                  <p><strong>XXL:</strong> Chest 44-46" | Length 31"</p>
                  <p className="text-xs italic mt-2">Note: Jerseys are designed for a comfortable fit. Size down for a tighter fit.</p>
                </>
              ) : product.category === "boots" ? (
                <>
                  <p><strong>UK 6:</strong> Foot length 24-24.5 cm</p>
                  <p><strong>UK 7:</strong> Foot length 25-25.5 cm</p>
                  <p><strong>UK 8:</strong> Foot length 26-26.5 cm</p>
                  <p><strong>UK 9:</strong> Foot length 27-27.5 cm</p>
                  <p><strong>UK 10:</strong> Foot length 28-28.5 cm</p>
                  <p className="text-xs italic mt-2">Note: If between sizes, choose the larger size for comfort.</p>
                </>
              ) : (
                <p>Please refer to the product description for size details.</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping & Product Info */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <span>🚚</span>
            <span>Fast Delivery</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>💳</span>
            <span>Secure Payment</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Authentic Products</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span>Cash on Delivery Available</span>
          </div>
        </div>
      </div>

      {/* ===== Similar Products ===== */}
      <div className="pt-16 border-t border-gray-100 mt-16">
        <Typography
          variant="h5"
          className="!mb-6 !font-semibold text-gray-900 !pb-2"
        >
          You May Also Like
        </Typography>

        {similarProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {similarProducts.map((p) => (
              <div
                key={p._id || p.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-2"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-4">No similar products available at the moment.</p>
        )}
      </div>
    </div>
  );
}