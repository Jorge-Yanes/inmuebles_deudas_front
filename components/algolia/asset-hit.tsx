"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, getPropertyType, getSuperficie } from "@/lib/utils"
import type { Asset } from "@/types/asset"
import { PropertyMapThumbnail } from "@/components/maps/property-map-thumbnail"
import { MapPin, Home, Ruler, Calendar, Euro } from "lucide-react"
import { Highlight, Snippet } from "react-instantsearch-hooks-web"
import type { Hit } from "instantsearch.js"

interface AssetHitProps {
  hit: Hit<Asset>
}

export function AssetHit({ hit }: AssetHitProps) {
  const propertyType = getPropertyType(hit)
  const superficie = getSuperficie(hit)

  // For the map thumbnail, we need to ensure lat/lng are present
  const assetForMap = {
    ...hit,
    latitude: hit._geoloc?.lat,
    longitude: hit._geoloc?.lng,
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      <Link href={`/assets/${hit.id}`} className="flex flex-col h-full">
        <div className="w-full h-48 bg-gray-100 shrink-0">
          {assetForMap.latitude && assetForMap.longitude ? (
            <PropertyMapThumbnail asset={assetForMap} width={400} height={192} zoom={16} className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              Mapa no disponible
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">
                <Home className="w-3 h-3 mr-1" />
                {propertyType}
              </Badge>
              {hit.legal_phase && (
                <Badge variant="outline" className="text-xs">
                  {hit.legal_phase}
                </Badge>
              )}
            </div>
            {hit.price_approx && (
              <Badge className="bg-green-600 hover:bg-green-700 text-white shrink-0 ml-2">
                <Euro className="w-3 h-3 mr-1" />
                {formatCurrency(hit.price_approx)}
              </Badge>
            )}
          </div>

          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm leading-tight">
                <Highlight attribute="nombre_via_catastro" hit={hit} />
              </p>
              <p className="text-sm text-muted-foreground">
                <Snippet attribute="municipio_catastro" hit={hit} />,{" "}
                <Snippet attribute="provincia_catastro" hit={hit} />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mt-auto pt-3 border-t">
            {superficie > 0 && (
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Superficie</p>
                  <p className="font-medium">{superficie} m²</p>
                </div>
              </div>
            )}
            {hit.ano_construccion_inmueble && hit.ano_construccion_inmueble.toString() !== "0" && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Año</p>
                  <p className="font-medium">{hit.ano_construccion_inmueble.toString()}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
