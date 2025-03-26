import algoliasearch from 'algoliasearch/lite'
import { AnyCnameRecord } from 'node:dns'

// Replace with your Algolia credentials
const ALGOLIA_APP_ID = 'YQAIETZ5F1'
const ALGOLIA_SEARCH_KEY = 'c2cc99ace97599deaf1606dba442f9ae'
//console.log('ALGOLIA_APP_ID', ALGOLIA_APP_ID)

// Initialize the Algolia search client
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)

// Define multiple index names
const ALGOLIA_INDEXES = ['builder-page', 'products', 'products_query_suggestions'] // Add as many indexes as needed
//console.log('Algolia Indexes', ALGOLIA_INDEXES)

// Function to fetch results from multiple indexes
export const fetchAlgoliaResults = async (query: any) => {
  //console.log('query', query)
  try {
    // Create search requests for all indexes
    const searchRequests = ALGOLIA_INDEXES.map((indexName) => ({
      indexName,
      query, // Dynamic query term
      params: {
        hitsPerPage: 4, // Fetch 50 results per index (adjust as needed)
        page: 0, // Start from the first page
      },
    }))

    const { results } = await searchClient.search(searchRequests)

    //console.log('Main Results:', results)

    // Extract hits from each index
    const allHits = results.map((result: any) => ({
      //indexName: ALGOLIA_INDEXES[index], // Keep track of index name
      //hits: result.hits || [],
      resultsData: result,
    }))

    allHits.forEach(({ resultsData }) => {
      //console.log(`Results from ${resultsData.index}:`)

      resultsData.hits.forEach((hit: any) => {
        if (resultsData.index === 'products') {
          //console.log(typeof hit.nbHits)
          if (hit.slice_product) {
            // console.log('*** Brand:', hit.brand)
            // console.log('Product Name Variant:', hit.product_name_variant)
            // console.log('SKU:', hit.sku)
            // console.log('URL:', hit.product_url)
            // console.log('new Product:', hit.new_product)
          } else {
            // console.log('*** Brand:', hit.brand)
            // console.log('PLP Catalog Number:', hit.plp_catalog_number)
            // console.log('Product Name:', hit.product_name)
            // console.log('URL:', hit.product_url)
            // console.log('new Product:', hit.new_product)
          }
        } else {
          //console.log('Hit:', hit) // Default case for other indexes
        }
      })
    })

    return allHits // Return results grouped by index
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}
