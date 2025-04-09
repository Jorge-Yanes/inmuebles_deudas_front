"use client"

import { useEffect, useState } from "react"
import { Grid, List } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type ViewMode = "grid" | "list"

interface ViewToggleProps {
  onChange: (view: ViewMode) => void
  defaultView?: ViewMode
}

export function ViewToggle({ onChange, defaultView = "list" }: ViewToggleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView)

  // Load saved view preference on mount
  useEffect(() => {
    const savedView = localStorage.getItem("viewMode") as ViewMode | null
    if (savedView) {
      setViewMode(savedView)
      onChange(savedView)
    }
  }, [onChange])

  const handleViewChange = (value: string) => {
    if (value) {
      const newView = value as ViewMode
      setViewMode(newView)
      localStorage.setItem("viewMode", newView)
      onChange(newView)
    }
  }

  return (
    <TooltipProvider>
      <ToggleGroup type="single" value={viewMode} onValueChange={handleViewChange} className="border rounded-md">
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="grid" aria-label="Vista en cuadrícula">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Vista en cuadrícula</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="list" aria-label="Vista en lista">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Vista en lista</p>
          </TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  )
}
