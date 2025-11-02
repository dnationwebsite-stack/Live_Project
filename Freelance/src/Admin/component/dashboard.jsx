import React from "react"
import { Package, ShoppingCart, Users } from "lucide-react"

export function Dashboard() {
  const stats = [
    { label: "Total Products", value: "24", icon: Package, color: "bg-blue-100 text-blue-600" },
    { label: "Total Orders", value: "156", icon: ShoppingCart, color: "bg-green-100 text-green-600" },
    { label: "Total Customers", value: "89", icon: Users, color: "bg-purple-100 text-purple-600" },
  ]

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-foreground mb-8">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="p-6 border rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-6 border rounded shadow">
        <h3 className="text-xl font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <p className="text-muted-foreground">New order received from John Doe</p>
          <p className="text-muted-foreground">Product "Laptop" inventory updated</p>
          <p className="text-muted-foreground">New customer registered: Jane Smith</p>
        </div>
      </div>
    </div>
  )
}
