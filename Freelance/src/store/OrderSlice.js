// src/store/DummyOrders.js
import { create } from "zustand";

const useOrderStore = create((set) => ({
  orders: [
    {
      id: "ORD12345",
      date: "2025-10-17",
      status: "Pending",
      total: 2599,
      products: [
        { name: "Men T-Shirt", qty: 2, price: 599 },
        { name: "Jeans", qty: 1, price: 1400 },
      ],
    },
    {
      id: "ORD12346",
      date: "2025-10-10",
      status: "Delivered",
      total: 1999,
      products: [
        { name: "Women Top", qty: 1, price: 999 },
        { name: "Skirt", qty: 1, price: 1000 },
      ],
    },
  ],
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
}));

export default useOrderStore;
