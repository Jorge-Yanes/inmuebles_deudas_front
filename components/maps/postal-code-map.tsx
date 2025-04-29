"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Placeholder loading component
const MapLoading = () => (
  <div className="flex items-center justify-center h-full w-full min-h-[300px] bg-muted">
    <p className="text-muted-foreground">Cargando mapa...</p>
  </div>
)

// Dynamically import the map component with no SSR
const MapWithNoSSR = dynamic(() => import("./map-component").then((mod) => mod.MapComponent), {
  ssr: false,
  loading: () => <MapLoading />,
})

export default function PostalCodeMap({ postalCode }: { postalCode: string }) {
  const [hasPostalCode, setHasPostalCode] = useState(false)

  useEffect(() => {
    setHasPostalCode(!!postalCode)
  }, [postalCode])

  if (!hasPostalCode) {
    return (
      <div className="flex items-center justify-center h-full w-full min-h-[300px] bg-muted">
        <p className="text-muted-foreground">No se pudo cargar el mapa para este código postal</p>
      </div>
    )
  }

  return <MapWithNoSSR postalCode={postalCode} />
}
