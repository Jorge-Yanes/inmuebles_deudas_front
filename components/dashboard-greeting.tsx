"use client"

import { useAuth } from "@/context/auth-context"

export function DashboardGreeting() {
  const { user, loading } = useAuth()

  if (loading) {
    return <h1 className="text-3xl font-bold tracking-tight">Cargando...</h1>
  }

  if (!user) {
    return <h1 className="text-3xl font-bold tracking-tight">Portal Inmobiliario</h1>
  }

  // Personalized greeting based on user role
  if (user.role === "admin") {
    return <h1 className="text-3xl font-bold tracking-tight">Bienvenido, Administrador {user.name}</h1>
  }

  return <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user.name}</h1>
}
