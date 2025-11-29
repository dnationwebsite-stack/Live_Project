import { create } from "zustand";
import { persist } from "zustand/middleware";

// Correct API Base (no HTTPS unless reverse proxy exists)
const API_BASE = "http://dripnation.co.in/api/";

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

      // ✅ ADD: Dashboard state
      dashboardStats: {
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        recentOrders: [],
      },

      setSelectedAddress: (address) => set({ selectedAddress: address }),
      selectShippingAddress: (id) => set({ selectedShippingAddressId: id }),
      setShippingAddresses: (addresses) =>
        set({ shippingAddresses: addresses }),

      // ✅ ADD: Fetch dashboard summary function
      fetchDashboardSummary: async () => {
        const { token, isAuthenticated } = get();

        if (!isAuthenticated || !token) {
          console.warn("User not authenticated");
          return;
        }

        set({ loading: true, error: null });

        try {
          const res = await fetch(`${API_BASE}dash/dashboard`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          if (!res.ok) {
            throw new Error("Failed to fetch dashboard data");
          }

          const data = await res.json();

          set({
            dashboardStats: {
              totalProducts: data.totalProducts || 0,
              totalOrders: data.totalOrders || 0,
              totalCustomers: data.totalCustomers || 0,
              recentOrders: data.recentOrders || [],
            },
            loading: false,
          });
        } catch (err) {
          console.error("Error fetching dashboard summary:", err);
          set({
            error: err.message,
            loading: false,
          });
        }
      },

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
            dashboardStats: {
              totalProducts: 0,
              totalOrders: 0,
              totalCustomers: 0,
              recentOrders: [],
            },
          });
        } catch {}
      },

      saveAddress: async (address) => {
        const { token, isAuthenticated } = get();

        if (!isAuthenticated || !token) {
          throw new Error("Please login to save address");
        }

        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}users/saveAddress`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
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

        if (!isAuthenticated || !token) {
          set({ addresses: [], shippingAddresses: [] });
          return [];
        }

        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}users/getAddresses`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          if (res.status === 401) {
            set({
              addresses: [],
              shippingAddresses: [],
              loading: false,
              error: null,
            });
            return [];
          }

          const data = await res.json();
          if (!res.ok)
            throw new Error(data.message || "Failed to fetch addresses");

          set({
            addresses: data.addresses || [],
            shippingAddresses: data.addresses || [],
            loading: false,
          });

          return data.addresses || [];
        } catch (err) {
          set({
            error: err.message,
            addresses: [],
            shippingAddresses: [],
            loading: false,
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
        if (!res.ok)
          throw new Error(data.message || "Failed to place COD order");

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
          if (!res.ok) return { isEligible: false, discountPercentage: 0 };

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

      initiateRazorpayPayment: async (
        amount,
        cartItems = null,
        shippingAddress = null
      ) => {
        try {
          if (!window.Razorpay) {
            throw new Error(
              "Razorpay SDK not loaded. Please check your internet connection."
            );
          }

          const orderData = await get().createRazorpayOrder(amount);

          return new Promise((resolve, reject) => {
            const options = {
              key: orderData.key_id,
              amount: orderData.amount,
              currency: orderData.currency,
              name: "DRIP NATION®",
              description: "Order Payment",
              order_id: orderData.id,
              handler: async function (response) {
                try {
                  let items = cartItems;
                  let address = shippingAddress;

                  if (!items) {
                    const savedCart = localStorage.getItem("cart");
                    if (savedCart) {
                      const cartData = JSON.parse(savedCart);
                      items = cartData.items || cartData;
                    }
                  }

                  if (!address) {
                    const savedAddress =
                      sessionStorage.getItem("shippingAddress") ||
                      localStorage.getItem("shippingAddress");
                    if (savedAddress) {
                      address = JSON.parse(savedAddress);
                    }
                  }

                  if (!items || items.length === 0) {
                    throw new Error("Cart is empty. Cannot create order.");
                  }

                  if (!address) {
                    throw new Error("Shipping address is required.");
                  }

                  const verifyRes = await fetch(
                    `${API_BASE}payment/verify-payment`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${get().token}`,
                      },
                      body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderDetails: {
                          items,
                          shippingAddress: address,
                          totalPrice: amount,
                        },
                      }),
                    }
                  );

                  const verifyData = await verifyRes.json();

                  if (!verifyRes.ok) {
                    throw new Error(
                      verifyData.message || "Payment verification failed"
                    );
                  }

                  // ✅ FIX: Show different messages based on whether discount was applied
                  if (
                    verifyData.isFirstOrder &&
                    verifyData.discountApplied > 0
                  ) {
                    alert(
                      `✅ Payment successful! Welcome discount of ₹${verifyData.discountApplied} applied. Order placed!`
                    );
                  } else {
                    alert("✅ Payment successful and order placed!");
                  }

                  resolve({
                    success: true,
                    paymentId: response.razorpay_payment_id,
                    orderId: verifyData.orderId,
                    discountApplied: verifyData.discountApplied,
                    isFirstOrder: verifyData.isFirstOrder,
                  });

                  setTimeout(() => {
                    window.location.href = "/orders";
                  }, 1500);
                } catch (verifyErr) {
                  alert("Failed: " + verifyErr.message);
                  reject(verifyErr);
                }
              },
              prefill: {
                name: get().user?.name || "",
                email: get().user?.email || "",
                contact: get().user?.phone || "",
              },
              theme: {
                color: "#000000",
              },
              modal: {
                ondismiss: function () {
                  reject(new Error("Payment cancelled by user"));
                },
              },
            };

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function (response) {
              alert(`Payment failed: ${response.error.description}`);
              reject(new Error(response.error.description));
            });

            rzp.open();
          });
        } catch (err) {
          alert("Payment initiation failed: " + err.message);
          throw err;
        }
      },

      fetchUsers: async () => {
        try {
          set({ loading: true, error: null });
          const res = await fetch(`${API_BASE}users/getAllUser`, {
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

          set({ customers: data.users || [] });
          return data.users;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

     fetchUserOrders: async () => {
  const { token } = get(); // ✅ ADD: Get the token from store
  
  try {
    set({ loading: true, error: null });

    const res = await fetch(`${API_BASE}order/my-orders`, {
      method: "GET",
      credentials: "include",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ ADD: Authorization header
      },
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to fetch orders");
    }

    const data = await res.json();
    set({ orders: data.orders || [], loading: false });
  } catch (error) {
    set({ loading: false });
  }
},

      fetchAllOrders: async () => {
        const { token } = get();
        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}order/all-orders`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok)
            throw new Error(data.message || "Failed to fetch all orders");

          set({ orders: data.orders || [], loading: false });
          return data.orders;
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

     handleStatusChange: async (orderId, newStatus) => {
  const { token } = get(); // ✅ Get the token from store
  
  try {
    const res = await fetch(`${API_BASE}order/status/${orderId}`, {
      method: "PUT",
      credentials: "include",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ ADD THIS LINE
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Order status updated to ${newStatus}`);
      await get().fetchUserOrders();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("❌ Update status error:", error);
  }
},

      dashboardStats: {
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        recentOrders: [],
      },

      fetchDashboardSummary: async () => {
        try {
          set({ loading: true, error: null });

          const res = await fetch(`${API_BASE}dash/dashboard`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok)
            throw new Error(
              data.message || "Failed to fetch dashboard summary"
            );

          set({
            dashboardStats: {
              totalProducts: data.totalProducts || 0,
              totalOrders: data.totalOrders || 0,
              totalCustomers: data.totalCustomers || 0,
              recentOrders: data.recentOrders || [],
            },
            loading: false,
          });

          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      resendOtp: async (email) => {
        try {
          const response = await fetch(`${API_BASE}users/resend-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to resend OTP");
          }

          return data;
        } catch (error) {
          throw error;
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
