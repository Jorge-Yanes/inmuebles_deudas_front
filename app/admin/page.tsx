"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminStats } from "@/components/admin/admin-stats"
import { PendingUsersList } from "@/components/admin/pending-users-list"
import { useAuth } from "@/context/auth-context"
import { getAllUsers, getPendingUsers } from "@/lib/auth"

export default function AdminPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    adminUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allUsers = await getAllUsers()
        const pendingUsersCount = (await getPendingUsers()).length

        setStats({
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter((u) => u.role === "client").length,
          pendingUsers: pendingUsersCount,
          adminUsers: allUsers.filter((u) => u.role === "admin").length,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "admin") {
      fetchStats()
    }
  }, [user])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando estadísticas...</div>
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">Gestione usuarios, permisos y configuración del portal inmobiliario</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <AdminStats stats={stats} />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>Administre los usuarios del portal inmobiliario</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Cree, edite y gestione usuarios, asigne roles y permisos.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/users">
                Ver Usuarios <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permisos y Roles</CardTitle>
            <CardDescription>Configure los permisos de acceso al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Defina roles, permisos y políticas de acceso para los usuarios.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/admin/permissions">
                Gestionar Permisos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Configure los parámetros del portal</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ajuste la configuración general, notificaciones y preferencias del sistema.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/admin/settings">
                Configuración <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">Solicitudes Pendientes</h2>
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <PendingUsersList />
        </Suspense>
      </div>
    </div>
  )
}
