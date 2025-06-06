import algoliasearch from "algoliasearch/lite"

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY

if (!appId || !searchKey) {
  throw new Error("Algolia credentials are not set in the environment variables.")
}

export const searchClient = algoliasearch(appId, searchKey)

export const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "Algolia_Search_inmueblesMayo2"
export const ALGOLIA_INDEX_NAME_PRICE_ASC = `${ALGOLIA_INDEX_NAME}_price_asc`
export const ALGOLIA_INDEX_NAME_PRICE_DESC = `${ALGOLIA_INDEX_NAME}_price_desc`

/**
 * Devuelve hasta `hitsPerPage` sugerencias (atributo `title`) a partir de una query.
 */
export async function getSearchSuggestions(
  query: string,
  hitsPerPage = 5,
): Promise<string[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const index = searchClient.initIndex(ALGOLIA_INDEX_NAME);
  const res = await index.search<{ title?: string }>(trimmed, {
    hitsPerPage,
    attributesToRetrieve: ["title"],
  });

  // Titulos únicos, sin nulos
  return [...new Set(res.hits.map((h) => h.title).filter(Boolean) as string[])];
}