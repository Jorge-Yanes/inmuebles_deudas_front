import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPermissionsForm } from "@/components/admin/user-permissions-form"

export const metadata: Metadata = {
  title: "Gestión de Permisos | Portal Inmobiliario",
  description: "Administre los permisos de acceso de los usuarios",
}

interface UserPermissionsPageProps {
  params: {
    id: string
  }
}

export default function UserPermissionsPage({ params }: UserPermissionsPageProps) {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos de Usuario</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <UserPermissionsForm userId={params.id} />
      </Suspense>
    </div>
  )
}
