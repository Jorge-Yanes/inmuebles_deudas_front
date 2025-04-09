import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AssetFilters } from "@/components/asset-filters"
import { AssetList } from "@/components/asset-list"

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activos Inmobiliarios</h1>
          <p className="text-muted-foreground">Gestione y visualice todos sus activos inmobiliarios</p>
        </div>
        <Button asChild>
          <Link href="/assets/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Activo
          </Link>
        </Button>
      </div>

      <AssetFilters />

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <AssetList />
      </Suspense>
    </div>
  )
}
