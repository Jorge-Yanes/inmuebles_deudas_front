"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Building, Home, Lock, Settings, ShieldAlert, Users } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-background lg:block">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex h-14 items-center border-b px-4 py-2">
          <h2 className="text-lg font-semibold">Administración</h2>
        </div>

        <nav className="grid gap-1 px-2 pt-2">
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin") && !isActive("/admin/users") && !isActive("/admin/permissions")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/users")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Gestión de Usuarios
          </Link>

          <Link
            href="/admin/permissions"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/permissions")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Lock className="h-4 w-4" />
            Permisos y Roles
          </Link>

          <Link
            href="/admin/assets"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/assets")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Building className="h-4 w-4" />
            Activos Inmobiliarios
          </Link>

          <Link
            href="/admin/analytics"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/analytics")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analíticas
          </Link>

          <Link
            href="/admin/security"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/security")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Seguridad
          </Link>

          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/settings")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Configuración
          </Link>
        </nav>

        <div className="mt-auto">
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Building className="h-4 w-4" />
            Volver al Portal
          </Link>
        </div>
      </div>
    </aside>
  )
}
