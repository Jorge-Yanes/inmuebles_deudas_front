"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Building, Home, Search, Settings } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export function ClientSidebar() {
  const pathname = usePathname()
  const { user, checkPermission } = useAuth()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  // Don't show sidebar for admin routes or if user doesn't have permission to view assets
  if (pathname.startsWith("/admin") || !user || !checkPermission("viewAssets")) {
    return null
  }

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-background lg:block">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex h-14 items-center border-b px-4 py-2">
          <h2 className="text-lg font-semibold">Portal Inmobiliario</h2>
        </div>

        <nav className="grid gap-1 px-2 pt-2">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              pathname === "/" ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/assets"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/assets") ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Building className="h-4 w-4" />
            Activos Inmobiliarios
          </Link>

          <Link
            href="/search"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/search") ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
            Búsqueda Avanzada
          </Link>

          {checkPermission("viewFinancialData") && (
            <Link
              href="/analytics"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                isActive("/analytics")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Análisis
            </Link>
          )}

          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/settings")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Configuración
          </Link>
        </nav>
      </div>
    </aside>
  )
}
