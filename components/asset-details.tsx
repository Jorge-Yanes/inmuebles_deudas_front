"use client"

import { useEffect, useState } from "react"
import { Building, Home, MapPin, Ruler, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPropertyById } from "@/lib/firestore/property-service"
import { useAuth } from "@/context/auth-context"
import { useFieldPermissions } from "@/context/field-permissions-context"
import { ConditionalField } from "@/components/permissions/conditional-field"
import { RestrictedValue } from "@/components/permissions/restricted-value"
import { StaticMap } from "@/components/maps/static-map"
import type { Asset } from "@/types/asset"
import { formatCurrency, formatDate, marketingStatusLabels, propertyTypeLabels, legalPhaseLabels } from "@/types/asset"

interface AssetDetailsProps {
  id: string
}

export function AssetDetails({ id }: AssetDetailsProps) {
  const { user } = useAuth()
  const { hasViewPermission } = useFieldPermissions()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAsset = async () => {
      setLoading(true)
      try {
        const data = await getPropertyById(id, user)
        setAsset(data)
      } catch (error) {
        console.error("Error fetching asset:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAsset()
  }, [id, user])

  if (loading) {
    return <div className="text-center">Cargando detalles del activo...</div>
  }

  if (!asset) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Activo no encontrado</h3>
        <p className="mt-2 text-muted-foreground">El activo solicitado no existe o ha sido eliminado.</p>
      </div>
    )
  }

  const propertyType = propertyTypeLabels[asset.property_type] || asset.property_type
  const marketingStatus =
    marketingStatusLabels[asset.marketing_status || "AVAILABLE"] || asset.marketing_status || "Disponible"
  const legalPhase = legalPhaseLabels[asset.legal_phase || ""] || asset.legal_phase

  // Define available tabs based on permissions
  const availableTabs = ["description", "details"]
  if (hasViewPermission("legal_phase") || hasViewPermission("legal_type")) {
    availableTabs.push("legal")
  }
  if (hasViewPermission("price_approx") || hasViewPermission("auction_base")) {
    availableTabs.push("financial")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <StaticMap postalCode={asset.zip_code} city={asset.city} province={asset.province} height={400} width={800} />
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold">{asset.title || `${propertyType} en ${asset.city}`}</h2>
          <div className="mt-2 flex items-center text-muted-foreground">
            <MapPin className="mr-1 h-5 w-5" />
            {asset.address}, {asset.city}, {asset.province}
          </div>
          <ConditionalField fieldName="reference_code">
            {asset.reference_code && (
              <div className="mt-1 text-sm text-muted-foreground">Ref: {asset.reference_code}</div>
            )}
          </ConditionalField>

          {/* Price information with permissions */}
          <div className="mt-4">
            <RestrictedValue
              fieldName="price_approx"
              value={<p className="text-3xl font-bold">{formatCurrency(asset.price_approx)}</p>}
            />

            <RestrictedValue
              fieldName="auction_base"
              value={
                asset.auction_base && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Base de subasta: {formatCurrency(asset.auction_base)}
                  </p>
                )
              }
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Superficie</p>
                <p className="font-medium">{asset.sqm} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {asset.property_type === "RESIDENTIAL" ? (
                <Home className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Building className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{propertyType}</p>
              </div>
            </div>
            <ConditionalField fieldName="rooms">
              {asset.rooms && (
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Habitaciones</p>
                    <p className="font-medium">{asset.rooms}</p>
                  </div>
                </div>
              )}
            </ConditionalField>
            <ConditionalField fieldName="bathrooms">
              {asset.bathrooms && (
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Baños</p>
                    <p className="font-medium">{asset.bathrooms}</p>
                  </div>
                </div>
              )}
            </ConditionalField>
          </div>

          <Tabs defaultValue={availableTabs[0]} className="mt-6">
            <TabsList>
              {availableTabs.includes("description") && <TabsTrigger value="description">Descripción</TabsTrigger>}
              {availableTabs.includes("details") && <TabsTrigger value="details">Detalles</TabsTrigger>}
              {availableTabs.includes("legal") && <TabsTrigger value="legal">Información Legal</TabsTrigger>}
              {availableTabs.includes("financial") && (
                <TabsTrigger value="financial">Información Financiera</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <p>
                {asset.description ||
                  `${propertyType} ubicado en ${asset.address}, ${asset.city}, ${asset.province}. Superficie de ${asset.sqm}m².`}
              </p>
              <ConditionalField fieldName="extras">
                {asset.extras && (
                  <div className="mt-4">
                    <h4 className="font-medium">Características adicionales:</h4>
                    <p className="mt-1">{asset.extras}</p>
                  </div>
                )}
              </ConditionalField>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Identificación</h4>
                    <div className="mt-2 space-y-2">
                      <ConditionalField fieldName="ndg">
                        {asset.ndg && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">NDG:</span>
                            <span>{asset.ndg}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="reference_code">
                        {asset.reference_code && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Código de referencia:</span>
                            <span>{asset.reference_code}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="cadastral_reference">
                        {asset.cadastral_reference && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Referencia catastral:</span>
                            <span>{asset.cadastral_reference}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Ubicación</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dirección:</span>
                        <span>{asset.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ciudad:</span>
                        <span>{asset.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Provincia:</span>
                        <span>{asset.province}</span>
                      </div>
                      <ConditionalField fieldName="zip_code">
                        {asset.zip_code && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Código postal:</span>
                            <span>{asset.zip_code}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="floor">
                        {asset.floor && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Planta:</span>
                            <span>{asset.floor}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="door">
                        {asset.door && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Puerta:</span>
                            <span>{asset.door}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Características</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo de propiedad:</span>
                        <span>{propertyType}</span>
                      </div>
                      <ConditionalField fieldName="property_general_subtype">
                        {asset.property_general_subtype && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtipo:</span>
                            <span>{asset.property_general_subtype}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Superficie:</span>
                        <span>{asset.sqm} m²</span>
                      </div>
                      <ConditionalField fieldName="rooms">
                        {asset.rooms && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Habitaciones:</span>
                            <span>{asset.rooms}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="bathrooms">
                        {asset.bathrooms && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Baños:</span>
                            <span>{asset.bathrooms}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="has_parking">
                        {asset.has_parking && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Plaza de garaje:</span>
                            <span>{asset.has_parking === 1 ? "Sí" : "No"}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Estado</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado de marketing:</span>
                        <span>{marketingStatus}</span>
                      </div>
                      <ConditionalField fieldName="estado_posesion_fisica">
                        {asset.estado_posesion_fisica && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estado de posesión física:</span>
                            <span>{asset.estado_posesion_fisica}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="legal" className="mt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Información Legal</h4>
                    <div className="mt-2 space-y-2">
                      <ConditionalField fieldName="legal_type">
                        {asset.legal_type && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo legal:</span>
                            <span>{asset.legal_type}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="legal_phase">
                        {asset.legal_phase && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fase legal:</span>
                            <span>{legalPhase}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="tipo_procedimiento">
                        {asset.tipo_procedimiento && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo de procedimiento:</span>
                            <span>{asset.tipo_procedimiento}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="fase_procedimiento">
                        {asset.fase_procedimiento && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fase de procedimiento:</span>
                            <span>{asset.fase_procedimiento}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="fase_actual">
                        {asset.fase_actual && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fase actual:</span>
                            <span>{asset.fase_actual}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Fechas Importantes</h4>
                    <div className="mt-2 space-y-2">
                      <ConditionalField fieldName="closing_date">
                        {asset.closing_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha de cierre:</span>
                            <span>{formatDate(asset.closing_date)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="portfolio_closing_date">
                        {asset.portfolio_closing_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha de cierre de cartera:</span>
                            <span>{formatDate(asset.portfolio_closing_date)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="fecha_subasta">
                        {asset.fecha_subasta && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha de subasta:</span>
                            <span>{formatDate(asset.fecha_subasta)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="fecha_cesion_remate">
                        {asset.fecha_cesion_remate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha de cesión de remate:</span>
                            <span>{formatDate(asset.fecha_cesion_remate)}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="mt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Información Financiera</h4>
                    <div className="mt-2 space-y-2">
                      <ConditionalField fieldName="price_approx">
                        {asset.price_approx && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio aproximado:</span>
                            <span>{formatCurrency(asset.price_approx)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="price_to_brokers">
                        {asset.price_to_brokers && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio para intermediarios:</span>
                            <span>{formatCurrency(asset.price_to_brokers)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="auction_base">
                        {asset.auction_base && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base de subasta:</span>
                            <span>{formatCurrency(asset.auction_base)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="auction_value">
                        {asset.auction_value && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor de subasta:</span>
                            <span>{formatCurrency(asset.auction_value)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="gbv">
                        {asset.gbv && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor bruto (GBV):</span>
                            <span>{formatCurrency(asset.gbv)}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Deuda</h4>
                    <div className="mt-2 space-y-2">
                      <ConditionalField fieldName="deuda">
                        {asset.deuda && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Deuda:</span>
                            <span>{formatCurrency(asset.deuda)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="ob">
                        {asset.ob && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">OB:</span>
                            <span>{formatCurrency(asset.ob)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="borrower_name">
                        {asset.borrower_name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nombre del prestatario:</span>
                            <span>{asset.borrower_name}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Información Principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConditionalField fieldName="reference_code">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Referencia</span>
                <span className="font-medium">{asset.reference_code || "N/A"}</span>
              </div>
            </ConditionalField>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium">{propertyType}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Superficie</span>
              <span className="font-medium">{asset.sqm} m²</span>
            </div>

            <RestrictedValue
              fieldName="price_approx"
              value={
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio</span>
                  <span className="font-medium">{formatCurrency(asset.price_approx)}</span>
                </div>
              }
            />

            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="font-medium">{marketingStatus}</span>
            </div>

            <RestrictedValue
              fieldName="legal_phase"
              value={
                asset.legal_phase && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fase legal</span>
                    <span className="font-medium">{legalPhase}</span>
                  </div>
                )
              }
            />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dirección</span>
              <span className="font-medium text-right">{asset.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ciudad</span>
              <span className="font-medium">{asset.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provincia</span>
              <span className="font-medium">{asset.province}</span>
            </div>
            <ConditionalField fieldName="zip_code">
              {asset.zip_code && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Código Postal</span>
                  <span className="font-medium">{asset.zip_code}</span>
                </div>
              )}
            </ConditionalField>

            <ConditionalField fieldName="comarca">
              {asset.comarca && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comarca</span>
                  <span className="font-medium">{asset.comarca}</span>
                </div>
              )}
            </ConditionalField>
          </CardContent>
        </Card>

        <ConditionalField fieldName="fecha_subasta">
          {asset.fecha_subasta && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Información de Subasta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de Subasta</span>
                  <span className="font-medium">{formatDate(asset.fecha_subasta)}</span>
                </div>
                <RestrictedValue
                  fieldName="auction_base"
                  value={
                    asset.auction_base && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base de Subasta</span>
                        <span className="font-medium">{formatCurrency(asset.auction_base)}</span>
                      </div>
                    )
                  }
                />

                <RestrictedValue
                  fieldName="auction_value"
                  value={
                    asset.auction_value && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor de Subasta</span>
                        <span className="font-medium">{formatCurrency(asset.auction_value)}</span>
                      </div>
                    )
                  }
                />

                <ConditionalField fieldName="id_portal_subasta">
                  {asset.id_portal_subasta && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID Portal Subasta</span>
                      <span className="font-medium">{asset.id_portal_subasta}</span>
                    </div>
                  )}
                </ConditionalField>
              </CardContent>
            </Card>
          )}
        </ConditionalField>
      </div>
    </div>
  )
}
