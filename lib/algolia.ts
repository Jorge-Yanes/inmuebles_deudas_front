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
