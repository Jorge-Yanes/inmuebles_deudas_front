"use client"

import Link from "next/link"
import { ArrowUpRight, Building, Home, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ConditionalField } from "@/components/permissions/conditional-field"
import { RestrictedValue } from "@/components/permissions/restricted-value"
import { StaticMap } from "@/components/maps/static-map"
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
        <StaticMap postalCode={asset.zip_code} city={asset.city} province={asset.province} height={192} width={400} />
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
