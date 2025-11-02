import { create } from "zustand";

const API_BASE = "http://localhost:5000/api/product";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ loading: true });
      const res = await fetch(`${API_BASE}/getAllProduct`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch products");
      set({ products: data.products, loading: false });
    } catch (error) {
      console.error("Fetch Products Error:", error);
      set({ error: error.message, loading: false });
    }
  },

  addProduct: async (formData, token) => {
    try {
      set({ loading: true });

      const res = await fetch(`${API_BASE}/addProduct`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Server error");

      set({
        products: [...get().products, result.product],
        loading: false,
      });
    } catch (error) {
      console.error("Add Product Error:", error);
      set({ error: error.message, loading: false });
    }
  },

  updateProduct: async (id, formData, token) => {
    try {
      set({ loading: true });

      const res = await fetch(`${API_BASE}/updateProduct/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Server error");

      set({
        products: get().products.map((p) => (p._id === id ? result.product : p)),
        loading: false,
      });
    } catch (error) {
      console.error("Update Product Error:", error);
      set({ error: error.message, loading: false });
    }
  },

  deleteProduct: async (id, token) => {
    try {
      set({ loading: true });

      const res = await fetch(`${API_BASE}/deleteProduct/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Server error");

      set({
        products: get().products.filter((p) => p._id !== id),
        loading: false,
      });
    } catch (error) {
      console.error("Delete Product Error:", error);
      set({ error: error.message, loading: false });
    }
  },
}));
