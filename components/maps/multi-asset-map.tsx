"use client"

import { useState, useMemo } from "react"
import type { Asset } from "@/types/asset"
import GoogleMapBase from "./google-map-base"
import { Button } from "@/components/ui/button"
import { MapPin, List } from "lucide-react"

interface MultiAssetMapProps {
  assets: Asset[]
  height?: string | number
  showControls?: boolean
  onAssetSelect?: (asset: Asset) => void
}

export default function MultiAssetMap({
  assets,
  height = "400px",
  showControls = true,
  onAssetSelect,
}: MultiAssetMapProps) {
  const [showList, setShowList] = useState(false)

  const mapStyle = typeof height === "number" ? { height: `${height}px` } : { height }

  // Filtrar activos con ubicación
  const assetsWithLocation = useMemo(() => {
    return assets.filter((asset) => {
      return (
        asset?.codigo_postal_catastro ||
        asset?.municipio_catastro ||
        asset?.provincia_catastro ||
        asset?.zip_code ||
        asset?.cadastral_reference
      )
    })
  }, [assets])

  if (assetsWithLocation.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No hay activos con ubicación disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full" style={mapStyle}>
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            variant={showList ? "default" : "outline"}
            size="sm"
            onClick={() => setShowList(!showList)}
            className="bg-white/90 backdrop-blur-sm"
          >
            <List className="h-4 w-4" />
            {showList ? "Ocultar" : "Lista"}
          </Button>
        </div>
      )}

      <GoogleMapBase assets={assetsWithLocation} height="100%" showMarkers={true} className="w-full h-full" />

      {showList && (
        <div className="absolute left-2 top-2 bottom-2 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 border-b bg-white/90">
            <h3 className="font-semibold text-sm">Activos en el mapa ({assetsWithLocation.length})</h3>
          </div>
          <div className="overflow-y-auto h-full pb-16">
            {assetsWithLocation.map((asset, index) => (
              <div
                key={asset.id || index}
                className="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onAssetSelect?.(asset)}
              >
                <div className="font-medium text-sm truncate">
                  {asset.property_type} en {asset.municipio_catastro}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {asset.tipo_via_catastro} {asset.nombre_via_catastro} {asset.numero_portal_catastro}
                </div>
                <div className="text-xs text-gray-500">
                  {asset.municipio_catastro}, {asset.provincia_catastro}
                </div>
                {asset.price_approx && (
                  <div className="text-sm font-semibold text-green-600 mt-1">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    }).format(asset.price_approx)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
