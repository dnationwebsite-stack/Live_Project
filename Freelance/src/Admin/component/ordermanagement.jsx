import React, { useEffect, useState } from "react";
import { Download, Search, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useUserStore } from "../../store/UserSlice";
import OrderDetailsModal from "./orderDetailsModal";

export default function OrderManagement() {
  const {
    orders,
    fetchAllOrders,
    loading,
    handleStatusChange, // ✅ Zustand function
  } = useUserStore();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const filteredOrders = orders.filter(
    (o) =>
      o.shippingAddress?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      o.customOrderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    shipping: "bg-blue-100 text-blue-700 border border-blue-300",
    delivered: "bg-green-100 text-green-700 border border-green-300",
    cancelled: "bg-red-100 text-red-700 border border-red-300",
  };

  const generateInvoicePDF = (order) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Order Invoice", 14, 20);

    doc.setFontSize(12);
    doc.text(`Order ID: ${order.customOrderId || order._id}`, 14, 35);
    doc.text(`Customer: ${order.shippingAddress.fullName}`, 14, 42);
    doc.text(`Address: ${order.shippingAddress.line1 || "N/A"}`, 14, 49);
    doc.text(`Status: ${order.status}`, 14, 56);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 63);

    const tableColumn = ["Product", "Qty", "Price", "Total"];
    const tableRows = [];

    order.items?.forEach((item) => {
      tableRows.push([
        item.name,
        item.quantity,
        `₹${item.price}`,
        `₹${item.price * item.quantity}`,
      ]);
    });

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [240, 240, 240] },
    });

    const finalY = doc.lastAutoTable?.finalY || 100;
    doc.setFontSize(13);
    doc.text(`Total: ₹${order.totalPrice}`, 14, finalY + 10);
    doc.text("Thank you for your purchase!", 14, finalY + 20);

    doc.save(`Invoice-${order.customOrderId || order._id}.pdf`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🛍️ Orders Management</h2>

      {/* 🔍 Search Bar */}
      <div className="mb-6 flex items-center bg-gray-100 px-4 py-2 rounded-lg shadow-sm">
        <Search className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search by Customer or Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-700"
        />
      </div>

      {/* 📦 Orders List */}
      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
                <div>
                  <p className="text-xs uppercase text-gray-500">Order ID</p>
                  <h3 className="font-semibold text-gray-900">
                    {order.customOrderId}
                  </h3>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-500">Customer</p>
                  <p className="text-gray-800">
                    {order.shippingAddress.fullName}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-500">Amount</p>
                  <p className="font-bold text-gray-900">
                    ₹{order.totalPrice}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-500">Products</p>
                  <p className="text-gray-800">{order.items?.length} items</p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-500">Date</p>
                  <p className="text-gray-800">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                {/* 🔄 Status Dropdown */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === order._id ? null : order._id
                      )
                    }
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                      statusColors[order.status] || ""
                    }`}
                  >
                    {order.status?.toUpperCase()}
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        openDropdown === order._id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openDropdown === order._id && (
                    <div className="absolute mt-2 bg-white border rounded-lg shadow-lg w-32 z-10">
                      {["pending", "shipping", "delivered", "cancelled"].map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => {
                              handleStatusChange(order._id, status); // ✅ Zustand call
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* 🔘 Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => generateInvoicePDF(order)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Download size={18} /> Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🧾 Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
