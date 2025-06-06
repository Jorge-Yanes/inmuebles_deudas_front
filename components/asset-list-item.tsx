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
  // Ensure asset has all required properties with defaults
  const safeAsset = {
    id: asset?.id || "",
    legal_phase: asset?.legal_phase || "",
    price_approx: asset?.price_approx || 0,
    municipio_catastro: asset?.municipio_catastro || "",
    provincia_catastro: asset?.provincia_catastro || "",
    codigo_postal_catastro: asset?.codigo_postal_catastro || "",
    ano_construccion_inmueble: asset?.ano_construccion_inmueble || "",
    rooms: asset?.rooms || "",
    bathrooms: asset?.bathrooms || "",
    marketing_status: asset?.marketing_status || "",
    ...asset,
  }

  const propertyType = getPropertyType(safeAsset)
  const superficie = getSuperficie(safeAsset)
  const locationData = getLocationForMap(safeAsset)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link href={`/assets/${safeAsset.id}`}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Map Thumbnail */}
            <div className="w-full md:w-64 h-48 md:h-40 bg-gray-100 flex-shrink-0">
              <PropertyMapThumbnail asset={safeAsset} width={256} height={160} zoom={16} className="w-full h-full" />
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
                    {safeAsset.legal_phase && (
                      <Badge variant="outline" className="text-xs">
                        {safeAsset.legal_phase}
                      </Badge>
                    )}
                  </div>
                  {safeAsset.price_approx && (
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      <Euro className="w-3 h-3 mr-1" />
                      {formatCurrency(safeAsset.price_approx)}
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
                      {safeAsset.municipio_catastro}, {safeAsset.provincia_catastro}
                    </p>
                    {safeAsset.codigo_postal_catastro && (
                      <p className="text-sm text-muted-foreground">CP: {safeAsset.codigo_postal_catastro}</p>
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

                  {safeAsset.ano_construccion_inmueble && safeAsset.ano_construccion_inmueble !== "0" && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Año</p>
                        <p className="font-medium">{safeAsset.ano_construccion_inmueble}</p>
                      </div>
                    </div>
                  )}

                  {safeAsset.rooms && (
                    <div>
                      <p className="text-xs text-muted-foreground">Habitaciones</p>
                      <p className="font-medium">{safeAsset.rooms}</p>
                    </div>
                  )}

                  {safeAsset.bathrooms && (
                    <div>
                      <p className="text-xs text-muted-foreground">Baños</p>
                      <p className="font-medium">{safeAsset.bathrooms}</p>
                    </div>
                  )}
                </div>

                {/* Marketing Status */}
                {safeAsset.marketing_status && (
                  <div className="mt-3 pt-3 border-t">
                    <Badge variant="outline" className="text-xs">
                      {safeAsset.marketing_status}
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
