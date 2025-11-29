import { create } from "zustand";

const API_BASE = "https://dripnation.co.in/api/admin";

export const useCustomerStore = create((set, get) => ({
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,

  fetchCustomers: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`${API_BASE}/allCustomer`, {
        credentials: "include", 
      });
      const data = await res.json();
      const customersArray = Array.isArray(data)
        ? data
        : data.customers || [];

      set({ customers: customersArray, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCustomerById: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`${API_BASE}/getCustomer/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      set({ selectedCustomer: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  deleteCustomer: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/deleteCustomer/${id}`, {
        method: "DELETE",
        credentials: "include", 
      });

      if (!res.ok) throw new Error("Failed to delete customer");

      set({
        customers: get().customers.filter((c) => c._id !== id),
      });
    } catch (err) {
      set({ error: err.message });
    }
  },

  clearSelected: () => set({ selectedCustomer: null }),
}));