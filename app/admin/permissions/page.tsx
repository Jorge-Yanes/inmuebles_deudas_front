import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { FieldPermissionsManager } from "@/components/admin/field-permissions-manager"

export default function PermissionsPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Permisos de Campos</h1>
        <p className="text-muted-foreground">Configure qué campos pueden ver y editar los usuarios según su rol</p>
      </div>

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <FieldPermissionsManager />
      </Suspense>
    </div>
  )
}
