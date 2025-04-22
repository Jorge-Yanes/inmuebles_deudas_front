"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { FieldPermissionsManager } from "@/components/admin/field-permissions-manager"
import { useAuth } from "@/context/auth-context"

export default function PermissionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "admin") {
        router.push("/")
      } else {
        setIsAdmin(true)
      }
    }
  }, [user, loading, router])

  if (loading || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos</h1>
        <p className="text-muted-foreground">Configure los permisos de acceso para los diferentes roles de usuario</p>
      </div>

      <Tabs defaultValue="field-permissions">
        <TabsList className="mb-4">
          <TabsTrigger value="field-permissions">Permisos de Campos</TabsTrigger>
          <TabsTrigger value="role-permissions">Permisos de Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="field-permissions">
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <FieldPermissionsManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="role-permissions">
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-semibold">Gestión de Permisos de Roles</h3>
            <p className="mt-2 text-muted-foreground">Esta funcionalidad estará disponible próximamente</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
