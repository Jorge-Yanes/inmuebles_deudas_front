"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSearchSuggestions } from "@/hooks/use-search-suggestions"
import { cn } from "@/lib/utils"

interface EnhancedSearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  filters: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
  onToggleFilters: () => void
  showFilters: boolean
  placeholder?: string
  className?: string
}

export function EnhancedSearchBar({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onToggleFilters,
  showFilters,
  placeholder = "Buscar propiedades por ubicación, tipo, características...",
  className,
}: EnhancedSearchBarProps) {
  const [focused, setFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { suggestions, loading } = useSearchSuggestions(query)

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    onQueryChange(value)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const clearQuery = () => {
    onQueryChange("")
    inputRef.current?.focus()
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setFocused(true)
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          onBlur={() => setFocused(false)}
          className="pl-10 pr-20 h-12 text-base"
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button variant="ghost" size="sm" onClick={clearQuery} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={onToggleFilters}
            className="h-8 px-3"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (focused || suggestions.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {loading && <div className="p-3 text-sm text-muted-foreground">Buscando sugerencias...</div>}

          {!loading && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-3 text-sm text-muted-foreground">No se encontraron sugerencias</div>
          )}

          {!loading &&
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Search className="inline h-3 w-3 mr-2 text-muted-foreground" />
                {suggestion}
              </button>
            ))}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null

            return (
              <Badge key={key} variant="secondary" className="text-xs">
                {key}: {String(value)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => onFiltersChange({ ...filters, [key]: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
