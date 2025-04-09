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
import { SearchBar } from "@/components/search-bar"
import { useAuth } from "@/context/auth-context"

export function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  // Skip rendering on login and register pages
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  // Don't show search bar on search page
  const showSearchBar = !pathname.startsWith("/search")

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
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => document.querySelector("button[data-state='open']")?.click()}
            >
              <Building className="h-5 w-5" />
              Portal Inmobiliario
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
              onClick={() => document.querySelector("button[data-state='open']")?.click()}
            >
              Dashboard
            </Link>
            <Link
              href="/assets"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
              onClick={() => document.querySelector("button[data-state='open']")?.click()}
            >
              Activos Inmobiliarios
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
              onClick={() => document.querySelector("button[data-state='open']")?.click()}
            >
              Búsqueda Avanzada
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
              onClick={() => document.querySelector("button[data-state='open']")?.click()}
            >
              Análisis
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <Link href="/" className="flex items-center gap-2 text-lg font-semibold lg:text-xl">
        <Building className="h-5 w-5" />
        <span className="hidden md:inline-block">Portal Inmobiliario</span>
      </Link>

      <nav className="mx-6 hidden items-center gap-4 lg:flex lg:gap-6">
        <Link
          href="/"
          className={`text-sm font-medium ${
            pathname === "/" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/assets"
          className={`text-sm font-medium ${
            pathname.startsWith("/assets") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Activos Inmobiliarios
        </Link>
        <Link
          href="/search"
          className={`text-sm font-medium ${
            pathname.startsWith("/search") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Búsqueda Avanzada
        </Link>
        <Link
          href="/analytics"
          className={`text-sm font-medium ${
            pathname.startsWith("/analytics") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Análisis
        </Link>
      </nav>

      {showSearchBar && (
        <div className="mx-auto hidden md:block">
          <SearchBar variant="minimal" />
        </div>
      )}

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
                <Link href="/settings">Configuración</Link>
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
