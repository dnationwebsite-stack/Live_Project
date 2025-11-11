import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = "http://localhost:5000/api";

const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,

      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          console.log("Fetching products...");
          
          const res = await fetch(
            "http://localhost:5000/api/product/getAllProduct",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", 
            }
          );
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

          console.log("📤 Adding product...");

          const res = await fetch(`${API_BASE}/product/addProduct`, {
            method: "POST",
            credentials: "include",
            body: formData,
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to add product");
          }

          const data = await res.json();
          console.log("✅ Product added:", data);
          const product = data.data || data.product || data;

          set((state) => ({
            products: [...state.products, product],
            loading: false,
          }));

          return product;
        } catch (err) {
          console.error("❌ Add product error:", err);
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      updateProduct: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const isFormData = data instanceof FormData;
          
          const options = {
            method: "PUT",
            credentials: "include",
            body: isFormData ? data : JSON.stringify(data),
          };

          if (!isFormData) {
            options.headers = {
              'Content-Type': 'application/json'
            };
          }

          console.log('📤 Updating product:', id, isFormData ? 'FormData' : 'JSON');

          const res = await fetch(
            `http://localhost:5000/api/product/updateProduct/${id}`,
            options
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to update product");
          }

          const response = await res.json();
          console.log('✅ Product updated:', response);

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
          console.error("❌ Update product error:", error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      deleteProduct: async (id) => {
        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}/product/deleteProduct/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
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

      // ============================================
      // NEW IMAGE MANAGEMENT FUNCTIONS
      // ============================================

      // Delete a specific image from a product
      deleteImage: async (productId, imageId) => {
        try {
          set({ loading: true, error: null });

          const res = await fetch(
            `${API_BASE}/product/deleteImage/${productId}/${imageId}`,
            {
              method: "DELETE",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to delete image");
          }

          const response = await res.json();
          console.log("✅ Image deleted:", response);

          if (response.success) {
            // Update the product in state with the new data
            set((state) => ({
              products: state.products.map((p) =>
                p._id === productId ? response.data : p
              ),
              loading: false,
            }));
            return response.data;
          }
        } catch (error) {
          console.error("❌ Delete image error:", error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // Set a specific image as primary
      setPrimaryImage: async (productId, imageId) => {
        try {
          set({ loading: true, error: null });

          const res = await fetch(
            `${API_BASE}/product/setPrimaryImage/${productId}/${imageId}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to set primary image");
          }

          const response = await res.json();
          console.log("✅ Primary image set:", response);

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
          console.error("❌ Set primary image error:", error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // Reorder images
      reorderImages: async (productId, imageOrder) => {
        try {
          set({ loading: true, error: null });

          const res = await fetch(
            `${API_BASE}/product/reorderImages/${productId}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageOrder }),
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to reorder images");
          }

          const response = await res.json();
          console.log("✅ Images reordered:", response);

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
          console.error("❌ Reorder images error:", error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // Add images to existing product
      addImages: async (productId, images) => {
        try {
          set({ loading: true, error: null });

          const formData = new FormData();
          images.forEach((image) => {
            formData.append("images", image);
          });

          const res = await fetch(
            `${API_BASE}/product/addImages/${productId}`,
            {
              method: "POST",
              credentials: "include",
              body: formData,
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to add images");
          }

          const response = await res.json();
          console.log("✅ Images added:", response);

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
          console.error("❌ Add images error:", error);
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