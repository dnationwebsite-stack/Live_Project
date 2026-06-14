// store/ToastSlice.js
import { create } from "zustand";

const useToastStore = create((set) => ({
  open: false,
  message: "",
  severity: "success", // "success" | "error" | "warning" | "info"
  duration: 3000,

  showToast: (message, severity = "success", duration = 3000) => {
    set({ open: true, message, severity, duration });
  },

  hideToast: () => {
    set({ open: false });
  },
}));

export default useToastStore;