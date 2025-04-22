import Link from "next/link"
import { ArrowUpRight, Building, Home, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ConditionalField } from "@/components/permissions/conditional-field"
import { RestrictedValue } from "@/components/permissions/restricted-value"
import type { Asset } from "@/types/asset"
import { formatCurrency, marketingStatusLabels, propertyTypeLabels } from "@/types/asset"

interface AssetGridItemProps {
  asset: Asset
}

export function AssetGridItem({ asset }: AssetGridItemProps) {
  const propertyType = propertyTypeLabels[asset.property_type] || asset.property_type
  const marketingStatus =
    marketingStatusLabels[asset.marketing_status || "AVAILABLE"] || asset.marketing_status || "Disponible"

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48">
        <ConditionalField fieldName="cadastral_reference">
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
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground text-center p-4">No tiene permisos para ver el mapa catastral</p>
          </div>
        </ConditionalField>
        <Badge className="absolute right-2 top-2" variant={marketingStatus === "Disponible" ? "default" : "secondary"}>
          {marketingStatus}
        </Badge>
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-xl font-semibold line-clamp-1">{asset.title || `${propertyType} en ${asset.city}`}</h3>
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">
            {asset.address}, {asset.city}, {asset.province}
          </span>
        </div>
        <div className="mt-1 flex items-center text-sm text-muted-foreground">
          {asset.property_type === "RESIDENTIAL" ? (
            <Home className="mr-1 h-4 w-4 flex-shrink-0" />
          ) : (
            <Building className="mr-1 h-4 w-4 flex-shrink-0" />
          )}
          {propertyType}
          {asset.sqm > 0 && ` · ${asset.sqm}m²`}
          <ConditionalField fieldName="rooms">{asset.rooms && ` · ${asset.rooms} hab.`}</ConditionalField>
        </div>
        <RestrictedValue
          fieldName="price_approx"
          value={<p className="mt-2 text-lg font-bold">{formatCurrency(asset.price_approx)}</p>}
        />
        <ConditionalField fieldName="reference_code">
          {asset.reference_code && <p className="mt-1 text-xs text-muted-foreground">Ref: {asset.reference_code}</p>}
        </ConditionalField>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/assets/${asset.id}`}>
            Ver Detalles <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
