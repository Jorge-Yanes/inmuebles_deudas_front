"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building, LogOut, Menu, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"

export function AdminHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b bg-background px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="mr-4 lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <nav className="flex flex-col gap-4 py-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => document.querySelector("button[data-state='open']")?.click()}
            >
              <Building className="h-5 w-5" />
              Panel de Administración
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
              onClick={() => document.querySelector("button[data-state='open']")?.click()}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
              onClick={() => document.querySelector("button[data-state='open']")?.click()}
            >
              Gestión de Usuarios
            </Link>
            <Link
              href="/admin/permissions"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
              onClick={() => document.querySelector("button[data-state='open']")?.click()}
            >
              Permisos y Roles
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
              onClick={() => document.querySelector("button[data-state='open']")?.click()}
            >
              Volver al Portal
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold lg:text-xl">
        <Building className="h-5 w-5" />
        <span className="hidden md:inline-block">Panel de Administración</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline-block">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">Volver al Portal</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
