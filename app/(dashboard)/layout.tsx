import type React from "react"
import { Header } from "@/components/header"
import { ClientSidebar } from "@/components/client/client-sidebar" // Add this import

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <ClientSidebar /> {/* Add the sidebar component */}
        <main className="flex-1 relative overflow-auto">{children}</main>
      </div>
    </div>
  )
}
