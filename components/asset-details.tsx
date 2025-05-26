"use client"

import { useEffect, useState } from "react"
import { Building, Home, MapPin, Ruler, User, Calendar, TrendingUp, Euro, Calculator } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPropertyById } from "@/lib/firestore/property-service"
import { useAuth } from "@/context/auth-context"
import { useFieldPermissions } from "@/context/field-permissions-context"
import { ConditionalField } from "@/components/permissions/conditional-field"
import { RestrictedValue } from "@/components/permissions/restricted-value"
import type { Asset } from "@/types/asset"
import {
  formatCurrency,
  formatDate,
  marketingStatusLabels,
  propertyTypeLabels,
  legalPhaseLabels,
  getFullAddress,
  getSuperficie,
  calculateMarketValue,
  calculateRentalMarketValue,
} from "@/types/asset"
import AssetMap from "./maps/asset-map"
import dynamic from "next/dynamic"

// Importar dinámicamente el componente de mapa sin SSR
const PostalCodeMap = dynamic(() => import("./maps/postal-code-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px] w-full bg-muted">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
})

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
  const fullAddress = getFullAddress(asset)
  const superficie = getSuperficie(asset)
  const marketValue = calculateMarketValue(asset)
  const rentalMarketValue = calculateRentalMarketValue(asset)

  // Calculate property sale price (using available debt/financial data)
  const propertySalePrice = asset.price_approx || asset.gbv || asset.auction_base || asset.deuda || asset.DEUDA || 0

  // Definir pestañas disponibles según permisos
  const availableTabs = ["description", "details", "cadastral"]
  if (hasViewPermission("legal_phase") || hasViewPermission("legal_type")) {
    availableTabs.push("legal")
  }
  if (hasViewPermission("price_approx") || hasViewPermission("auction_base")) {
    availableTabs.push("financial")
  }
  if (asset.precio_idealista_venta_m2 || asset.precio_idealista_alquiler_m2) {
    availableTabs.push("market")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <AssetMap asset={asset} />
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold">{asset.title || `${propertyType} en ${asset.municipio_catastro}`}</h2>
          <div className="mt-2 flex items-center text-muted-foreground">
            <MapPin className="mr-1 h-5 w-5" />
            {fullAddress}, {asset.municipio_catastro}, {asset.provincia_catastro}
          </div>
          <ConditionalField fieldName="reference_code">
            {asset.reference_code && (
              <div className="mt-1 text-sm text-muted-foreground">Ref: {asset.reference_code}</div>
            )}
          </ConditionalField>

          {/* Información de precio con permisos */}
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
                <p className="font-medium">{superficie} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {asset.property_type === "RESIDENTIAL" || asset.property_type === "Vivienda" ? (
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
            <ConditionalField fieldName="ano_construccion_inmueble">
              {asset.ano_construccion_inmueble && asset.ano_construccion_inmueble !== "0" && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Año construcción</p>
                    <p className="font-medium">{asset.ano_construccion_inmueble}</p>
                  </div>
                </div>
              )}
            </ConditionalField>
          </div>

          <Tabs defaultValue={availableTabs[0]} className="mt-6">
            <TabsList>
              {availableTabs.includes("description") && <TabsTrigger value="description">Descripción</TabsTrigger>}
              {availableTabs.includes("details") && <TabsTrigger value="details">Detalles</TabsTrigger>}
              {availableTabs.includes("cadastral") && <TabsTrigger value="cadastral">Datos Catastrales</TabsTrigger>}
              {availableTabs.includes("legal") && <TabsTrigger value="legal">Información Legal</TabsTrigger>}
              {availableTabs.includes("financial") && (
                <TabsTrigger value="financial">Información Financiera</TabsTrigger>
              )}
              {availableTabs.includes("market") && <TabsTrigger value="market">Datos de Mercado</TabsTrigger>}
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <p>
                {asset.descripcion ||
                  asset.description ||
                  `${propertyType} ubicado en ${fullAddress}, ${asset.municipio_catastro}, ${asset.provincia_catastro}. Superficie construida de ${superficie}m².`}
              </p>
              <ConditionalField fieldName="extras">
                {asset.extras && (
                  <div className="mt-4">
                    <h4 className="font-medium">Características adicionales:</h4>
                    <p className="mt-1">{asset.extras}</p>
                  </div>
                )}
              </ConditionalField>
              <ConditionalField fieldName="uso_predominante_inmueble">
                {asset.uso_predominante_inmueble && (
                  <div className="mt-4">
                    <h4 className="font-medium">Uso predominante:</h4>
                    <p className="mt-1">{asset.uso_predominante_inmueble}</p>
                  </div>
                )}
              </ConditionalField>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3">Identificación</h4>
                    <div className="space-y-3">
                      <ConditionalField fieldName="ndg">
                        {asset.ndg && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">NDG:</span>
                            <span className="font-medium">{asset.ndg}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="reference_code">
                        {asset.reference_code && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Código de referencia:</span>
                            <span className="font-medium">{asset.reference_code}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="cadastral_reference">
                        {asset.cadastral_reference && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Referencia catastral:</span>
                            <span className="font-medium">{asset.cadastral_reference}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="idufir">
                        {asset.idufir && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">IDUFIR:</span>
                            <span className="font-medium">{asset.idufir}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="property_id">
                        {asset.property_id && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">ID Propiedad:</span>
                            <span className="font-medium">{asset.property_id}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="property_idh">
                        {asset.property_idh && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Property IDH:</span>
                            <span className="font-medium">{asset.property_idh}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="property_bank_id">
                        {asset.property_bank_id && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Bank ID:</span>
                            <span className="font-medium">{asset.property_bank_id}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-lg mb-3">Características</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Tipo de propiedad:</span>
                        <span className="font-medium">{propertyType}</span>
                      </div>
                      <ConditionalField fieldName="property_general_subtype">
                        {asset.property_general_subtype && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Subtipo:</span>
                            <span className="font-medium">{asset.property_general_subtype}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Superficie construida:</span>
                        <span className="font-medium">{superficie} m²</span>
                      </div>
                      <ConditionalField fieldName="rooms">
                        {asset.rooms && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Habitaciones:</span>
                            <span className="font-medium">{asset.rooms}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="bathrooms">
                        {asset.bathrooms && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Baños:</span>
                            <span className="font-medium">{asset.bathrooms}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="has_parking">
                        {asset.has_parking && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Plaza de garaje:</span>
                            <span className="font-medium">{asset.has_parking === "1" ? "Sí" : "No"}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="ano_construccion_inmueble">
                        {asset.ano_construccion_inmueble && asset.ano_construccion_inmueble !== "0" && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Año de construcción:</span>
                            <span className="font-medium">{asset.ano_construccion_inmueble}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="uso_predominante_inmueble">
                        {asset.uso_predominante_inmueble && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Uso predominante:</span>
                            <span className="font-medium">{asset.uso_predominante_inmueble}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3">Ubicación Catastral</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Dirección completa:</span>
                        <span className="font-medium text-right">{fullAddress}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Municipio:</span>
                        <span className="font-medium">{asset.municipio_catastro}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Provincia:</span>
                        <span className="font-medium">{asset.provincia_catastro}</span>
                      </div>
                      <ConditionalField fieldName="codigo_postal_catastro">
                        {asset.codigo_postal_catastro && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Código postal:</span>
                            <span className="font-medium">{asset.codigo_postal_catastro}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="tipo_via_catastro">
                        {asset.tipo_via_catastro && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Tipo de vía:</span>
                            <span className="font-medium">{asset.tipo_via_catastro}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="nombre_via_catastro">
                        {asset.nombre_via_catastro && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Nombre de vía:</span>
                            <span className="font-medium">{asset.nombre_via_catastro}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="numero_portal_catastro">
                        {asset.numero_portal_catastro && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Número portal:</span>
                            <span className="font-medium">{asset.numero_portal_catastro}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-lg mb-3">Estado y Gestión</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Estado de marketing:</span>
                        <span className="font-medium">{marketingStatus}</span>
                      </div>
                      <ConditionalField fieldName="registration_status">
                        {asset.registration_status && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Estado de registro:</span>
                            <span className="font-medium">{asset.registration_status}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="working_status">
                        {asset.working_status && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Estado de trabajo:</span>
                            <span className="font-medium">{asset.working_status}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="estado_posesion_fisica">
                        {asset.estado_posesion_fisica && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Estado de posesión física:</span>
                            <span className="font-medium">{asset.estado_posesion_fisica}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="marketing_suspended_reason">
                        {asset.marketing_suspended_reason && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Razón suspensión marketing:</span>
                            <span className="font-medium">{asset.marketing_suspended_reason}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="campania">
                        {asset.campania && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Campaña:</span>
                            <span className="font-medium">{asset.campania}</span>
                          </div>
                        )}
                      </ConditionalField>
                      <ConditionalField fieldName="portfolio">
                        {asset.portfolio && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Cartera:</span>
                            <span className="font-medium">{asset.portfolio}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cadastral" className="mt-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3">Datos Catastrales Principales</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Provincia:</span>
                        <span className="font-medium">{asset.provincia_catastro}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Municipio:</span>
                        <span className="font-medium">{asset.municipio_catastro}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Tipo de vía:</span>
                        <span className="font-medium">{asset.tipo_via_catastro}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Nombre de vía:</span>
                        <span className="font-medium">{asset.nombre_via_catastro}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Número portal:</span>
                        <span className="font-medium">{asset.numero_portal_catastro}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Código postal:</span>
                        <span className="font-medium">{asset.codigo_postal_catastro}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Superficie construida:</span>
                        <span className="font-medium">{asset.superficie_construida_m2} m²</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3">Detalles Catastrales</h4>
                    <div className="space-y-3">
                      <ConditionalField fieldName="escalera_catastro">
                        {asset.escalera_catastro && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Escalera:</span>
                            <span className="font-medium">{asset.escalera_catastro}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="planta_catastro">
                        {asset.planta_catastro && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Planta:</span>
                            <span className="font-medium">{asset.planta_catastro}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="puerta_catastro">
                        {asset.puerta_catastro && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Puerta:</span>
                            <span className="font-medium">{asset.puerta_catastro}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="parcel">
                        {asset.parcel && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Parcela:</span>
                            <span className="font-medium">{asset.parcel}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="lien">
                        {asset.lien && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Lien:</span>
                            <span className="font-medium">{asset.lien}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="alt_id1">
                        {asset.alt_id1 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">ID Alternativo:</span>
                            <span className="font-medium">{asset.alt_id1}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="legal" className="mt-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3">Información Legal</h4>
                    <div className="space-y-3">
                      <ConditionalField fieldName="legal_type">
                        {asset.legal_type && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Tipo legal:</span>
                            <span className="font-medium">{asset.legal_type}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="legal_phase">
                        {asset.legal_phase && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Fase legal:</span>
                            <span className="font-medium">{legalPhase}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="tipo_procedimiento">
                        {asset.tipo_procedimiento && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Tipo de procedimiento:</span>
                            <span className="font-medium">{asset.tipo_procedimiento}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="fase_procedimiento">
                        {asset.fase_procedimiento && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Fase de procedimiento:</span>
                            <span className="font-medium">{asset.fase_procedimiento}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="fase_actual">
                        {asset.fase_actual && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Fase actual:</span>
                            <span className="font-medium">{asset.fase_actual}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="hip_under_re_mgmt">
                        {asset.hip_under_re_mgmt && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Hipoteca bajo gestión:</span>
                            <span className="font-medium">{asset.hip_under_re_mgmt}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3">Fechas Importantes</h4>
                    <div className="space-y-3">
                      <ConditionalField fieldName="closing_date">
                        {asset.closing_date && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Fecha de cierre:</span>
                            <span className="font-medium">{formatDate(asset.closing_date)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="portfolio_closing_date">
                        {asset.portfolio_closing_date && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Fecha de cierre de cartera:</span>
                            <span className="font-medium">{formatDate(asset.portfolio_closing_date)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="date_under_re_mgmt">
                        {asset.date_under_re_mgmt && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Fecha bajo gestión:</span>
                            <span className="font-medium">{formatDate(asset.date_under_re_mgmt)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="fecha_subasta">
                        {asset.fecha_subasta && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Fecha de subasta:</span>
                            <span className="font-medium">{formatDate(asset.fecha_subasta)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="fecha_cesion_remate">
                        {asset.fecha_cesion_remate && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Fecha de cesión de remate:</span>
                            <span className="font-medium">{formatDate(asset.fecha_cesion_remate)}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="mt-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3">Información Financiera Principal</h4>
                    <div className="space-y-3">
                      <ConditionalField fieldName="price_approx">
                        {asset.price_approx && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Precio aproximado:</span>
                            <span className="font-medium">{formatCurrency(asset.price_approx)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="price_to_brokers">
                        {asset.price_to_brokers && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Precio para intermediarios:</span>
                            <span className="font-medium">{formatCurrency(asset.price_to_brokers)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="auction_base">
                        {asset.auction_base && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Base de subasta:</span>
                            <span className="font-medium">{formatCurrency(asset.auction_base)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="auction_value">
                        {asset.auction_value && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Valor de subasta:</span>
                            <span className="font-medium">{formatCurrency(asset.auction_value)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="gbv">
                        {asset.gbv && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Valor bruto (GBV):</span>
                            <span className="font-medium">{formatCurrency(asset.gbv)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="hv">
                        {asset.hv && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Valor hipotecario:</span>
                            <span className="font-medium">{formatCurrency(asset.hv)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="purchase_price">
                        {asset.purchase_price && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Precio de compra:</span>
                            <span className="font-medium">{formatCurrency(asset.purchase_price)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="uw_value">
                        {asset.uw_value && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Valor UW:</span>
                            <span className="font-medium">{formatCurrency(asset.uw_value)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="hipoges_value_total">
                        {asset.hipoges_value_total && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Valor total Hipoges:</span>
                            <span className="font-medium">{formatCurrency(asset.hipoges_value_total)}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3">Información de Deuda</h4>
                    <div className="space-y-3">
                      <ConditionalField fieldName="deuda">
                        {asset.deuda && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Deuda:</span>
                            <span className="font-medium">{formatCurrency(asset.deuda)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="DEUDA">
                        {asset.DEUDA && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Deuda (Alt):</span>
                            <span className="font-medium">{formatCurrency(asset.DEUDA)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="ob">
                        {asset.ob && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">OB:</span>
                            <span className="font-medium">{formatCurrency(asset.ob)}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="borrower_name">
                        {asset.borrower_name && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Nombre del prestatario:</span>
                            <span className="font-medium">{asset.borrower_name}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="reference_code_1">
                        {asset.reference_code_1 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Código de referencia 1:</span>
                            <span className="font-medium">{asset.reference_code_1}</span>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="id_portal_subasta">
                        {asset.id_portal_subasta && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">ID Portal Subasta:</span>
                            <span className="font-medium">{asset.id_portal_subasta}</span>
                          </div>
                        )}
                      </ConditionalField>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="market" className="mt-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Datos de Mercado
                    </h4>
                    <div className="space-y-4">
                      <ConditionalField fieldName="precio_idealista_venta_m2">
                        {asset.precio_idealista_venta_m2 && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Euro className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Precio venta m²</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700">
                              {formatCurrency(asset.precio_idealista_venta_m2)}
                            </p>
                          </div>
                        )}
                      </ConditionalField>

                      <ConditionalField fieldName="precio_idealista_alquiler_m2">
                        {asset.precio_idealista_alquiler_m2 && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Euro className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Precio alquiler m²</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">
                              {formatCurrency(asset.precio_idealista_alquiler_m2)}
                            </p>
                          </div>
                        )}
                      </ConditionalField>

                      {propertySalePrice > 0 && superficie > 0 && (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Calculator className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-800">
                              Precio del inmueble en nuestra plataforma
                            </span>
                          </div>
                          <p className="text-lg font-bold text-purple-700">{formatCurrency(propertySalePrice)}</p>
                          <p className="text-xs text-purple-600 mt-1">
                            {superficie}m² × {formatCurrency(propertySalePrice / superficie)}/m²
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3 flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Valores Calculados
                    </h4>
                    <div className="space-y-4">
                      {marketValue > 0 && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-800">Valor actual en el mercado</span>
                          </div>
                          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(marketValue)}</p>
                          <p className="text-xs text-emerald-600 mt-1">
                            {superficie}m² × {formatCurrency(asset.precio_idealista_venta_m2 || 0)}/m²
                          </p>
                        </div>
                      )}

                      {rentalMarketValue > 0 && (
                        <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Home className="h-4 w-4 text-cyan-600" />
                            <span className="text-sm font-medium text-cyan-800">Valor de alquiler en el mercado</span>
                          </div>
                          <p className="text-2xl font-bold text-cyan-700">{formatCurrency(rentalMarketValue)}</p>
                          <p className="text-xs text-cyan-600 mt-1">
                            {superficie}m² × {formatCurrency(asset.precio_idealista_alquiler_m2 || 0)}/m² (mensual)
                          </p>
                        </div>
                      )}

                      {asset.price_approx && marketValue > 0 && (
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Calculator className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">Análisis de Rentabilidad</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-orange-700">Diferencia con mercado:</span>
                              <span
                                className={`font-medium ${marketValue - asset.price_approx > 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {formatCurrency(marketValue - asset.price_approx)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-orange-700">Descuento sobre mercado:</span>
                              <span className="font-medium text-orange-800">
                                {Math.round((1 - asset.price_approx / marketValue) * 100)}%
                              </span>
                            </div>
                            {rentalMarketValue > 0 && (
                              <div className="flex justify-between">
                                <span className="text-sm text-orange-700">Rentabilidad bruta anual:</span>
                                <span className="font-medium text-green-600">
                                  {Math.round(((rentalMarketValue * 12) / asset.price_approx) * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
              <span className="font-medium">{superficie} m²</span>
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

            <ConditionalField fieldName="ano_construccion_inmueble">
              {asset.ano_construccion_inmueble && asset.ano_construccion_inmueble !== "0" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Año construcción</span>
                  <span className="font-medium">{asset.ano_construccion_inmueble}</span>
                </div>
              )}
            </ConditionalField>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dirección</span>
              <span className="font-medium text-right">{fullAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Municipio</span>
              <span className="font-medium">{asset.municipio_catastro}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provincia</span>
              <span className="font-medium">{asset.provincia_catastro}</span>
            </div>
            <ConditionalField fieldName="codigo_postal_catastro">
              {asset.codigo_postal_catastro && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Código Postal</span>
                  <span className="font-medium">{asset.codigo_postal_catastro}</span>
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

        <ConditionalField fieldName="precio_idealista_venta_m2">
          {(asset.precio_idealista_venta_m2 || asset.precio_idealista_alquiler_m2) && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Datos de Mercado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {propertySalePrice > 0 && superficie > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio en nuestra plataforma</span>
                    <span className="font-medium">{formatCurrency(propertySalePrice)}</span>
                  </div>
                )}

                {marketValue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor mercado</span>
                    <span className="font-medium text-green-600">{formatCurrency(marketValue)}</span>
                  </div>
                )}

                {rentalMarketValue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor alquiler mercado</span>
                    <span className="font-medium text-blue-600">{formatCurrency(rentalMarketValue)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </ConditionalField>
      </div>
    </div>
  )
}
