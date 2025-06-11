"use client"

import type React from "react"

import { useRefinementList, useRange, useClearRefinements, useNumericMenu } from "react-instantsearch-hooks-web"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { propertyTypeLabels } from "@/types/asset"

// A reusable panel component for styling
const FilterPanel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4 border-b pb-6 mb-6">
    <h3 className="text-md font-semibold">{title}</h3>
    {children}
  </div>
)

export function AlgoliaSearchFilters() {
  const { refine: clearAll, canRefine: canClear } = useClearRefinements()

  const { items: propertyTypeItems, refine: refinePropertyType } = useRefinementList({
    attribute: "property_type",
  })
  const { items: provinciaItems, refine: refineProvincia } = useRefinementList({
    attribute: "provincia_catastro",
  })
  const { items: legalPhaseItems, refine: refineLegalPhase } = useRefinementList({ attribute: "legal_phase" })

  const { start, range, refine: refinePrice } = useRange({
    attribute: "price_approx",
  })
  const { start: startSqm, range: rangeSqm, refine: refineSqm } = useRange({
    attribute: "superficie_construida_m2",
  })

  const { items: roomItems, refine: refineRooms } = useNumericMenu({
    attribute: "rooms",
    items: [
      { label: "Todas", start: 0 },
      { label: "1+", start: 1 },
      { label: "2+", start: 2 },
      { label: "3+", start: 3 },
      { label: "4+", start: 4 },
    ],
  })

  return (
    <div className="p-4 space-y-6 overflow-auto max-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtros</h2>
        {canClear && (
          <Button variant="ghost" size="sm" onClick={() => clearAll()}>
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      <FilterPanel title="Tipo de Propiedad">
        {propertyTypeItems.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <Checkbox
              id={`prop-${item.value}`}
              checked={item.isRefined}
              onCheckedChange={() => {
                console.log("Applying property type filter:", item.value)
                refinePropertyType(item.value)
              }}
            />
            <label
              htmlFor={`prop-${item.value}`}
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between w-full"
            >
              <span>{propertyTypeLabels[item.label] || item.label}</span>
              <span className="text-muted-foreground">{item.count}</span>
            </label>
          </div>
        ))}
      </FilterPanel>

      <FilterPanel title="Provincia">
        <Select
          onValueChange={(value) => {
            console.log("Applying provincia filter:", value)
            refineProvincia(value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas las provincias" />
          </SelectTrigger>
          <SelectContent>
            {provinciaItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label} ({item.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterPanel>

      <FilterPanel title="Fase Legal">
        <Select
          onValueChange={(value) => {
            console.log("Applying legal phase filter:", value)
            refineLegalPhase(value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas las fases" />
          </SelectTrigger>
          <SelectContent>
            {legalPhaseItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label} ({item.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterPanel>

      <FilterPanel title="Precio (€)">
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder={`Mínimo (${formatCurrency(range.min)})`}
            type="number"
            onChange={(e) => {
              console.log("Applying min price filter:", e.target.value)
              refinePrice([Number(e.target.value), start[1] ?? range.max])
            }}
          />
          <Input
            placeholder={`Máximo (${formatCurrency(range.max)})`}
            type="number"
            onChange={(e) => {
              console.log("Applying max price filter:", e.target.value)
              refinePrice([start[0] ?? range.min, Number(e.target.value)])
            }}
          />
        </div>
      </FilterPanel>

      <FilterPanel title="Superficie (m²)">
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder={`Mínimo (${rangeSqm.min})`}
            type="number"
            onChange={(e) => refineSqm([Number(e.target.value), startSqm[1] ?? rangeSqm.max])}
            onChange={(e) => {
              console.log("Applying min sqm filter:", e.target.value)
              refineSqm([Number(e.target.value), startSqm[1] ?? rangeSqm.max])
            }}
          />
          <Input
            placeholder={`Máximo (${rangeSqm.max})`}
            type="number"
            onChange={(e) => {
              console.log("Applying max sqm filter:", e.target.value)
              refineSqm([startSqm[0] ?? rangeSqm.min, Number(e.target.value)])
            }}
          />
        </div>
      </FilterPanel>

      <FilterPanel title="Habitaciones">
        <div className="flex space-x-2">
          {roomItems.map((item) => (
            <Button
              key={item.value}
              variant={item.isRefined ? "default" : "outline"}
              className="flex-1"
              onClick={() => {
                console.log("Applying rooms filter:", item.value)
                refineRooms(item.value)
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </FilterPanel>
    </div>
  )
}

function formatCurrency(value?: number) {
  if (value === undefined) return ""
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
}
