"use client"

import Link from "next/link"
import dynamic from "next/dynamic"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ConditionalField } from "@/components/permissions/conditional-field"
import { RestrictedValue } from "@/components/permissions/restricted-value"
import type { Asset } from "@/types/asset"
import { marketingStatusLabels, propertyTypeLabels } from "@/types/asset"

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

  // Determine if this is an NPL (Non-Performing Loan) property
  const isNPL = asset.legal_type === "NPL" || asset.legal_phase === "FORECLOSURE"

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

          {/* NPL Badge */}
          {isNPL && <Badge className="absolute left-2 top-2 bg-blue-600 hover:bg-blue-700">NPL</Badge>}

          {/* Status Badge */}
          <Badge
            className="absolute right-2 top-2"
            variant={marketingStatus === "Disponible" ? "default" : "secondary"}
          >
            {marketingStatus}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">A consultar</h3>
          <div className="mt-1 flex items-center text-sm">
            <span className="font-medium">{propertyType}</span>
            <span className="mx-1">en</span>
            <span>
              {asset.city}, {asset.province}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <path d="M3 3v18h18" />
                <path d="M3 15L8 9l4 2 5-5" />
              </svg>
              <span>{asset.sqm} m²</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
