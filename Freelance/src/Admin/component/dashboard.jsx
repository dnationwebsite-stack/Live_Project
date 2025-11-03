import React, { useEffect } from "react"
import { Package, ShoppingCart, Users, Activity } from "lucide-react"
import { useUserStore } from "../../store/UserSlice" // ⚡ update path if needed

export function Dashboard() {
  const { dashboardStats, fetchDashboardSummary, loading } = useUserStore()

  useEffect(() => {
    fetchDashboardSummary()
  }, [fetchDashboardSummary])

  const { totalProducts, totalOrders, totalCustomers, recentOrders } = dashboardStats

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">📊 Dashboard Overview</h2>

      {/* 🔹 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Total Products", value: totalProducts, icon: Package, color: "bg-blue-50 text-blue-600" },
          { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "bg-green-50 text-green-600" },
          { label: "Total Customers", value: totalCustomers, icon: Users, color: "bg-purple-50 text-purple-600" },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-semibold text-gray-800">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon size={26} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 🔹 Recent Orders Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">Recent Orders</h3>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading recent orders...</p>
        ) : recentOrders?.length > 0 ? (
          <ul className="space-y-3 grid grid-cols-2">
            {recentOrders.map((order, i) => (
              <li
                key={order._id || i}
                className="flex items-center justify-between text-gray-700 text-sm bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex flex-col gap-5">
                  <span className="font-medium text-gray-800">
                    👤 {order.customOrderId || "Unknown"}
                  </span>
                  <span className="text-xs text-gray-500">
                    🕒 {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-5 items-end">
                  <span className="font-semibold text-gray-800">
                    ₹{order.totalPrice}
                  </span>
                  <span
                    className={`text-xs mt-1 px-2 py-1 rounded-full ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "shipping"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No recent orders found.</p>
        )}
      </div>
    </div>
  )
}
