"use client"

import { useState } from "react"
import { Sidebar } from "../component/Sidebar"
import { Dashboard } from "../component/dashboard"
import  ProductManagement  from "../component/productManagement"
import  OrderManagement  from "../component/ordermanagement"
import { CustomerManagement } from "../component/customerManagement"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "products":
        return <ProductManagement />
      case "orders":
        return <OrderManagement />
      case "customers":
        return <CustomerManagement />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {renderContent()}
      </main>
    </div>
  )
}
