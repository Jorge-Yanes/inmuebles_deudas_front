"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPermissionsForm } from "@/components/admin/user-permissions-form"
import { useAuth } from "@/context/auth-context"

export default function UserPermissionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
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
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" size="icon" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos de Usuario</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <UserPermissionsForm userId={userId} />
      </Suspense>
    </div>
  )
}
