"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSearchSuggestions } from "@/lib/algolia"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  placeholder?: string
  initialQuery?: string
  onSearch?: (query: string) => void
  variant?: "default" | "minimal"
}

export function SearchBar({
  className,
  placeholder = "Buscar activos inmobiliarios...",
  initialQuery = "",
  onSearch,
  variant = "default",
}: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Handle outside clicks to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)
      try {
        const results = await getSearchSuggestions(query)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      // Always redirect to the search page with the query
      const searchUrl = `/search?q=${encodeURIComponent(trimmedQuery)}`
      router.push(searchUrl)
    } else {
      // If empty query, go to search page without query
      router.push("/search")
    }
    setShowSuggestions(false)

    // Call onSearch callback if provided
    if (onSearch) {
      onSearch(trimmedQuery)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(query)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  const clearSearch = () => {
    setQuery("")
    setSuggestions([])
    if (onSearch) {
      onSearch("")
    }
  }

  return (
    <div
      ref={searchRef}
      className={cn("relative mx-auto", variant === "default" ? "w-full max-w-2xl" : "w-full", className)}
    >
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-9 h-20 text-xl w-full max-w-6xl",
            query && "pr-9",
            variant === "default" ? "rounded-md" : "rounded-sm",
          )}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 h-full px-3 py-2 text-muted-foreground"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpiar búsqueda</span>
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute mt-1 w-full rounded-md border bg-background shadow-lg z-50">
          <ul className="py-1">
            {isLoading && <li className="px-4 py-2 text-muted-foreground text-sm">Buscando sugerencias...</li>}
            {!isLoading && suggestions.length === 0 && query.length >= 2 && (
              <li className="px-4 py-2 text-muted-foreground text-sm">No se encontraron sugerencias</li>
            )}
            {!isLoading &&
              suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="cursor-pointer px-4 py-2 hover:bg-muted"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
