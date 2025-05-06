import { useEffect, useState } from 'react'

import { Apps, ReorderRounded } from '@mui/icons-material'
import {
  Grid,
  MenuItem,
  Box,
  Button,
  Link,
  Typography,
  Breadcrumbs,
  Stack,
  useMediaQuery,
} from '@mui/material'
import algoliasearch from 'algoliasearch/lite'
import 'swiper/css'
import 'swiper/css/navigation'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import KiboBreadcrumbs from '@/components/core/Breadcrumbs/KiboBreadcrumbs'
import ResourceSearchSliders from '@/components/layout/Algolia/ResourceSearchSliders'
import { ProductHitListView, ProductHitGridView } from '@/components/product'
import AlgoliaPagination from '@/components/product/AlgoliaFacets/AlgoliaPagination'
import ManualSortDropdown from '@/components/product/AlgoliaFacets/SearchSortDropdown'
import { useGetSearchedProducts } from '@/hooks'
import { productSearch } from '@/lib/api/operations'
import type { CategorySearchParams, MetaData, PageWithMetaData } from '@/lib/types'

import type { ProductSearchResult } from '@/lib/gql/types'
import type { SearchResponse } from '@algolia/client-search'
import type { NextPage, GetServerSidePropsContext, GetServerSideProps, NextApiRequest } from 'next'

