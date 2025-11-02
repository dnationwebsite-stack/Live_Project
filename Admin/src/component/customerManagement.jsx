import React, { useState } from "react"
import { Trash2, Plus, Mail, Phone } from "lucide-react"

export function CustomerManagement() {
  const [customers, setCustomers] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1-555-0101",
      joinDate: "2024-01-01",
      totalOrders: 5,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1-555-0102",
      joinDate: "2024-01-05",
      totalOrders: 3,
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1-555-0103",
      joinDate: "2024-01-10",
      totalOrders: 1,
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" })

  const handleAddCustomer = () => {
    if (formData.name && formData.email && formData.phone) {
      setCustomers([
        ...customers,
        {
          id: Date.now().toString(),
          ...formData,
          joinDate: new Date().toISOString().split("T")[0],
          totalOrders: 0,
        },
      ])
      setFormData({ name: "", email: "", phone: "" })
      setShowForm(false)
    }
  }

  const handleDelete = (id) => {
    setCustomers(customers.filter((c) => c.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-foreground">Customers</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          <Plus size={20} /> Add Customer
        </button>
      </div>

      {showForm && (
        <div className="p-6 mb-8 border rounded shadow">
          <h3 className="text-xl font-bold text-foreground mb-4">Add New Customer</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border p-2 rounded"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAddCustomer} className="px-4 py-2 bg-green-500 text-white rounded">
              Add
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {customers.map((customer) => (
          <div key={customer.id} className="p-6 border rounded">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-lg mb-3">{customer.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={16} />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={16} />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              </div>
              <div className="text-right mr-4">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{customer.totalOrders}</p>
                </div>
                <p className="text-sm text-muted-foreground">Joined: {customer.joinDate}</p>
              </div>
              <button
                onClick={() => handleDelete(customer.id)}
                className="p-2 border rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
