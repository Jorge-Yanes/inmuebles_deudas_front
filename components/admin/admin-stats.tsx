"use client"

import { useEffect, useState } from "react"
import { Clock, Shield, User, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllUsers } from "@/lib/auth"

export function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    adminUsers: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await getAllUsers()

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((user) => user.role === "client").length,
          pendingUsers: users.filter((user) => user.role === "pending").length,
          adminUsers: users.filter((user) => user.role === "admin").length,
        })
      } catch (error) {
        console.error("Error fetching user stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">Usuarios registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <p className="text-xs text-muted-foreground">Usuarios con acceso</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingUsers}</div>
          <p className="text-xs text-muted-foreground">Esperando aprobación</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.adminUsers}</div>
          <p className="text-xs text-muted-foreground">Con permisos totales</p>
        </CardContent>
      </Card>
    </>
  )
}