const searchClient = algoliasearch('YQAIETZ5F1', 'c2cc99ace97599deaf1606dba442f9ae')
type BuilderPageHit = {
  objectID: string
  data?: {
    title?: string
    image?: string
    description?: string
    contentType?: string
    resourceType?: string
    resourceCategory?: string
  }
  meta?: {
    lastPreviewUrl?: string
  }
}
interface SearchPageType extends PageWithMetaData {
  results: ProductSearchResult
}
function getMetaData(): MetaData {
  return {
    title: 'Search Results',
    description: null,
    keywords: null,
    canonicalUrl: null,
    robots: 'noindex,nofollow',
  }
}
const { publicRuntimeConfig } = getConfig()
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const response = await productSearch(
    {
      pageSize: publicRuntimeConfig.productListing.pageSize,
      ...context.query,
    } as CategorySearchParams,
    context.req as NextApiRequest
  )
  const { locale } = context
  return {
    props: {
      results: response?.data?.products || [],
      metaData: getMetaData(),
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const SearchPage: NextPage<SearchPageType> = (props) => {
  const { t } = useTranslation('common')
  const router = useRouter()
  const sortFromQuery = typeof router.query.sort === 'string' ? router.query.sort : 'products'
  const [sortIndex, setSortIndex] = useState(sortFromQuery)
  const isMobile = useMediaQuery('(max-width:600px)')
  const [isListView, setIsListView] = useState(true)
  const [pagination, setPagination] = useState({
    productsPage: 0,
  })

  // 👇 Sync sortIndex with router.query.sort on every change
  useEffect(() => {
    const currentSort = typeof router.query.sort === 'string' ? router.query.sort : 'products'
    setSortIndex(currentSort)
  }, [router.query.sort])

  const [searchParams, setSearchParams] = useState<CategorySearchParams>(
    router.query as unknown as CategorySearchParams
  )
  const [manualSearchResults, setManualSearchResults] = useState<SearchResponse<unknown>[] | null>(
    null
  )
  const searchQuery = router?.query?.query || ''
  console.log('searchQuery:', searchQuery)
  useEffect(() => {
    if (!searchQuery && router.query.search && !router.query.query) {
      const { search, ...rest } = router.query
      router.replace({
        pathname: router.pathname,
        query: {
          ...rest,
          query: search,
        },
      })
    }
  }, [router.query, router])
  const { data: searchPageResults, isFetching } = useGetSearchedProducts(
    {
      ...searchParams,
      pageSize: searchParams.pageSize || publicRuntimeConfig.productListing.pageSize,
    },
    props.results
  )
  const breadcrumbs = [
    { text: 'Home', link: '/' },
    { text: 'Search Results', link: router.asPath },
  ]
  //const breadcrumbs = [{ text: 'Home > Search Results', link: '/' }]
  const searchPageHeading = searchQuery
    ? t('search-results', {
        m: `${searchPageResults?.totalCount || 0}`,
        n: `"${searchQuery}"`,
      })
    : breadcrumbs[breadcrumbs.length - 1].text
  useEffect(() => {
    if (searchQuery) {
      const query = Array.isArray(searchQuery) ? searchQuery.join(' ') : searchQuery
      searchClient
        .search([
          {
            indexName: 'builder-page',
            params: {
              query,
            },
          },
          {
            indexName: sortIndex,
            params: {
              query,
              hitsPerPage: 9,
              page: pagination.productsPage, // ← add page here
              facets: ['*'],
            },
          },
        ])
        .then((res) => {
          console.log('Manual multi-index search results:', res)
          const filteredResults = res.results.filter(
            (result) => (result as SearchResponse<unknown>).hits !== undefined
          )
          setManualSearchResults(filteredResults as SearchResponse<unknown>[])
        })
        .catch((err) => {
          console.error('Search error:', err)
        })
    } else {
      setManualSearchResults(null)
    }
  }, [searchQuery, sortIndex, pagination.productsPage])
  return (
    <>
      <KiboBreadcrumbs breadcrumbs={breadcrumbs} />

      {/* Manual Search Results Display */}
      {manualSearchResults === null ? (
        <p> Loading search results...</p>
      ) : (
        manualSearchResults.map((result, index) => {
          if (result.index === 'builder-page') {
            const hits = result.hits as BuilderPageHit[]
            const resourceHits = hits
              .filter((hit) => hit.data?.contentType === 'Resource')
              .slice(0, 10)
            const nonResourceHits = hits
              .filter((hit) => hit.data?.contentType !== 'Resource')
              .slice(0, 10)
            return (
              <ResourceSearchSliders
                key={index}
                nonResourceHits={nonResourceHits}
                resourceHits={resourceHits}
                query={result.query || ''}
                index={index}
              />
            )
          }
          return (
            <>
              {/* Search summary title */}
              <h1 className="searchProductsTitle">
                {`${result.nbHits} Products for "${result.query}"`}
              </h1>

              <div className="searchListingContainer">
                <div className="facetContainer"></div>

                <div className="rightSearchContainer" id="search-listing-section">
                  {/* List and grid View */}

                  {/* toggle grid and list view */}

                  <div className="gridListViewContainer">
                    {!isMobile && (
                      <Box
                        className="switchListAndGrid"
                        sx={{ display: 'flex', margin: '1rem 0 0 1rem' }}
                      >
                        <Box
                          onClick={() => setIsListView(true)}
                          title="List View"
                          sx={{ cursor: 'pointer' }}
                          tabIndex={0}
                        >
                          <ReorderRounded
                            fontSize="medium"
                            {...(isListView && { color: 'primary' })}
                          />
                        </Box>
                        <Box
                          onClick={() => setIsListView(false)}
                          title="Grid View"
                          sx={{ cursor: 'pointer' }}
                          tabIndex={0}
                        >
                          <Apps fontSize="medium" {...(!isListView && { color: 'primary' })} />
                        </Box>
                      </Box>
                    )}
                    {/* Custom sort for search start */}

                    <ManualSortDropdown sortIndex={sortIndex} onChangeSort={setSortIndex} />

                    {/* Custom sort for search end */}
                  </div>

                  <div className="AvailableProducts">{result.nbHits} Products</div>

                  <Box className={isListView ? 'product-list-view' : 'product-grid-view'}>
                    <div className="productviewstructure">
                      {result.hits.slice(0, 10).map((hit: any, i: number) => (
                        <div className="productviewlistItem" key={i}>
                          {isMobile ? (
                            <ProductHitGridView hit={hit} />
                          ) : isListView ? (
                            <ProductHitListView hit={hit} />
                          ) : (
                            <ProductHitGridView hit={hit} />
                          )}
                        </div>
                      ))}
                    </div>
                  </Box>
                  {/* pagination */}
                  <AlgoliaPagination
                    currentPage={result.page}
                    totalPages={result.nbPages}
                    onPageChange={(page) =>
                      setPagination((prev) => ({ ...prev, productsPage: page }))
                    }
                  />
                  {/* pagination end */}
                </div>
              </div>
            </>
          )
        })
      )}
    </>
  )
}
export default SearchPage
