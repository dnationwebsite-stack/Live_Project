import React from "react";
import { X, Download } from "lucide-react";

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  // Debug: Log the order structure
  console.log("Full Order:", order);
  console.log("Order Items:", order.items);

  // Helper function to get image URL - matches your product structure
  const getImageUrl = (item) => {
    let imageUrl = null;
    
    // Check productId.primaryImage first
    if (item.productId?.primaryImage) {
      const primaryImg = item.productId.primaryImage;
      // primaryImage might be an object with url property or just a string
      imageUrl = typeof primaryImg === 'string' ? primaryImg : primaryImg.url;
    } else if (item.productId?.images && item.productId.images.length > 0) {
      const firstImage = item.productId.images[0];
      imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;
    } else if (item.productId?.image) {
      imageUrl = item.productId.image;
    } else if (item.images && item.images.length > 0) {
      const firstImage = item.images[0];
      imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;
    } else if (item.image) {
      imageUrl = item.image;
    }
    
    // If no image found or it's a placeholder URL, use data URL
    if (!imageUrl || imageUrl.includes('placeholder')) {
      // Return a simple gray SVG as base64 data URL (works offline)
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E";
    }
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http")) return imageUrl;
    
    // Otherwise, prepend your backend URL
    return `http://localhost:5000/uploads/${imageUrl}`;
  };

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
          <p><strong>Customer:</strong> {order.shippingAddress?.fullName}</p>
          <p><strong>Total:</strong> ₹{order.totalPrice}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Address:</strong> {order.shippingAddress?.line1 || "Not provided"}</p>
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
                  src={getImageUrl(item)}
                  alt={item.name || "Product"}
                  className="w-14 h-14 object-cover rounded-lg border"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.src = "https://via.placeholder.com/100?text=No+Image";
                  }}
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
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}