"use client";

import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Upload, X } from "lucide-react";
import { useProductStore } from "../store/productSlice";
import toast, { Toaster } from "react-hot-toast";

export function ProductManagement() {
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct, loading } = useProductStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Jersey",
    subcategory: "",
    brand: "",
    description: "",
    image: "",
    sizes: [],
    status: "Active",
  });

  const token = "dummy.jwt.token.123"; // replace with real token

  useEffect(() => { fetchProducts(); }, []);

  const handleAddProduct = async () => {
    // ✅ Validation
    if (!formData.name?.trim() || !formData.price || !formData.category?.trim() || !formData.subcategory?.trim() || !formData.brand?.trim() || !formData.description?.trim() || !formData.sizes || formData.sizes.length === 0 || formData.sizes.some(s => !s.size?.trim() || s.stock === undefined)) {
      toast.error("Please fill all required fields and sizes with stock");
      return;
    }

    try {
      const totalStock = formData.sizes.reduce((acc, s) => acc + Number(s.stock || 0), 0);
      const status = totalStock === 0 ? "Out of Stock" : totalStock <= 10 ? "Limited" : "Active";

      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("price", formData.price);
      data.append("category", formData.category.trim().toLowerCase());

      data.append("subcategory", formData.subcategory.trim());
      data.append("brand", formData.brand.trim());
      data.append("description", formData.description.trim());
      data.append("sizes", JSON.stringify(formData.sizes));
      data.append("status", status);

      if (formData.image instanceof File) data.append("image", formData.image);

      if (editingId) await updateProduct(editingId, data, token);
      else await addProduct(data, token);

      toast.success(editingId ? "Product updated!" : "Product added!");

      setFormData({ name: "", price: "", category: "Jersey", subcategory: "", brand: "", description: "", image: "", sizes: [], status: "Active" });
      setShowForm(false);
      setEditingId(null);

    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      description: product.description,
      image: product.image || "",
      sizes: product.sizes.map(s => ({ ...s, id: s.id || Date.now() + Math.random() })),
      status: product.status,
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure to delete?")) await deleteProduct(id, token) && toast.success("Deleted!");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, image: file });
  };

  const addSize = () => setFormData({ ...formData, sizes: [...formData.sizes, { id: Date.now() + Math.random(), size: "", stock: 0 }] });

  return (
    <div className="p-8">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-foreground">Products</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", price: "", category: "Jersey", subcategory: "", brand: "", description: "", image: "", sizes: [], status: "Active" }); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="p-6 mb-8 border rounded shadow">
          <h3 className="text-xl font-bold mb-4">{editingId ? "Edit Product" : "Add New Product"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Subcategory" value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="border p-2 rounded" />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Product Image</label>
            <div className="flex gap-4 items-start">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors">
                <Upload size={20} /> <span className="text-sm">Click to upload image</span>
              </label>
              {formData.image && <img src={typeof formData.image === "string" ? formData.image : URL.createObjectURL(formData.image)} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />}
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Sizes & Stock</h4>
            {formData.sizes.map((s) => (
              <div key={s.id} className="flex gap-2 mb-2">
                <input placeholder="Size" value={s.size} onChange={(e) => setFormData({ ...formData, sizes: formData.sizes.map(item => item.id === s.id ? { ...item, size: e.target.value } : item) })} className="border p-2 rounded w-1/2" />
                <input placeholder="Stock" type="number" value={s.stock} onChange={(e) => setFormData({ ...formData, sizes: formData.sizes.map(item => item.id === s.id ? { ...item, stock: Number(e.target.value) } : item) })} className="border p-2 rounded w-1/2" />
                <button onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter(item => item.id !== s.id) })} className="px-2 bg-red-500 text-white rounded">X</button>
              </div>
            ))}
            <button onClick={addSize} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Add Size</button>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddProduct} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded">{loading ? "Saving..." : "Save"}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="grid gap-4">
        {products.length > 0 ? products.map((product) => (
          <div key={product._id} className="p-4 border rounded flex justify-between items-center gap-4 hover:shadow-md">
            {product.image && <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />}
            <div className="flex-1">
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm">{product.category} / {product.subcategory}</p>
              <p className="text-sm">Status: <span className="font-bold">{product.status}</span></p>
            </div>
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-bold">${product.price}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Sizes & Stock</p>
                <div className="flex gap-2 flex-wrap">{product.sizes?.map((s) => <span key={s.id || s.size} className="px-2 py-1 border rounded text-sm">{s.size}: {s.stock}</span>)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(product)} className="p-2 border rounded"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(product._id)} className="p-2 border rounded"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        )) : <p>No products found</p>}
      </div>
    </div>
  );
}
