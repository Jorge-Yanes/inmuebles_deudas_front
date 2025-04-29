"use client"

import Link from "next/link"
import { Building, Home, MapPin } from "lucide-react"
import dynamic from "next/dynamic"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ConditionalField } from "@/components/permissions/conditional-field"
import { RestrictedValue } from "@/components/permissions/restricted-value"
import type { Asset } from "@/types/asset"
import { formatCurrency, marketingStatusLabels, propertyTypeLabels } from "@/types/asset"

// Dynamically import the map component with no SSR
const PostalCodeMap = dynamic(() => import("./maps/postal-code-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[150px] w-full bg-muted">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
})

interface AssetGridItemProps {
  asset: Asset
}

export function AssetGridItem({ asset }: AssetGridItemProps) {
  const propertyType = propertyTypeLabels[asset.property_type] || asset.property_type
  const marketingStatus =
    marketingStatusLabels[asset.marketing_status || "AVAILABLE"] || asset.marketing_status || "Disponible"

  return (
    <Link href={`/assets/${asset.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-40">
          {/* Map area */}
          <ConditionalField fieldName="zip_code">
            {asset.zip_code ? (
              <RestrictedValue
                fieldName="zip_code"
                value={<PostalCodeMap postalCode={asset.zip_code} />}
                fallback={
                  <div className="flex items-center justify-center h-full w-full bg-muted">
                    <p className="text-muted-foreground">Mapa restringido</p>
                  </div>
                }
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-muted">
                <p className="text-muted-foreground">No hay código postal disponible</p>
              </div>
            )}
          </ConditionalField>

          <Badge
            className="absolute right-2 top-2"
            variant={marketingStatus === "Disponible" ? "default" : "secondary"}
          >
            {marketingStatus}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{asset.title || `${propertyType} en ${asset.city}`}</h3>
          <div className="mt-1 flex items-center text-xs text-muted-foreground">
            <MapPin className="mr-1 h-3 w-3" />
            <span className="truncate">
              {asset.city}, {asset.province}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center">
              {asset.property_type === "RESIDENTIAL" ? (
                <Home className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Building className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="ml-1 text-xs">{propertyType}</span>
            </div>
            <div className="text-xs">{asset.sqm} m²</div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <RestrictedValue
            fieldName="price_approx"
            value={<p className="font-bold">{formatCurrency(asset.price_approx)}</p>}
          />
          <Badge variant="outline" className="text-xs">
            {marketingStatus}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}
