import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useUserStore } from "./UserSlice";

const API_BASE = "https://dripnation.co.in/api";

const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,

      fetchProducts: async () => {
        set({ loading: true, error: null });

        try {
          const url = `${API_BASE}/product/getAllProduct`;

          const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ Response not OK:", errorText);
            throw new Error(
              `Failed to fetch products: ${res.status} ${res.statusText}`
            );
          }

          const data = await res.json();

          const products = data.data || [];

          set({ products, loading: false });

          return products;
        } catch (err) {
          set({ error: err.message, loading: false, products: [] });
          throw err;
        }
      },

      getProductById: async (id) => {
        try {
          const existingProduct = get().products.find((p) => p._id === id);
          if (existingProduct) {
            console.log("✅ Product found in cache");
            return existingProduct;
          }

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
          console.error("❌ getProductById ERROR:", err);
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      addProduct: async (productData) => {
        try {
          set({ loading: true, error: null });

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
            }
          }

          // ✅ Add detailed logging
          console.log("📤 API_BASE:", API_BASE);
          console.log("📤 Full URL:", `${API_BASE}/product/addProduct`);
          console.log("📤 Token exists:", !!token);
          console.log("📤 FormData contents:");
          for (let pair of formData.entries()) {
            if (pair[1] instanceof File) {
              console.log(
                `  ${pair[0]}:`,
                `File(${pair[1].name}, ${(pair[1].size / 1024).toFixed(2)} KB)`
              );
            } else {
              console.log(`  ${pair[0]}:`, pair[1]);
            }
          }

          console.log("📤 Sending request...");

          const res = await fetch(`${API_BASE}/product/addProduct`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              // DO NOT add Content-Type - browser sets it automatically for FormData
            },
            credentials: "include",
            body: formData,
          });

          console.log("📥 Response received:", res.status, res.statusText);

          if (!res.ok) {
            let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
            try {
              const errorData = await res.json();
              errorMessage = errorData.message || errorMessage;
              console.error("❌ Server error response:", errorData);
            } catch (e) {
              const errorText = await res.text();
              console.error("❌ Server error text:", errorText);
              errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          }

          const data = await res.json();
          console.log("✅ Response data:", data);

          const product = data.data || data.product || data;

          set((state) => ({
            products: [...state.products, product],
            loading: false,
          }));

          console.log("✅ Product added to store");
          return product;
        } catch (err) {
          console.error("❌ addProduct ERROR:", err);
          console.error("❌ Error name:", err.name);
          console.error("❌ Error message:", err.message);
          console.error("❌ Error stack:", err.stack);

          set({ error: err.message, loading: false });
          throw err;
        }
      },
      updateProduct: async (id, data) => {
        set({ loading: true, error: null });

        try {
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
              Authorization: `Bearer ${token}`,
            },
          };

          if (!isFormData) {
            options.headers["Content-Type"] = "application/json";
          }

          const res = await fetch(
            `${API_BASE}/product/updateProduct/${id}`,
            options
          );

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
          console.error("❌ updateProduct ERROR:", error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      deleteProduct: async (id) => {
        try {
          set({ loading: true, error: null });

          const token = useUserStore.getState().token;

          if (!token) {
            throw new Error("Unauthorized: Token missing");
          }

          const res = await fetch(`${API_BASE}/product/deleteProduct/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
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
          console.error("❌ deleteProduct ERROR:", err);
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      deleteImage: async (productId, imageId) => {
        console.log("🔵 deleteImage:", productId, imageId);

        try {
          set({ loading: true, error: null });

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
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to delete image");
          }

          const response = await res.json();

          console.log("✅ Image deleted");

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
          console.error("❌ deleteImage ERROR:", error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      setPrimaryImage: async (productId, imageId) => {
        console.log("🔵 setPrimaryImage:", productId, imageId);

        try {
          set({ loading: true, error: null });

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
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to set primary image");
          }

          const response = await res.json();

          console.log("✅ Primary image set");

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
          console.error("❌ setPrimaryImage ERROR:", error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      reorderImages: async (productId, imageOrder) => {
        console.log("🔵 reorderImages:", productId);

        try {
          set({ loading: true, error: null });

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
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ imageOrder }),
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to reorder images");
          }

          const response = await res.json();

          console.log("✅ Images reordered");

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
          console.error("❌ reorderImages ERROR:", error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      addImages: async (productId, images) => {
        console.log("🔵 addImages:", productId);

        try {
          set({ loading: true, error: null });

          const token = useUserStore.getState().token;

          if (!token) {
            throw new Error("Unauthorized: Token missing");
          }

          const formData = new FormData();
          images.forEach((image) => formData.append("images", image));

          const res = await fetch(
            `${API_BASE}/product/addImages/${productId}`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to add images");
          }

          const response = await res.json();

          console.log("✅ Images added");

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
          console.error("❌ addImages ERROR:", error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "product-store",
      partialize: (state) => ({ products: state.products }),
    }
  )
);

export default useProductStore;
