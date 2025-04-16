import Link from "next/link"
import { ArrowUpRight, Building, Calendar, Home, MapPin, Ruler } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Asset } from "@/types/asset"
import { formatCurrency, marketingStatusLabels, propertyTypeLabels } from "@/types/asset"

interface AssetListItemProps {
  asset: Asset
}

export function AssetListItem({ asset }: AssetListItemProps) {
  const propertyType = propertyTypeLabels[asset.property_type] || asset.property_type
  const marketingStatus =
    marketingStatusLabels[asset.marketing_status || "AVAILABLE"] || asset.marketing_status || "Disponible"

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 md:h-auto md:w-1/3 md:max-w-xs">
            {asset.cadastral_reference ? (
            <iframe
              src={`https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${asset.cadastral_reference}`}
              className="w-full h-full border-0"
              title={`Mapa catastral de ${asset.title || `${propertyType} en ${asset.city}`}`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-muted-foreground text-center p-4">
                No hay referencia catastral disponible para este inmueble
              </p>
            </div>
          )}
  
          <Badge
            className="absolute right-2 top-2"
            variant={marketingStatus === "Disponible" ? "default" : "secondary"}
          >
            {marketingStatus}
          </Badge>
        </div>

        <div className="flex flex-col flex-grow p-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <h3 className="text-xl font-semibold">{asset.title || `${propertyType} en ${asset.city}`}</h3>
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {asset.address}, {asset.city}, {asset.province}
              </div>
              {asset.reference_code && (
                <div className="mt-1 text-xs text-muted-foreground">Ref: {asset.reference_code}</div>
              )}
            </div>
            <p className="text-xl font-bold md:text-right">{formatCurrency(asset.price_approx)}</p>
          </div>

          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {asset.description ||
              `${propertyType} ubicado en ${asset.address}, ${asset.city}, ${asset.province}. ${asset.sqm}m².`}
          </p>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Superficie</p>
                <p className="text-sm font-medium">{asset.sqm} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {asset.property_type === "RESIDENTIAL" ? (
                <Home className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Building className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-medium">{propertyType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{marketingStatus}</Badge>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link href={`/assets/${asset.id}`}>
                Ver Detalles <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
