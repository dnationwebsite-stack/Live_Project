import { create } from "zustand";
import { persist } from "zustand/middleware";

// Correct API Base (no HTTPS unless reverse proxy exists)  
const API_BASE = "http://localhost:5000/api/";

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      orders: [],
      customers: [],
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      addresses: [],
      shippingAddresses: [],
      selectedShippingAddressId: null,
      selectedAddress: null,

      setSelectedAddress: (address) => set({ selectedAddress: address }),
      selectShippingAddress: (id) => set({ selectedShippingAddressId: id }),
      setShippingAddresses: (addresses) => set({ shippingAddresses: addresses }),

      requestOtp: async (email) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}users/request-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
            credentials: "include",
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || "Failed to send OTP");

          return data;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      verifyOtp: async (email, otp) => {
        try {
          set({ loading: true, error: null });
          const res = await fetch(`${API_BASE}users/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data?.message || "Invalid OTP");

          const user = data.user ?? {
            _id: data._id ?? data.id ?? null,
            email: data.email ?? null,
            role: data.role ?? null,
          };
          const token = data.token ?? data.accessToken ?? null;

          set({
            user,
            token,
            isAuthenticated: true,
            error: null,
          });

          return { user, token, raw: data };
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          const res = await fetch(`${API_BASE}users/logout`, {
            method: "POST",
            credentials: "include",
          });
          if (!res.ok) throw new Error("Logout failed");

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            addresses: [],
            shippingAddresses: [],
            selectedShippingAddressId: null,
            orders: [],
            customers: [],
          });
        } catch {}
      },

      saveAddress: async (address) => {
        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}users/saveAddress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(address),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to add address");

          set((state) => ({
            shippingAddresses: [
              ...state.shippingAddresses,
              { ...address, id: Date.now().toString() },
            ],
          }));

          return data.addresses;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      getAddresses: async () => {
        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}users/getAddresses`, {
            method: "GET",
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok)
            throw new Error(data.message || "Failed to fetch addresses");

          set({
            addresses: data.addresses,
            shippingAddresses: data.addresses,
          });

          return data.addresses;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      saveShippingAddress: async (address) => {
        const { token } = get();
        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}order/shippingAddress`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify(address),
          });

          const data = await res.json();
          if (!res.ok)
            throw new Error(data.message || "Failed to save shipping address");

          const savedAddress = data.address || data;

          set((state) => ({
            selectedAddress: savedAddress,
            shippingAddresses: [...state.shippingAddresses, savedAddress],
          }));

          return savedAddress;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      placeCODOrder: async () => {
        const { token, selectedAddress } = get();

        if (!selectedAddress) throw new Error("No address selected");

        const res = await fetch(`${API_BASE}order/cod`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            paymentMode: "COD",
            address: selectedAddress,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to place COD order");

        return data;
      },

      checkWelcomeDiscount: async () => {
        const { token } = get();
        if (!token) return { isEligible: false, discountPercentage: 0 };

        try {
          const res = await fetch(
            `${API_BASE}payment/check-discount?_t=${Date.now()}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            }
          );

          const data = await res.json();
          if (!res.ok)
            return { isEligible: false, discountPercentage: 0 };

          return data;
        } catch {
          return { isEligible: false, discountPercentage: 0 };
        }
      },

      createRazorpayOrder: async (amount) => {
        const { token } = get();
        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}payment/create-order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify({ amount }),
          });

          const data = await res.json();
          if (!res.ok)
            throw new Error(data.message || "Failed to create Razorpay order");

          return data.order;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        addresses: state.addresses,
        shippingAddresses: state.shippingAddresses,
        selectedShippingAddressId: state.selectedShippingAddressId,
        selectedAddress: state.selectedAddress,
      }),
    }
  )
);
