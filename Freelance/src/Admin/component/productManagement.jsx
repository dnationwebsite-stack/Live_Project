"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Edit2,
  Trash2,
  Plus,
  Upload,
  Search,
  X,
  Image as ImageIcon,
  Star,
  GripVertical,
} from "lucide-react";
import useProductStore from "../../store/ProductSlice";
import toast, { Toaster } from "react-hot-toast";

export default function ProductManagement() {
  const {
    products,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteImage,
    setPrimaryImage,
    reorderImages,
    loading,
  } = useProductStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Only for NEW images
  const [searchTerm, setSearchTerm] = useState("");
  const formRef = useRef(null);

  const [categories, setCategories] = useState(["Jersey", "Boots"]);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [draggingIndex, setDraggingIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Jersey",
    subcategory: "",
    brand: "",
    description: "",
    existingImages: [], // Server images (with _id)
    newImages: [], // File objects to upload
    sizes: [],
    status: "Active",
  });

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [newImagePreviews]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setFormData({ ...formData, category: trimmed });
      setNewCategory("");
      setShowCategoryInput(false);
      toast.success("Category added!");
    }
  };

  const handleAddProduct = async () => {
    // Validation
    if (
      !formData.name?.trim() ||
      !formData.price ||
      !formData.category?.trim() ||
      !formData.subcategory?.trim() ||
      !formData.brand?.trim() ||
      !formData.description?.trim() ||
      !formData.sizes ||
      formData.sizes.length === 0 ||
      formData.sizes.some((s) => !s.size?.trim() || s.stock === undefined)
    ) {
      toast.error("Please fill all required fields and sizes with stock");
      return;
    }

    try {
      const totalStock = formData.sizes.reduce((acc, s) => acc + Number(s.stock || 0), 0);
      const status = totalStock === 0 ? "Out of Stock" : totalStock <= 10 ? "Limited" : "Active";

      if (editingId && formData.newImages.length === 0) {
        // UPDATE WITHOUT NEW IMAGES -> send JSON
        const updateData = {
          name: formData.name.trim(),
          price: formData.price,
          category: formData.category.trim().toLowerCase(),
          subcategory: formData.subcategory.trim(),
          brand: formData.brand.trim(),
          description: formData.description.trim(),
          status: status,
          sizes: formData.sizes.map((s) => ({ size: s.size, stock: Number(s.stock) })),
        };

        console.log("📤 Updating product with JSON (no new images):", updateData);
        await updateProduct(editingId, updateData);
      } else {
        // CREATE OR UPDATE WITH NEW IMAGES -> send FormData
        const productData = new FormData();
        productData.append("name", formData.name.trim());
        productData.append("price", formData.price);
        productData.append("category", formData.category.trim().toLowerCase());
        productData.append("subcategory", formData.subcategory.trim());
        productData.append("brand", formData.brand.trim());
        productData.append("description", formData.description.trim());
        productData.append("status", status);
        productData.append(
          "sizes",
          JSON.stringify(formData.sizes.map((s) => ({ size: s.size, stock: Number(s.stock) })))
        );

        // Append NEW images
        if (formData.newImages.length > 0) {
          formData.newImages.forEach((image) => {
            productData.append("images", image);
          });
          console.log("📤 Including", formData.newImages.length, "new images");
        }

        if (editingId) {
          console.log("📤 Updating product with FormData (has new images)");
          await updateProduct(editingId, productData);
        } else {
          console.log("📤 Creating product with", formData.newImages.length, "images");
          await addProduct(productData);
        }
      }

      toast.success(editingId ? "Product updated!" : "Product added!");

      // Reset form
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error(err?.message || "Failed to save product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: categories[0] || "Jersey",
      subcategory: "",
      brand: "",
      description: "",
      existingImages: [],
      newImages: [],
      sizes: [],
      status: "Active",
    });
    newImagePreviews.forEach((p) => {
      if (p.startsWith("blob:")) URL.revokeObjectURL(p);
    });
    setNewImagePreviews([]);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      description: product.description,
      existingImages: product.images || [],
      newImages: [],
      sizes: (product.sizes || []).map((s) => ({ ...s, id: s.id || Date.now() + Math.random() })),
      status: product.status,
    });

    setNewImagePreviews([]);
    setEditingId(product._id);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure to delete?")) {
      await deleteProduct(id);
      toast.success("Deleted!");
      await fetchProducts();
    }
  };

  // Handle NEW image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = formData.existingImages.length + formData.newImages.length + files.length;
    if (totalImages > 10) {
      toast.error("Maximum 10 images allowed per product");
      return;
    }

    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    setFormData((prev) => ({ ...prev, newImages: [...prev.newImages, ...files] }));

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);

    toast.success(`${files.length} image(s) added`);
  };

  // Remove NEW image (local only)
  const removeNewImage = (index) => {
    if (newImagePreviews[index]?.startsWith("blob:")) {
      URL.revokeObjectURL(newImagePreviews[index]);
    }

    setFormData((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  // Delete EXISTING image from server
  const handleDeleteExistingImage = async (imageId) => {
    if (!confirm("Are you sure you want to delete this image? This cannot be undone.")) return;

    try {
      await deleteImage(editingId, imageId);
      
      // Update local state
      const updatedProduct = products.find((p) => p._id === editingId);
      if (updatedProduct) {
        setFormData((prev) => ({
          ...prev,
          existingImages: updatedProduct.images || [],
        }));
      }
      
      toast.success("Image deleted from server");
      await fetchProducts();
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  // Set primary image
  const handleSetPrimary = async (imageId) => {
    try {
      await setPrimaryImage(editingId, imageId);
      
      const updatedProduct = products.find((p) => p._id === editingId);
      if (updatedProduct) {
        setFormData((prev) => ({
          ...prev,
          existingImages: updatedProduct.images || [],
        }));
      }
      
      toast.success("Primary image updated");
      await fetchProducts();
    } catch (error) {
      toast.error("Failed to set primary image");
    }
  };

  // Drag and drop reorder
  const handleDragStart = (e, index) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;

    const items = [...formData.existingImages];
    const draggedItem = items[draggingIndex];
    items.splice(draggingIndex, 1);
    items.splice(index, 0, draggedItem);

    setFormData((prev) => ({ ...prev, existingImages: items }));
    setDraggingIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggingIndex === null) return;

    try {
      const imageOrder = formData.existingImages.map((img) => img._id);
      await reorderImages(editingId, imageOrder);
      toast.success("Images reordered");
      await fetchProducts();
    } catch (error) {
      toast.error("Failed to reorder images");
    }

    setDraggingIndex(null);
  };

  const addSize = () =>
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { id: Date.now() + Math.random(), size: "", stock: 0 }],
    });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  return (
    <div className="p-8 relative">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-foreground">Products</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              resetForm();
              setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 150);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40">
          <div
            ref={formRef}
            className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200 sm:max-w-[95%]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">{editingId ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-red-500 transition">
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Product Name *</label>
                <input
                  placeholder="e.g., Manchester United Jersey"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Price *</label>
                <input
                  placeholder="e.g., 4999"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-gray-700">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setShowCategoryInput(true);
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add New Category</option>
                </select>

                {showCategoryInput && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border rounded-lg shadow-lg z-10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter new category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleAddCategory();
                        }}
                        className="flex-1 border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        autoFocus
                      />
                      <button onClick={handleAddCategory} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowCategoryInput(false);
                          setNewCategory("");
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Subcategory *</label>
                <input
                  placeholder="e.g., Premier League"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Brand *</label>
                <input
                  placeholder="e.g., Adidas"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">Description *</label>
                <textarea
                  placeholder="Enter product description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                />
              </div>
            </div>

            {/* IMAGE MANAGEMENT SECTION */}
            <div className="mb-4 space-y-4">
              {/* Existing Images (only in edit mode) */}
              {editingId && formData.existingImages.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">
                    Existing Images ({formData.existingImages.length})
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {formData.existingImages.map((image, index) => (
                      <div
                        key={image._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`relative group border-2 rounded-lg overflow-hidden cursor-move ${
                          draggingIndex === index ? "opacity-50" : ""
                        } ${image.isPrimary ? "border-blue-500" : "border-gray-200"}`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `Product image ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />

                        {/* Drag Handle */}
                        <div className="absolute top-1 left-1 bg-gray-800/70 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical size={14} />
                        </div>

                        {/* Primary Badge */}
                        {image.isPrimary && (
                          <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Star size={10} fill="white" /> Primary
                          </span>
                        )}

                        {/* Action Buttons */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(image._id)}
                              className="bg-blue-500 text-white rounded p-1 hover:bg-blue-600"
                              title="Set as primary"
                            >
                              <Star size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteExistingImage(image._id)}
                            className="bg-red-500 text-white rounded p-1 hover:bg-red-600"
                            title="Delete image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Drag images to reorder • Click star to set primary • Click X to delete
                  </p>
                </div>
              )}

              {/* New Images Preview */}
              {formData.newImages.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">
                    New Images to Upload ({formData.newImages.length})
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group border-2 border-green-500 rounded-lg overflow-hidden">
                        <img src={preview} alt={`New image ${index + 1}`} className="w-full h-24 object-cover" />
                        <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          New
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Add Images ({formData.existingImages.length + formData.newImages.length}/10)
                </label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <label
                    htmlFor="images-upload"
                    className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 transition-colors py-4"
                  >
                    <Upload size={28} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload images (Max 10 total, 5MB each)</span>
                    <span className="text-xs text-gray-400">JPG, PNG, GIF, WebP</span>
                  </label>
                  <input type="file" accept="image/*" id="images-upload" className="hidden" multiple onChange={handleImageUpload} />
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Sizes & Stock *</h4>
              {formData.sizes.map((s) => (
                <div key={s.id} className="flex gap-2 mb-2">
                  <input
                    placeholder="Size (e.g., S, M, L)"
                    value={s.size || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sizes: formData.sizes.map((item) =>
                          item.id === s.id ? { ...item, size: e.target.value } : item
                        ),
                      })
                    }
                    className="border p-2 rounded-lg w-1/2"
                  />
                  <input
                    placeholder="Stock"
                    type="number"
                    value={s.stock ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sizes: formData.sizes.map((item) =>
                          item.id === s.id ? { ...item, stock: Number(e.target.value) } : item
                        ),
                      })
                    }
                    className="border p-2 rounded-lg w-1/2"
                  />
                  <button
                    onClick={() =>
                      setFormData({ ...formData, sizes: formData.sizes.filter((item) => item.id !== s.id) })
                    }
                    className="px-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              ))}
              <button onClick={addSize} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Add Size
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={handleAddProduct} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                {loading ? "Saving..." : "Save"}
              </button>
              <button onClick={resetForm} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="grid gap-4 mt-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div key={`${product._id}-${index}`} className="p-4 border rounded-xl flex justify-between items-center gap-4 hover:shadow-md transition">
              {/* Display multiple images */}
              <div className="flex gap-2">
                {product.images && product.images.length > 0 ? (
                  product.images.slice(0, 3).map((img, idx) => (
                    <img
                      key={idx}
                      src={typeof img === "string" ? img : img.url}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  ))
                ) : product.image ? (
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg border" />
                ) : null}

                {product.images && product.images.length > 3 && (
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg border text-sm text-gray-600">
                    +{product.images.length - 3}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-500">
                  {product.category} / {product.subcategory}
                </p>
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={`font-bold ${
                      product.status === "Out of Stock"
                        ? "text-red-500"
                        : product.status === "Limited"
                        ? "text-orange-500"
                        : "text-green-600"
                    }`}
                  >
                    {product.status}
                  </span>
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-bold text-lg">₹{product.price}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Sizes</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes?.map((s) => (
                      <span key={s.id || s.size} className="px-2 py-1 border rounded text-xs bg-gray-50">
                        {s.size}: {s.stock}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(product)} className="p-2 border rounded-lg hover:bg-blue-50">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="p-2 border rounded-lg hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No products found</p>
        )}
      </div>
    </div>
  );
}