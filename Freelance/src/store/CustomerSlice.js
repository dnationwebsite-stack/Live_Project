import { create } from "zustand";
import useToastStore from "./ToastSlice";

const API_BASE = "https://dripnation.co.in/api/admin";
// const API_BASE = "http://localhost:5000/api/admin";

const toast = (message, severity = "success", duration = 3000) => {
  useToastStore.getState().showToast(message, severity, duration);
};

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

      if (!res.ok) throw new Error(data.message || "Failed to fetch customers");

      const customersArray = Array.isArray(data) ? data : data.customers || [];
      set({ customers: customersArray, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      toast(err.message || "Failed to fetch customers", "error")
    }
  },

  fetchCustomerById: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`${API_BASE}/getCustomer/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch customer");

      set({ selectedCustomer: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      toast(err.message || "Failed to fetch customer", "error")
    }
  },

  deleteCustomer: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/deleteCustomer/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete customer");

      set({ customers: get().customers.filter((c) => c._id !== id) });
      toast("Customer deleted successfully 🗑️", "success")
    } catch (err) {
      set({ error: err.message });
      toast(err.message || "Failed to delete customer", "error")
    }
  },

  clearSelected: () => set({ selectedCustomer: null }),
}));