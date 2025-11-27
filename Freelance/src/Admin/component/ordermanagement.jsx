import React, { useEffect, useState } from "react";
import { Download, Search, ChevronDown } from "lucide-react";
import { useUserStore } from "../../store/UserSlice"; // Update this import path
import OrderDetailsModal from "./orderDetailsModal";

export default function OrderManagement() {
  const {
     orders,
       fetchAllOrders,
       loading,
       handleStatusChange,
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

  const generateInvoiceTXT = (order) => {
    let invoiceText = "";
    
    invoiceText += "=".repeat(80) + "\n";
    invoiceText += " ".repeat(32) + "INVOICE\n";
    invoiceText += "=".repeat(80) + "\n\n";
    
    invoiceText += `Order ID: ${order.customOrderId || order._id}\n`;
    invoiceText += `Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}\n`;
    invoiceText += `Status: ${order.status?.toUpperCase() || "N/A"}\n`;
    invoiceText += `Payment Method: ${order.paymentMethod || "COD"}\n\n`;
    
    invoiceText += "-".repeat(80) + "\n\n";
    
    invoiceText += "BILL TO:\n";
    invoiceText += `${order.shippingAddress?.fullName || "N/A"}\n`;
    invoiceText += `${order.shippingAddress?.line1 || "N/A"}\n`;
    if (order.shippingAddress?.line2) {
      invoiceText += `${order.shippingAddress.line2}\n`;
    }
    invoiceText += `${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.zipCode || ""}\n`;
    if (order.shippingAddress?.phone) {
      invoiceText += `Phone: ${order.shippingAddress.phone}\n`;
    }
    
    invoiceText += "\n" + "-".repeat(80) + "\n\n";
    
    invoiceText += "ITEMS:\n\n";
    invoiceText += String("Item").padEnd(40) + 
                   String("Qty").padStart(8) + 
                   String("Price").padStart(15) + 
                   String("Total").padStart(17) + "\n";
    invoiceText += "-".repeat(80) + "\n";
    
    order.items?.forEach((item) => {
      const itemName = (item.name || "N/A").substring(0, 38);
      const qty = (item.quantity || 0).toString();
      const price = `Rs. ${(item.price || 0).toFixed(2)}`;
      const total = `Rs. ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`;
      
      invoiceText += itemName.padEnd(40) + 
                     qty.padStart(8) + 
                     price.padStart(15) + 
                     total.padStart(17) + "\n";
    });
    
    invoiceText += "-".repeat(80) + "\n\n";
    
    const subtotal = order.totalPrice || 0;
    const delivery = 15;
    const shipping = 50;
    const grandTotal = subtotal + delivery + shipping;
    
    invoiceText += " ".repeat(47) + "Subtotal:".padEnd(18) + `Rs. ${subtotal.toFixed(2)}`.padStart(15) + "\n";
    invoiceText += " ".repeat(47) + "delivery:".padEnd(18) + `Rs. ${delivery.toFixed(2)}`.padStart(15) + "\n";
    invoiceText += " ".repeat(47) + "Shipping:".padEnd(18) + `Rs. ${shipping.toFixed(2)}`.padStart(15) + "\n";
    invoiceText += " ".repeat(47) + "-".repeat(33) + "\n";
    invoiceText += " ".repeat(47) + "GRAND TOTAL:".padEnd(18) + `Rs. ${grandTotal.toFixed(2)}`.padStart(15) + "\n\n";
    
    invoiceText += "=".repeat(80) + "\n\n";
    
    invoiceText += " ".repeat(22) + "Thank you for your purchase!\n";
    invoiceText += " ".repeat(10) + "This is a computer-generated invoice and does not require a signature.\n";
    invoiceText += "\n" + "=".repeat(80) + "\n";
    
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${order.customOrderId || order._id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🛍️ Orders Management</h2>

      {/* Search Bar */}
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

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No orders found.</p>
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
                    {order.shippingAddress?.fullName}
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
                {/* Status Dropdown */}
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
                              handleStatusChange(order._id, status);
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

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => generateInvoiceTXT(order)}
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}