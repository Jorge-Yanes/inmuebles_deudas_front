"use client"

import { useState } from "react"

interface CadastralMapProps {
  reference: string
}

export default function CadastralMap({ reference }: CadastralMapProps) {
  const [error, setError] = useState(false)

  if (!reference) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted">
        <p className="text-muted-foreground">No hay referencia catastral disponible</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      {!error ? (
        <iframe
          src={`https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${reference}`}
          className="w-full h-full border-0"
          title={`Mapa catastral de referencia ${reference}`}
          loading="lazy"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-muted">
          <p className="text-muted-foreground">No se pudo cargar el mapa catastral</p>
        </div>
      )}
    </div>
  )
}
