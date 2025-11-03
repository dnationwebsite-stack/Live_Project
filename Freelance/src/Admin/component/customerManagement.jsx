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


  const handleDelete = (id) => {
    setCustomers(customers.filter((c) => c.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-foreground">Customers</h2>
     
      </div>

    

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
