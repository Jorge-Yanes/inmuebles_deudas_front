import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserManagement } from "@/components/admin/user-management"

export const metadata: Metadata = {
  title: "Gestión de Usuarios | Portal Inmobiliario",
  description: "Administre los usuarios y sus permisos en el portal inmobiliario",
}

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administre los usuarios y sus permisos en el portal inmobiliario</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
          </Link>
        </Button>
      </div>

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <UserManagement />
      </Suspense>
    </div>
  )
}
