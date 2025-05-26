"use client"

import Link from "next/link"
import { ArrowUpRight, Building, Calendar, Home, MapPin, Ruler } from "lucide-react"
import dynamic from "next/dynamic"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConditionalField } from "@/components/permissions/conditional-field"
import { RestrictedValue } from "@/components/permissions/restricted-value"
import type { Asset } from "@/types/asset"
import { formatCurrency, marketingStatusLabels, propertyTypeLabels, getFullAddress, getSuperficie } from "@/types/asset"

// Dynamically import the map component with no SSR
const PostalCodeMap = dynamic(() => import("./maps/postal-code-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-muted">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
})

interface AssetListItemProps {
  asset: Asset
}

export function AssetListItem({ asset }: AssetListItemProps) {
  const propertyType = propertyTypeLabels[asset.property_type] || asset.property_type
  const marketingStatus =
    marketingStatusLabels[asset.marketing_status || "AVAILABLE"] || asset.marketing_status || "Disponible"
  const fullAddress = getFullAddress(asset)
  const superficie = getSuperficie(asset)

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 md:h-auto md:w-1/3 md:max-w-xs">
          {/* Map area */}
          <ConditionalField fieldName="codigo_postal_catastro">
            {asset.codigo_postal_catastro ? (
              <RestrictedValue
                fieldName="codigo_postal_catastro"
                value={<PostalCodeMap postalCode={asset.codigo_postal_catastro} />}
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

        <div className="flex flex-col flex-grow p-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <h3 className="text-xl font-semibold">
                {asset.title || `${propertyType} en ${asset.municipio_catastro}`}
              </h3>
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {fullAddress}, {asset.municipio_catastro}, {asset.provincia_catastro}
              </div>
              <ConditionalField fieldName="reference_code">
                {asset.reference_code && (
                  <div className="mt-1 text-xs text-muted-foreground">Ref: {asset.reference_code}</div>
                )}
              </ConditionalField>
            </div>
            <RestrictedValue
              fieldName="price_approx"
              value={<p className="text-xl font-bold md:text-right">{formatCurrency(asset.price_approx)}</p>}
            />
          </div>

          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {asset.description ||
              `${propertyType} ubicado en ${fullAddress}, ${asset.municipio_catastro}, ${asset.provincia_catastro}. ${superficie}m².`}
          </p>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Superficie</p>
                <p className="text-sm font-medium">{superficie} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {asset.property_type === "RESIDENTIAL" || asset.property_type === "Vivienda" ? (
                <Home className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Building className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-medium">{propertyType}</p>
              </div>
            </div>
            <ConditionalField fieldName="ano_construccion_inmueble">
              {asset.ano_construccion_inmueble && asset.ano_construccion_inmueble !== "0" && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Año</p>
                    <p className="text-sm font-medium">{asset.ano_construccion_inmueble}</p>
                  </div>
                </div>
              )}
            </ConditionalField>
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
