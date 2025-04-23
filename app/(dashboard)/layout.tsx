import type React from "react"
import { Header } from "@/components/header"
import { ClientSidebar } from "@/components/client/client-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <ClientSidebar />
        <main className="flex-1 w-full h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
