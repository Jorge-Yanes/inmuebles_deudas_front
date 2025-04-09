import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AssetDetails } from "@/components/asset-details"

interface AssetPageProps {
  params: {
    id: string
  }
}

export default function AssetPage({ params }: AssetPageProps) {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href="/assets">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Detalles del Activo</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/assets/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash className="mr-2 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <AssetDetails id={params.id} />
      </Suspense>
    </div>
  )
}
