"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, getPropertyType, getSuperficie, getLocationForMap } from "@/lib/utils"
import type { Asset } from "@/types/asset"
import { PropertyMapThumbnail } from "@/components/maps/property-map-thumbnail"
import { MapPin, Home, Ruler, Calendar, Euro } from "lucide-react"

interface AssetListItemProps {
  asset: Asset
}

export function AssetListItem({ asset }: AssetListItemProps) {
  const propertyType = getPropertyType(asset)
  const superficie = getSuperficie(asset)
  const locationData = getLocationForMap(asset)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link href={`/assets/${asset.id}`}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Map Thumbnail */}
            <div className="w-full md:w-64 h-48 md:h-40 bg-gray-100 flex-shrink-0">
              <PropertyMapThumbnail asset={asset} width={256} height={160} zoom={16} className="w-full h-full" />
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Home className="w-3 h-3 mr-1" />
                      {propertyType}
                    </Badge>
                    {asset.legal_phase && (
                      <Badge variant="outline" className="text-xs">
                        {asset.legal_phase}
                      </Badge>
                    )}
                  </div>
                  {asset.price_approx && (
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      <Euro className="w-3 h-3 mr-1" />
                      {formatCurrency(asset.price_approx)}
                    </Badge>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm leading-tight">
                      {locationData.address || "Dirección no disponible"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {asset.municipio_catastro}, {asset.provincia_catastro}
                    </p>
                    {asset.codigo_postal_catastro && (
                      <p className="text-sm text-muted-foreground">CP: {asset.codigo_postal_catastro}</p>
                    )}
                  </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-auto">
                  {superficie !== "N/A" && (
                    <div className="flex items-center gap-1">
                      <Ruler className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Superficie</p>
                        <p className="font-medium">{superficie} m²</p>
                      </div>
                    </div>
                  )}

                  {asset.ano_construccion_inmueble && asset.ano_construccion_inmueble !== "0" && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Año</p>
                        <p className="font-medium">{asset.ano_construccion_inmueble}</p>
                      </div>
                    </div>
                  )}

                  {asset.rooms && (
                    <div>
                      <p className="text-xs text-muted-foreground">Habitaciones</p>
                      <p className="font-medium">{asset.rooms}</p>
                    </div>
                  )}

                  {asset.bathrooms && (
                    <div>
                      <p className="text-xs text-muted-foreground">Baños</p>
                      <p className="font-medium">{asset.bathrooms}</p>
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
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
