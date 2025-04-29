"use client"

import type { Asset } from "@/types/asset"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { ConditionalField } from "./permissions/conditional-field"
import { RestrictedValue } from "./permissions/restricted-value"
import dynamic from "next/dynamic"

// Dynamically import the map component with no SSR
const PostalCodeMap = dynamic(() => import("./maps/postal-code-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[150px] w-full bg-muted">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
})

export function AssetListItem({ asset }: { asset: Asset }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[250px_1fr_250px] gap-4">
          <div className="relative h-48 bg-muted">
            {asset.images && asset.images.length > 0 ? (
              <img
                src={asset.images[0] || "/placeholder.svg"}
                alt={asset.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <p className="text-muted-foreground">Sin imagen</p>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary">{asset.type}</Badge>
            </div>
          </div>

          <div className="p-4">
            <Link href={`/assets/${asset.id}`}>
              <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">{asset.title}</h3>
            </Link>
            <div className="space-y-2">
              <ConditionalField fieldName="location">
                <p className="text-sm text-muted-foreground">
                  <RestrictedValue
                    fieldName="location"
                    value={`${asset.location.city}, ${asset.location.postalCode}`}
                    fallback="Ubicación restringida"
                  />
                </p>
              </ConditionalField>
              <ConditionalField fieldName="price">
                <p className="font-bold text-lg">
                  <RestrictedValue
                    fieldName="price"
                    value={formatCurrency(asset.price)}
                    fallback="Precio restringido"
                  />
                </p>
              </ConditionalField>
              <p className="text-sm">{asset.description.substring(0, 150)}...</p>
            </div>
          </div>

          <ConditionalField fieldName="location.postalCode">
            <div className="h-full">
              <RestrictedValue
                fieldName="location.postalCode"
                value={<PostalCodeMap postalCode={asset.location.postalCode} />}
                fallback={
                  <div className="flex items-center justify-center h-full w-full bg-muted">
                    <p className="text-muted-foreground">Mapa restringido</p>
                  </div>
                }
              />
            </div>
          </ConditionalField>
        </div>
      </CardContent>
    </Card>
  )
}
