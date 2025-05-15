"use client"

import { memo } from "react"
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
  return (
    <TooltipProvider>
      <div
        className="absolute top-2 right-2 z-10 flex gap-1 bg-background/80 p-1 rounded-md backdrop-blur-sm"
        data-testid="map-type-selector"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentType === "standard" ? "default" : "outline"}
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange("standard")
              }}
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
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange("cadastral")
              }}
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
