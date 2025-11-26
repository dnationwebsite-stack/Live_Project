import { create } from "zustand"
import { persist } from "zustand/middleware"

const API_BASE = "http://82.112.231.28:5000/api"

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      loading: false,
      error: null,

      fetchCart: async () => {
        // Check if user is authenticated before making the request
        const token = localStorage.getItem('user-storage');
        if (!token) {
          set({ cartItems: [], loading: false });
          return;
        }

        // Parse the stored data to check authentication
        let isAuthenticated = false;
        try {
          const userData = JSON.parse(token);
          isAuthenticated = userData?.state?.isAuthenticated && userData?.state?.token;
        } catch (e) {
          set({ cartItems: [], loading: false });
          return;
        }

        if (!isAuthenticated) {
          set({ cartItems: [], loading: false });
          return;
        }

        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_BASE}/cart/getCart`, {
            method: "GET",
            credentials: "include",
          })
          
          if (res.status === 401) {
            // Unauthorized - clear cart and return
            set({ cartItems: [], loading: false, error: null })
            return;
          }

          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Failed to fetch cart")

          set({ cartItems: data.cart.products || [], loading: false })
        } catch (err) {
          set({ error: err.message, loading: false, cartItems: [] })
        }
      },

      addToCart: async (productId, quantity = 1, size) => {
        // Check authentication before adding to cart
        const token = localStorage.getItem('user-storage');
        let isAuthenticated = false;
        try {
          const userData = JSON.parse(token);
          isAuthenticated = userData?.state?.isAuthenticated && userData?.state?.token;
        } catch (e) {
          set({ error: "Please login to add items to cart", loading: false });
          return;
        }

        if (!isAuthenticated) {
          set({ error: "Please login to add items to cart", loading: false });
          return;
        }

        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_BASE}/cart/addToCart`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity, size }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Failed to add to cart")

          await get().fetchCart()
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },

      updateCart: async (productId, quantity, size) => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_BASE}/cart/updateCart`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity, size }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Failed to update cart")

          await get().fetchCart()
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },

      removeFromCart: async (productId, size) => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_BASE}/cart/removeFromCart`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, size }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Failed to remove item")

          await get().fetchCart()
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },
      
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: "cart-store", 
    }
  )
)

export default useCartStore