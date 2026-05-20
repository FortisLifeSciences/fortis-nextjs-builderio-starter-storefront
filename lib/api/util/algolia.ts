import { algoliasearch } from 'algoliasearch'
import { liteClient } from 'algoliasearch/lite'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || publicRuntimeConfig?.ALGOLIA_APP_ID
const ALGOLIA_SEARCH_KEY =
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || publicRuntimeConfig?.ALGOLIA_SEARCH_KEY
const ALGOLIA_INDEX_NAME = 'products'

// Initialize the Algolia client
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)

const instantSearchClient = liteClient(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)

/*const productIndex = searchClient.initIndex(ALGOLIA_INDEX_NAME)

// Fallback list of searchable attributes
export const getStaticSearchableFacets = (): string[] => {
  return ['conjugate', 'host', 'reactivity']
}*/

// v5 replacement for initIndex for WEB-1657
const productIndex = {
  search: (query: string, params?: Record<string, any>) =>
    searchClient.searchSingleIndex({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: { query, ...params },
    }),
  saveObjects: (objects: Record<string, any>[]) =>
    searchClient.saveObjects({ indexName: ALGOLIA_INDEX_NAME, objects }),
  getObject: (objectID: string) =>
    searchClient.getObject({ indexName: ALGOLIA_INDEX_NAME, objectID }),
}

// Fallback list of searchable attributes
export const getStaticSearchableFacets = (): string[] => {
  return ['conjugate', 'host', 'reactivity']
}

export { productIndex, searchClient, instantSearchClient }
