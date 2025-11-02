import React, { useState } from "react"
import { Download, ChevronDown } from "lucide-react"
import jsPDF from "jspdf"

export function OrderManagement() {
  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      customerName: "John Doe",
      amount: 1299,
      status: "shipping",
      date: "2024-01-15",
      items: "Laptop, Mouse",
    },
    {
      id: "ORD002",
      customerName: "Jane Smith",
      amount: 108,
      status: "delivery",
      date: "2024-01-14",
      items: "Keyboard, Mouse",
    },
    { id: "ORD003", customerName: "Bob Johnson", amount: 79, status: "pending", date: "2024-01-13", items: "Keyboard" },
  ])

  const [openDropdown, setOpenDropdown] = useState(null)

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    shipping: "bg-blue-100 text-blue-700 border border-blue-300",
    delivery: "bg-green-100 text-green-700 border border-green-300",
    cancelled: "bg-red-100 text-red-700 border border-red-300",
  }

  const statusIcons = {
    pending: "⏳",
    shipping: "🚚",
    delivery: "✅",
    cancelled: "❌",
  }

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
    setOpenDropdown(null)
  }

  const generateInvoicePDF = (order) => {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text("INVOICE", 20, 20)

    doc.setFontSize(12)
    doc.text(`Order ID: ${order.id}`, 20, 40)
    doc.text(`Date: ${order.date}`, 20, 50)
    doc.text(`Customer: ${order.customerName}`, 20, 60)

    doc.setFontSize(11)
    doc.text("Items:", 20, 80)
    doc.text(order.items, 20, 90)

    doc.setFontSize(14)
    doc.text(`Total Amount: $${order.amount}`, 20, 110)

    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 130)

    doc.setFontSize(10)
    doc.text("Thank you for your business!", 20, 150)

    doc.save(`invoice-${order.id}.pdf`)
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-foreground mb-8">Orders Management</h2>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="p-6 border rounded hover:shadow-lg transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order ID</p>
                <h3 className="font-bold text-lg text-foreground">{order.id}</h3>
                <p className="text-sm text-muted-foreground mt-2">{order.customerName}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Amount</p>
                <p className="text-2xl font-bold text-foreground">${order.amount}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Date</p>
                <p className="text-sm text-foreground">{order.date}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Items</p>
                <p className="text-sm text-foreground">{order.items}</p>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex justify-between items-center">
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${statusColors[order.status]}`}
                >
                  <span>{statusIcons[order.status]}</span>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openDropdown === order.id ? "rotate-180" : ""}`}
                  />
                </button>

                {openDropdown === order.id && (
                  <div className="absolute top-full mt-2 bg-white border border-border rounded-lg shadow-lg z-20 min-w-40">
                    {["pending", "shipping", "delivery", "cancelled"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(order.id, status)}
                        className="block w-full text-left px-4 py-3 hover:bg-muted text-foreground border-b border-border last:border-b-0 transition-colors"
                      >
                        <span className="mr-2">{statusIcons[status]}</span>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => generateInvoicePDF(order)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded"
              >
                <Download size={18} /> Download Invoice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
