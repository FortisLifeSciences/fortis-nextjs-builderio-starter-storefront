import algoliasearch from 'algoliasearch'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

// Replace with your Algolia credentials from .env.local
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || publicRuntimeConfig?.ALGOLIA_APP_ID
const ALGOLIA_SEARCH_KEY =
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || publicRuntimeConfig?.ALGOLIA_SEARCH_KEY
const ALGOLIA_INDEX_NAME = 'products'

// Initialize the Algolia client
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)
const productIndex = searchClient.initIndex(ALGOLIA_INDEX_NAME)

// Fallback list of searchable attributes
export const getStaticSearchableFacets = (): string[] => {
  return ['conjugate', 'host', 'reactivity']
}

export { productIndex, searchClient }
