import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = "http://localhost:5000/api/"; // backend URL

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      customers: [],
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      addresses: [], // all saved addresses
      shippingAddresses: [], // array of shipping addresses
      selectedShippingAddressId: null, // selected address for checkout
      
      selectedAddress: null, // ✅ new state
      setSelectedAddress: (address) => set({ selectedAddress: address }), // ✅ setter

      // 🔹 Step 0: Set selected shipping address
      selectShippingAddress: (id) => set({ selectedShippingAddressId: id }),

      // 🔹 Step 1: Set shipping addresses
      setShippingAddresses: (addresses) =>
        set({ shippingAddresses: addresses }),

      requestOtp: async (email) => {
        set({ loading: true, error: null });
        try {
          console.log("📨 Sending OTP request for:", email);

          const res = await fetch(
            "http://localhost:5000/api/users/request-otp",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
              credentials: "include",
            }
          );

          const data = await res.json().catch(() => ({})); // in case backend doesn't return JSON

          if (!res.ok) {
            const msg = data.message || "Failed to send OTP";
            console.error("❌ OTP Request Error:", msg);
            throw new Error(msg);
          }

          console.log("✅ OTP sent successfully:", data);
          return data;
        } catch (err) {
          console.error("🚨 OTP request failed:", err.message);
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
          console.log("🌀 Loading set to false");
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
          if (!res.ok) {
            const msg = data?.message || "Invalid OTP";
            set({ error: msg });
            throw new Error(msg);
          }

          let user = data.user ?? {
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
          });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },

      // 🔹 Step 3: Save new address
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

          // Add to local shippingAddresses array
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

      // 🔹 Step 4: Fetch addresses (dummy for now)
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

          set({ addresses: data.addresses });
          return data.addresses;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      // 🔹 Step 5: Save selected shipping address to backend order
      saveShippingAddress: async (address) => {
        const { token } = get();
        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}order/shippingAddress`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ Token added
            },
            credentials: "include",
            body: JSON.stringify(address),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Failed to save shipping address");
          }

          const savedAddress = data.address || data;

          // ✅ Update selected address

          set((state) => ({
            selectedAddress: savedAddress, // ✅ Important
            shippingAddresses: [...state.shippingAddresses, savedAddress],
          }));

          return savedAddress;
        } catch (err) {
          console.error("❌ Save Shipping Address Error:", err);
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

    placeCODOrder: async () => {
  const { token, selectedAddress } = get();

  if (!selectedAddress) {
    throw new Error("No address selected"); // ✅ Safety check
  }

  console.log("📦 Placing COD order with address:", selectedAddress);

  const res = await fetch(`${API_BASE}order/cod`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      paymentMode: "COD",
      address: selectedAddress,
       // ✅ sending full address object
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to place COD order");
  return data;
},


      fetchUsers: async () => {
        try {
          set({ loading: true, error: null });
          const res = await fetch(`${API_BASE}users/getAllUser`, {
            // ⚡ updated route
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${get().token}`,
            },
            credentials: "include",
          });
          const data = await res.json();

          if (!res.ok || !data.success)
            throw new Error(data.message || "Failed to fetch users");

          set({ customers: data.users || [] }); // ⚡ store me update
          return data.users;
        } catch (err) {
          set({ error: err.message });
          console.error("Fetch users error:", err);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "user-storage",
    }
  )
);
