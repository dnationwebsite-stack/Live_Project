import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = "http://localhost:5000/api";

const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,

      // ✅ Fetch all products
      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/product/getAllProduct`);
          if (!res.ok) throw new Error("Failed to fetch products");

          const data = await res.json();
          set({ products: data.products || [], loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      getProductById: async (id) => {
        try {
          set({ loading: true, error: null });

          // if not found → fetch from backend
          const res = await fetch(`${API_BASE}/product/getProductById/${id}`, {
            credentials: "include",
          });
          if (!res.ok) throw new Error("Failed to fetch product");
          const data = await res.json();

          // add into state
          set({ products: [...get().products, data], loading: false });
          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      // ✅ Add product
      addProduct: async (newProduct) => {
        try {
          set({ loading: true, error: null });
          const res = await fetch(`${API_BASE}/product/addProduct`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: formData,
          });
          if (!res.ok) throw new Error("Failed to add product");
          const data = await res.json();
          set({ products: [...get().products, data], loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      // ✅ Update product
      updateProduct: async (id, updatedData) => {
        try {
          set({ loading: true, error: null });
          const res = await fetch(`${API_BASE}/product/updateProduct/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updatedData),
          });
          if (!res.ok) throw new Error("Failed to update product");
          const data = await res.json();

          const addedProduct = data.product ? data.product : data;

          set({ products: [...get().products, addedProduct], loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      // ✅ Delete product
      deleteProduct: async (id) => {
        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}/product/deleteProduct/${id}`, {
            method: "DELETE",
            credentials: "include", // send cookies
            headers: {
              "Content-Type": "application/json", // Authorization remove karo
            },
          });

          if (!res.ok) throw new Error("Failed to delete product");

          set((state) => ({
            ...state,
            products: state.products.filter((p) => p._id !== id),
            loading: false,
          }));
        } catch (err) {
          set((state) => ({ ...state, error: err.message, loading: false }));
        }
      },
    }),
    {
      name: "product-store", // localStorage key
    }
  )
);

export default useProductStore;
