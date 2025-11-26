import { create } from "zustand"
import { persist } from "zustand/middleware"

const API_BASE = "http://82.112.231.28:5000/api"

// Helper function to get token
const getAuthToken = () => {
  try {
    const userStorage = localStorage.getItem('user-storage');
    if (!userStorage) return null;
    
    const userData = JSON.parse(userStorage);
    return userData?.state?.token || null;
  } catch (e) {
    return null;
  }
};

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      loading: false,
      error: null,

      fetchCart: async () => {
        const token = getAuthToken();
        
        if (!token) {
          set({ cartItems: [], loading: false });
          return;
        }

        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_BASE}/cart/getCart`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Authorization": `Bearer ${token}` // ADD THIS
            }
          })
          
          if (res.status === 401) {
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
        const token = getAuthToken();
        
        if (!token) {
          set({ error: "Please login to add items to cart", loading: false });
          return;
        }

        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_BASE}/cart/addToCart`, {
            method: "POST",
            credentials: "include",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` // ADD THIS
            },
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
        const token = getAuthToken(); // ADD THIS
        
        if (!token) {
          set({ error: "Please login to update cart", loading: false });
          return;
        }

        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_BASE}/cart/updateCart`, {
            method: "PUT",
            credentials: "include",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` // ADD THIS
            },
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
        const token = getAuthToken(); // ADD THIS
        
        if (!token) {
          set({ error: "Please login to remove items", loading: false });
          return;
        }

        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_BASE}/cart/removeFromCart`, {
            method: "DELETE",
            credentials: "include",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` // ADD THIS
            },
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