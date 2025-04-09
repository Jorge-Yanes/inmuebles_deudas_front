import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AssetForm } from "@/components/asset-form"

export default function NewAssetPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="icon">
          <Link href="/assets">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Activo Inmobiliario</h1>
      </div>

      <AssetForm />
    </div>
  )
}
