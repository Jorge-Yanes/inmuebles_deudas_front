"use client";
import { InstantSearch, SearchBox, Hits, Stats } from "react-instantsearch-hooks-web";
import { searchClient, ALGOLIA_INDEX_NAME } from "@/lib/algolia";

export default function Demo() {
  return (
    <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
      <SearchBox placeholder="Busca Sevilla" />
      <Stats />
      <Hits hitComponent={({ hit }) => (
        <article className="border p-2">{hit.title}</article>
      )} />
    </InstantSearch>
  );
}