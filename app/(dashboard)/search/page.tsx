"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  InstantSearch,
  useSearchBox,
  useHits,
  useInstantSearch,
} from "react-instantsearch-hooks-web";

import { searchClient, ALGOLIA_INDEX_NAME, getSearchSuggestions } from "@/lib/algolia";
import { AlgoliaSearchFilters } from "@/components/algolia/algolia-search-filters";
import { AssetList } from "@/components/asset-list";
import type { Asset } from "@/types/asset";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Página principal                                                          */
/* -------------------------------------------------------------------------- */
export default function SearchPage() {
  const params = useSearchParams();
  const initialQuery = params.get("q") ?? "";
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={ALGOLIA_INDEX_NAME}
      initialUiState={{ [ALGOLIA_INDEX_NAME]: { query: initialQuery } }}
      routing={false} // activa si quieres escribir en la URL
    >
      <SearchBoxWithSuggestions />

      <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
        {/* Filtros */}
        <aside
          className={`w-full shrink-0 border-r bg-background md:w-80 lg:w-96 ${
            filtersOpen ? "block" : "hidden md:block"
          }`}
        >
          <AlgoliaSearchFilters />
        </aside>

        {/* Resultados */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <HitsPanel />
        </main>
      </div>

      {/* Botón para abrir/cerrar filtros en mobile */}
      <Button
        onClick={() => setFiltersOpen((p) => !p)}
        className="fixed bottom-4 right-4 md:hidden z-50"
      >
        {filtersOpen ? <X className="h-4 w-4" /> : "Filtros"}
      </Button>
    </InstantSearch>
  );
}

/* -------------------------------------------------------------------------- */
/*  SearchBox con sugerencias                                                 */
/* -------------------------------------------------------------------------- */
function SearchBoxWithSuggestions() {
  const { query, refine, clear } = useSearchBox();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  /* Sincroniza la URL (shallow) */
  useEffect(() => {
    const path = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
    router.replace(path, { scroll: false });
  }, [query, router]);

  /* Petición de sugerencias */
  useEffect(() => {
    if (query.length <= 1) {
      setSuggestions([]);
      return;
    }
    getSearchSuggestions(query)
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, [query]);

  return (
    <div className="relative border-b p-4">
      <Input
        placeholder="Buscar dirección, municipio, provincia…"
        value={query}
        onChange={(e) => refine(e.target.value)}
        className="pr-8"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-6 top-1/2 -translate-y-1/2"
          onClick={() => {
            clear();
            setSuggestions([]);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Lista de sugerencias */}
      {suggestions.length > 0 && (
        <ul className="absolute left-0 top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow">
          {suggestions.map((sug, i) => (
            <li
              key={i}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                refine(sug);
                setSuggestions([]);
              }}
            >
              {sug}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panel de resultados (Hits)                                                */
/* -------------------------------------------------------------------------- */
function HitsPanel() {
  const { hits, results, status } = useHits<Asset>();
  const { indexUiState } = useInstantSearch();

  if (status === "loading") {
    return <div className="p-6">Cargando resultados…</div>;
  }

  if (results?.nbHits === 0) {
    return (
      <div className="p-6">
        No se encontraron resultados para “{indexUiState.query || ""}”.
      </div>
    );
  }

  return <AssetList assets={hits} />;
}