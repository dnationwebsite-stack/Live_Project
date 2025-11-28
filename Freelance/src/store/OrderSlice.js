import { create } from 'zustand';

const API_BASE_URL = "https://82.112.231.28:5000/api";

// Helper function to get token from cookies
const getTokenFromCookie = () => {
  const name = 'token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
};

export const useOrderStore = create((set, get) => ({
  // State
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  
  // Fetch all orders (Admin)
  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const token = getTokenFromCookie();
      
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/order/all-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please login again');
        }
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      set({ orders: data.orders || data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching orders:', error);
    }
  },

  // Fetch user's orders
  fetchUserOrders: async () => {
    set({ loading: true, error: null });
    try {
      const token = getTokenFromCookie();
      
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/order/my-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please login again');
        }
        throw new Error('Failed to fetch user orders');
      }

      const data = await response.json();
      set({ orders: data.orders || data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching user orders:', error);
    }
  },

  // Fetch single order by ID
  fetchOrderById: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      if (state.orders.length === 0) {
        await get().fetchUserOrders();
      }
      
      const order = get().orders.find(o => o._id === orderId);
      
      if (order) {
        set({ currentOrder: order, loading: false });
        return order;
      } else {
        throw new Error('Order not found');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching order:', error);
      return null;
    }
  },

  // Update order status
  handleStatusChange: async (orderId, status) => {
    set({ loading: true, error: null });
    try {
      const token = getTokenFromCookie();
      
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/order/status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please login again');
        }
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      set((state) => ({
        orders: state.orders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        ),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error updating order status:', error);
      return null;
    }
  },

  // Update order - local only
  updateOrder: async (orderId, updateData) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order._id === orderId ? { ...order, ...updateData } : order
      ),
    }));
    console.warn('updateOrder: No backend endpoint available, updated locally only');
    return { success: true, message: 'Updated locally' };
  },

  // Delete order - local only
  deleteOrder: async (orderId) => {
    set((state) => ({
      orders: state.orders.filter((order) => order._id !== orderId),
    }));
    console.warn('deleteOrder: No backend endpoint available, removed locally only');
    return true;
  },

  // Create order using COD endpoint
  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const token = getTokenFromCookie();
      
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/order/cod`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please login again');
        }
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      set((state) => ({
        orders: [data.order || data, ...state.orders],
        loading: false,
      }));
      return data.order || data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error creating order:', error);
      return null;
    }
  },

  // Save shipping address
  saveShippingAddress: async (addressData) => {
    set({ loading: true, error: null });
    try {
      const token = getTokenFromCookie();
      
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/order/shippingAddress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please login again');
        }
        throw new Error('Failed to save shipping address');
      }

      const data = await response.json();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error saving shipping address:', error);
      return null;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  resetStore: () => set({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  }),
}));