import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useUserStore } from "./UserSlice"; // ✅ Import to access token

const API_BASE = "http://82.112.231.28:5000/api";

const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,

      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/product/getAllProduct`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!res.ok) throw new Error("Failed to fetch products");
          const data = await res.json();
          set({ products: data.data || [], loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      getProductById: async (id) => {
        try {
          const existingProduct = get().products.find((p) => p._id === id);
          if (existingProduct) return existingProduct;

          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}/product/getProductById/${id}`, {
            credentials: "include",
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to fetch product");
          }

          const data = await res.json();
          const product = data.product || data;

          set((state) => ({
            products: [...state.products, product],
            loading: false,
          }));

          return product;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      addProduct: async (productData) => {
        try {
          set({ loading: true, error: null });

          // ✅ Get token from UserSlice
          const token = useUserStore.getState().token;
          
          if (!token) {
            throw new Error("Unauthorized: Token missing");
          }

          let formData;
          if (productData instanceof FormData) {
            formData = productData;
          } else {
            formData = new FormData();

            if (productData.name) formData.append("name", productData.name);
            if (productData.brand) formData.append("brand", productData.brand);
            if (productData.price) formData.append("price", productData.price);
            if (productData.category)
              formData.append("category", productData.category);
            if (productData.subcategory)
              formData.append("subcategory", productData.subcategory);
            if (productData.description)
              formData.append("description", productData.description);
            if (productData.status)
              formData.append("status", productData.status);

            if (productData.sizes) {
              formData.append("sizes", JSON.stringify(productData.sizes));
            }

            if (productData.images && Array.isArray(productData.images)) {
              productData.images.forEach((image) => {
                if (image instanceof File) {
                  formData.append("images", image);
                }
              });
            } else if (productData.image instanceof File) {
              formData.append("images", productData.image);
            }
          }

          const res = await fetch(`${API_BASE}/product/addProduct`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`, // ✅ Add token
            },
            credentials: "include",
            body: formData,
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to add product");
          }

          const data = await res.json();
          const product = data.data || data.product || data;

          set((state) => ({
            products: [...state.products, product],
            loading: false,
          }));

          return product;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      updateProduct: async (id, data) => {
        set({ loading: true, error: null });
        try {
          // ✅ Get token
          const token = useUserStore.getState().token;
          
          if (!token) {
            throw new Error("Unauthorized: Token missing");
          }

          const isFormData = data instanceof FormData;
          const options = {
            method: "PUT",
            credentials: "include",
            body: isFormData ? data : JSON.stringify(data),
            headers: {
              "Authorization": `Bearer ${token}`, // ✅ Add token
            }
          };

          // Only add Content-Type for JSON, not FormData
          if (!isFormData) {
            options.headers["Content-Type"] = "application/json";
          }

          const res = await fetch(`${API_BASE}/product/updateProduct/${id}`, options);

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to update product");
          }

          const response = await res.json();

          if (response.success) {
            set((state) => ({
              products: state.products.map((p) =>
                p._id === id ? response.data : p
              ),
              loading: false,
            }));
            return response.data;
          }
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      deleteProduct: async (id) => {
        try {
          set({ loading: true, error: null });

          // ✅ Get token
          const token = useUserStore.getState().token;
          
          if (!token) {
            throw new Error("Unauthorized: Token missing");
          }

          const res = await fetch(`${API_BASE}/product/deleteProduct/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, // ✅ Add token
            },
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to delete product");
          }

          set((state) => ({
            products: state.products.filter((p) => p._id !== id),
            loading: false,
          }));
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      deleteImage: async (productId, imageId) => {
        try {
          set({ loading: true, error: null });

          // ✅ Get token
          const token = useUserStore.getState().token;
          
          if (!token) {
            throw new Error("Unauthorized: Token missing");
          }

          const res = await fetch(
            `${API_BASE}/product/deleteImage/${productId}/${imageId}`,
            {
              method: "DELETE",
              credentials: "include",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // ✅ Add token
              },
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to delete image");
          }

          const response = await res.json();

          if (response.success) {
            set((state) => ({
              products: state.products.map((p) =>
                p._id === productId ? response.data : p
              ),
              loading: false,
            }));
            return response.data;
          }
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      setPrimaryImage: async (productId, imageId) => {
        try {
          set({ loading: true, error: null });

          // ✅ Get token
          const token = useUserStore.getState().token;
          
          if (!token) {
            throw new Error("Unauthorized: Token missing");
          }

          const res = await fetch(
            `${API_BASE}/product/setPrimaryImage/${productId}/${imageId}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // ✅ Add token
              },
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to set primary image");
          }

          const response = await res.json();

          if (response.success) {
            set((state) => ({
              products: state.products.map((p) =>
                p._id === productId ? response.data : p
              ),
              loading: false,
            }));
            return response.data;
          }
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      reorderImages: async (productId, imageOrder) => {
        try {
          set({ loading: true, error: null });

          // ✅ Get token
          const token = useUserStore.getState().token;
          
          if (!token) {
            throw new Error("Unauthorized: Token missing");
          }

          const res = await fetch(
            `${API_BASE}/product/reorderImages/${productId}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // ✅ Add token
              },
              body: JSON.stringify({ imageOrder }),
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to reorder images");
          }

          const response = await res.json();

          if (response.success) {
            set((state) => ({
              products: state.products.map((p) =>
                p._id === productId ? response.data : p
              ),
              loading: false,
            }));
            return response.data;
          }
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      addImages: async (productId, images) => {
        try {
          set({ loading: true, error: null });

          // ✅ Get token
          const token = useUserStore.getState().token;
          
          if (!token) {
            throw new Error("Unauthorized: Token missing");
          }

          const formData = new FormData();
          images.forEach((image) => formData.append("images", image));

          const res = await fetch(`${API_BASE}/product/addImages/${productId}`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Authorization": `Bearer ${token}`, // ✅ Add token
            },
            body: formData,
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to add images");
          }

          const response = await res.json();

          if (response.success) {
            set((state) => ({
              products: state.products.map((p) =>
                p._id === productId ? response.data : p
              ),
              loading: false,
            }));
            return response.data;
          }
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "product-store",
      partialState: (state) => ({ products: state.products }),
    }
  )
);

export default useProductStore;