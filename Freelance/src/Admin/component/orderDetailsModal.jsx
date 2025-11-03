import React from "react";
import { X, Download } from "lucide-react";
import "jspdf-autotable";

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white/90 w-[90%] md:w-[600px] rounded-2xl shadow-2xl p-6 relative border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">
          🧾 Order Details
        </h2>

        {/* Order Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 mb-4">
          <p><strong>Order ID:</strong> {order.customOrderId}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Customer:</strong> {order.shippingAddress.fullName}</p>
          <p><strong>Total:</strong> ₹{order.totalPrice}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Address:</strong> {order.shippingAddress.line1 || "Not provided"}</p>
        </div>

        {/* Items */}
        <div className="mt-4">
          <h3 className="font-semibold text-lg mb-3">Products</h3>
          <div className="divide-y divide-gray-200">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity} • Size: {item.size || "-"}
                  </p>
                </div>
                <p className="font-semibold text-gray-800">₹{item.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
