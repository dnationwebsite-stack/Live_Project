import { create } from "zustand";
import { persist } from "zustand/middleware";

// Correct API Base (no HTTPS unless reverse proxy exists)  
const API_BASE = "http://82.112.231.28:5000/api/";

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
        const { token, isAuthenticated } = get();
        
        // Check authentication
        if (!isAuthenticated || !token) {
          throw new Error("Please login to save address");
        }

        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}users/saveAddress`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
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
        const { token, isAuthenticated } = get();
        
        // ✅ FIX: Check authentication before making request
        if (!isAuthenticated || !token) {
          set({ addresses: [], shippingAddresses: [] });
          return [];
        }

        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}users/getAddresses`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            credentials: "include",
          });

          // ✅ FIX: Handle 401 gracefully
          if (res.status === 401) {
            set({ 
              addresses: [], 
              shippingAddresses: [],
              loading: false,
              error: null 
            });
            return [];
          }

          const data = await res.json();
          if (!res.ok)
            throw new Error(data.message || "Failed to fetch addresses");

          set({
            addresses: data.addresses || [],
            shippingAddresses: data.addresses || [],
            loading: false
          });

          return data.addresses || [];
        } catch (err) {
          set({ 
            error: err.message, 
            addresses: [], 
            shippingAddresses: [],
            loading: false 
          });
          return [];
        }
      },

      saveShippingAddress: async (address) => {
        const { token, isAuthenticated } = get();
        
        if (!isAuthenticated || !token) {
          throw new Error("Please login to save shipping address");
        }

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
        const { token, selectedAddress, isAuthenticated } = get();

        if (!isAuthenticated || !token) {
          throw new Error("Please login to place order");
        }

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
        const { token, isAuthenticated } = get();
        
        if (!isAuthenticated || !token) {
          return { isEligible: false, discountPercentage: 0 };
        }

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
        const { token, isAuthenticated } = get();
        
        if (!isAuthenticated || !token) {
          throw new Error("Please login to create order");
        }

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

      initiateRazorpayPayment: async (amount, cartItems, address) => {
        const { token, createRazorpayOrder } = get();
        
        if (!token) {
          throw new Error("Please login to make payment");
        }

        try {
          // Create Razorpay order
          const order = await createRazorpayOrder(amount);
          
          return new Promise((resolve, reject) => {
            const options = {
              key: "YOUR_RAZORPAY_KEY_ID", // Replace with your actual key
              amount: order.amount,
              currency: order.currency,
              name: "DRIP NATION",
              description: "Order Payment",
              order_id: order.id,
              handler: async function (response) {
                try {
                  // Verify payment on backend
                  const verifyRes = await fetch(`${API_BASE}payment/verify`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      address: address,
                    }),
                  });

                  const data = await verifyRes.json();
                  if (!verifyRes.ok) throw new Error(data.message || "Payment verification failed");
                  
                  resolve(data);
                } catch (err) {
                  reject(err);
                }
              },
              prefill: {
                name: address.fullName,
                contact: address.phoneNumber,
              },
              theme: {
                color: "#000000",
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
              reject(new Error(response.error.description));
            });
            rzp.open();
          });
        } catch (err) {
          throw err;
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