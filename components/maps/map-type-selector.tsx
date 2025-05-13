"use client"

import { useState, useEffect, memo } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Map, FileText } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type MapType = "standard" | "cadastral"

interface MapTypeSelectorProps {
  onChange: (type: MapType) => void
  currentType: MapType
  hasCadastralData: boolean
}

// Use memo to prevent unnecessary re-renders
export const MapTypeSelector = memo(function MapTypeSelector({
  onChange,
  currentType,
  hasCadastralData,
}: MapTypeSelectorProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render for admin users
  if (!mounted || user?.role !== "admin") {
    return null
  }

  return (
    <TooltipProvider>
      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/80 p-1 rounded-md backdrop-blur-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentType === "standard" ? "default" : "outline"}
              size="icon"
              onClick={() => onChange("standard")}
              className="h-8 w-8"
            >
              <Map className="h-4 w-4" />
              <span className="sr-only">Mapa Estándar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mapa Estándar</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentType === "cadastral" ? "default" : "outline"}
              size="icon"
              onClick={() => onChange("cadastral")}
              className="h-8 w-8"
              disabled={!hasCadastralData}
            >
              <FileText className="h-4 w-4" />
              <span className="sr-only">Mapa Catastral</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hasCadastralData ? "Mapa Catastral" : "Datos catastrales no disponibles"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
})
