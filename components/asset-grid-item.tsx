"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, getPropertyType, getSuperficie, getLocationForMap } from "@/lib/utils"
import type { Asset } from "@/types/asset"
import { PropertyMapThumbnail } from "@/components/maps/property-map-thumbnail"
import { MapPin, Home, Ruler, Calendar } from "lucide-react"

interface AssetGridItemProps {
  asset: Asset
}

export function AssetGridItem({ asset }: AssetGridItemProps) {
  const propertyType = getPropertyType(asset)
  const superficie = getSuperficie(asset)
  const locationData = getLocationForMap(asset)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/assets/${asset.id}`}>
        <div className="relative">
          {/* Map Thumbnail */}
          <div className="w-full h-48 bg-gray-100">
            <PropertyMapThumbnail asset={asset} width={400} height={192} zoom={16} className="w-full h-full" />
          </div>

          {/* Property Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              <Home className="w-3 h-3 mr-1" />
              {propertyType}
            </Badge>
          </div>

          {/* Price Badge */}
          {asset.price_approx && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-600 hover:bg-green-700 text-white">{formatCurrency(asset.price_approx)}</Badge>
            </div>
          )}

          {/* Legal Phase Badge */}
          {asset.legal_phase && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs">
                {asset.legal_phase}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Location */}
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm leading-tight">{locationData.address || "Dirección no disponible"}</p>
              <p className="text-xs text-muted-foreground">
                {asset.municipio_catastro}, {asset.provincia_catastro}
              </p>
              {asset.codigo_postal_catastro && (
                <p className="text-xs text-muted-foreground">CP: {asset.codigo_postal_catastro}</p>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {superficie !== "N/A" && (
              <div className="flex items-center gap-1">
                <Ruler className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">Superficie:</span>
                <span className="font-medium text-xs">{superficie} m²</span>
              </div>
            )}

            {asset.ano_construccion_inmueble && asset.ano_construccion_inmueble !== "0" && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">Año:</span>
                <span className="font-medium text-xs">{asset.ano_construccion_inmueble}</span>
              </div>
            )}

            {asset.rooms && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground text-xs">Habitaciones:</span>
                <span className="font-medium text-xs">{asset.rooms}</span>
              </div>
            )}

            {asset.bathrooms && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground text-xs">Baños:</span>
                <span className="font-medium text-xs">{asset.bathrooms}</span>
              </div>
            )}
          </div>

          {/* Marketing Status */}
          {asset.marketing_status && (
            <div className="mt-3 pt-3 border-t">
              <Badge variant="outline" className="text-xs">
                {asset.marketing_status}
              </Badge>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
