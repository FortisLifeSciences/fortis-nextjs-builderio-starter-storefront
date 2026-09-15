import { useEffect, useState } from 'react'

import { BuilderComponent, builder } from '@builder.io/react'
import { setPixelProperties } from '@builder.io/utils'
import '@builder.io/widgets'
import { Add, Apps, ReorderRounded } from '@mui/icons-material'
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
import { CircularProgress } from '@mui/material'
import { liteClient as algoliasearch } from 'algoliasearch/lite'
import 'swiper/css'
import 'swiper/css/navigation'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { FullWidthDivider } from '@/components/common'
import KiboBreadcrumbs from '@/components/core/Breadcrumbs/KiboBreadcrumbs'
import ResourceSearchSliders from '@/components/layout/Algolia/ResourceSearchSliders'
import { PLPStyles } from '@/components/page-templates/ProductListingTemplate/ProductListingTemplate.styles'
import { ProductHitListView, ProductHitGridView } from '@/components/product'
import AlgoliaPagination from '@/components/product/AlgoliaFacets/AlgoliaPagination'
import ManualFacetBlock from '@/components/product/AlgoliaFacets/ManualFacetBlock'
import ManualFilterControls from '@/components/product/AlgoliaFacets/ManualFilterControls'
import ManualSortDropdown from '@/components/product/AlgoliaFacets/SearchSortDropdown'
import SelectedFiltersChips from '@/components/product/AlgoliaFacets/SelectedFiltersChips'
import { useGetSearchedProducts } from '@/hooks'
import { productSearch } from '@/lib/api/operations'
import { hasAnalyticsConsent } from '@/lib/consent/consent'
import type { CategorySearchParams, MetaData, PageWithMetaData } from '@/lib/types'

import type { ProductSearchResult } from '@/lib/gql/types'
import type { SearchResponse } from '@algolia/client-search'
import type { NextPage, GetServerSidePropsContext, GetServerSideProps, NextApiRequest } from 'next'

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || publicRuntimeConfig?.ALGOLIA_APP_ID
const ALGOLIA_SEARCH_KEY =
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || publicRuntimeConfig?.ALGOLIA_SEARCH_KEY
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)

const HITS_PER_PAGE = 15
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
  results?: ProductSearchResult
  page?: any
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
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  /*const response = await productSearch(
    {
      pageSize: publicRuntimeConfig.productListing.pageSize,
      ...context.query,
    } as CategorySearchParams,
    context.req as NextApiRequest
  )*/
  const { locale } = context

  const page = await builder
    .get(publicRuntimeConfig?.builderIO?.modelKeys?.emptyProductSearchResults, {
      userAttributes: {
        urlPath: `/search`,
      },
    })
    .toPromise()
  if (page) setPixelProperties(page, { alt: '' })

  return {
    props: {
      //results: response?.data?.products || [],
      page: page || null,
      metaData: getMetaData(),
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const SearchPage: NextPage<SearchPageType> = (props) => {
  const { page } = props
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
  //console.log('searchQuery:', searchQuery)
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

  const breadcrumbs = [
    { text: 'Home', link: '/' },
    { text: 'Search Results', link: router.asPath },
  ]
  // Scroll to results when pagination changes
  const handlePaginationClick = () => {
    const container = document.querySelector('.searchProductsTitle')
    if (container) {
      container.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [orderedFacets, setOrderedFacets] = useState<string[]>([])
  const [availableFacets, setAvailableFacets] = useState<Record<string, Record<string, number>>>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (searchQuery) {
      //const query = Array.isArray(searchQuery) ? searchQuery.join(' ') : searchQuery
      //updated for algolia version update -WEB-1657
      // Truncate to 512 bytes max
      const rawQuery = Array.isArray(searchQuery)
        ? searchQuery.join(' ')
        : String(searchQuery || '')
      const query = rawQuery.slice(0, 512)

      const filters = Object.entries(selectedFilters)
        .filter(([_, values]) => values.length > 0) // Skip empty selections
        .map(([facet, values]) => values.map((v) => `${facet}:"${v}"`).join(' OR '))
        .join(' AND ')

      /* searchClient
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
              hitsPerPage: 15,
              page: pagination.productsPage, // ← add page here
              facets: ['*'],
              filters,
              clickAnalytics: true, // Enable click analytics
            },
          },
        ])*/
      //upodated for algolia version update -WEB-1657
      searchClient
        .search({
          requests: [
            {
              indexName: 'builder-page',
              query,
              clickAnalytics: true,
            },
            {
              indexName: sortIndex,
              query,
              hitsPerPage: HITS_PER_PAGE,
              page: pagination.productsPage,
              facets: ['*'],
              filters,
              clickAnalytics: true,
            },
          ],
        })
        .then((res) => {
          //console.log('Manual multi-index search results:', res)
          const filteredResults = res.results.filter(
            (result) => (result as SearchResponse<unknown>).hits !== undefined
          )

          //updated for algolia version update -WEB-1657

          const facets = (res.results[1] as any)?.facets
          const facetOrdering =
            (res.results[1] as any)?.renderingContent?.facetOrdering?.facets?.order || []

          const ordered = facetOrdering.filter((facet: string) => facets?.[facet])
          setOrderedFacets(ordered)
          setAvailableFacets(facets || {})
          setManualSearchResults(filteredResults as SearchResponse<unknown>[])
          setLoading(false)
        })
        .catch((err) => {
          console.error('Search error:', err)
        })
    } else {
      setManualSearchResults(null)
      setLoading(false)
    }
  }, [searchQuery, sortIndex, pagination.productsPage, selectedFilters])

  const trackViewedFilters = (filters: Record<string, string[]>) => {
    const filterList = Object.entries(filters).flatMap(([facet, values]) =>
      values.map((v) => `${facet}:${v}`)
    )

    //console.log('trackViewedFilters:', filterList)

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'Algolia Filter View',
      algoliaFilters: filterList,
      algoliaIndex: sortIndex,
    })

    // Optional: Algolia insights (uncomment if needed)
    /*
    if (filterList.length > 0) {
      aa('viewedFilters', {
        eventName: 'Filters Applied',
        index: 'products',
        filters: filterList,
      })
    }
    */
  }

  const handleFilterChange = (facet: string, value: string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev }
      if (newFilters[facet]) {
        if (newFilters[facet].includes(value)) {
          newFilters[facet] = newFilters[facet].filter((v) => v !== value)
        } else {
          newFilters[facet].push(value)
        }
      } else {
        newFilters[facet] = [value]
      }
      trackViewedFilters(newFilters)
      return newFilters
    })
  }

  const handleRemoveFilter = (facet: string, value: string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev }
      newFilters[facet] = newFilters[facet].filter((v) => v !== value)
      if (newFilters[facet].length === 0) {
        delete newFilters[facet]
      }
      trackViewedFilters(newFilters)
      return newFilters
    })
  }

  const handleClearAllFilters = () => {
    setSelectedFilters({})
    trackViewedFilters({})
  }

  const onFilterByClose = () => {
    setIsFilterOpen(false)
    const resultsSection = document.getElementById('search-listing-section')
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (!manualSearchResults) return

    const dataLayer = (window as any).dataLayer
    if (!dataLayer) return

    manualSearchResults.forEach((result) => {
      const objectIDs = (result.hits || []).map((hit: any) => hit.objectID)
      if (objectIDs.length === 0) return

      const cappedObjectIDs = objectIDs.slice(0, 20)

      const existingEvent = dataLayer.find(
        (item: any) =>
          item.event === 'Hits Viewed' &&
          item.algoliaIndex === result.index &&
          JSON.stringify(item.algoliaObjectIds) === JSON.stringify(cappedObjectIDs)
      )
      if (!existingEvent) {
        dataLayer.push({
          event: 'Hits Viewed',
          algoliaObjectIds: cappedObjectIDs,
          algoliaIndex: result.index,
          queryID: result.queryID,
        })
      }
    })
  }, [manualSearchResults])

  return (
    <>
      <KiboBreadcrumbs breadcrumbs={breadcrumbs} />

      {/* Manual Search Results Display */}
      {loading === true ? (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}
        >
          <CircularProgress />
        </Box>
      ) : manualSearchResults === null ? (
        <div>
          <h1 className="searchProductsTitle">
            {`Search Input Box is empty. Please enter a search term.`}
          </h1>
          <BuilderComponent
            model={publicRuntimeConfig?.builderIO?.modelKeys?.emptyProductSearchResults}
            content={page}
          />
        </div>
      ) : (
        manualSearchResults.map((result, index) => {
          if (result.index === 'builder-page') {
            const storedContentQueryId = localStorage.getItem('algoliaContentQueryId')
            if (!storedContentQueryId || storedContentQueryId !== result.queryID) {
              localStorage.setItem('algoliaContentQueryId', result.queryID || '')
            }
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

          //setting queryID for to use different places
          if (hasAnalyticsConsent()) {
            const algoliaQueryId = localStorage.getItem('algoliaQueryId')
            if (!algoliaQueryId || algoliaQueryId !== result.queryID) {
              localStorage.setItem('algoliaQueryId', result.queryID || '')
            }
          }

          return (
            <>
              {/* Search summary title */}
              {(result.nbHits ?? 0) > 0 ? (
                <>
                  <h1 className="searchProductsTitle">
                    {`${result.nbHits} Products for "${result.query}"`}
                  </h1>

                  <div className="searchListingContainer">
                    <Box
                      className="FacetSection"
                      id="facetView"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column', // Make vertical layout
                        width: {
                          xs: isFilterOpen ? '100%' : '0',
                          sm: '20%',
                        },
                        padding: {
                          xs: '0',
                          sm: '20px 0',
                        },
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        backgroundColor: {
                          xs: '#fff',
                          sm: 'transparent',
                        },
                        position: {
                          xs: 'absolute',
                          sm: 'static',
                        },
                        zIndex: {
                          xs: 1200,
                          sm: 'auto',
                        },
                        height: {
                          xs: 'auto',
                          sm: 'auto',
                        },
                        boxShadow: {
                          xs: isFilterOpen ? 3 : 0,
                          sm: 0,
                        },
                        ...PLPStyles.FacetSection,
                      }}
                    >
                      {!isMobile && (
                        <ManualFacetBlock
                          facets={orderedFacets}
                          facetValues={availableFacets}
                          selectedFilters={selectedFilters}
                          onFilterChange={handleFilterChange}
                        />
                      )}
                      {isMobile && (
                        <Box sx={{ display: { md: 'none' } }}>
                          <Box sx={{ ...PLPStyles.navBarMainMobile }}>
                            <Button
                              variant="contained"
                              color="secondary"
                              sx={{ textTransform: 'capitalize' }}
                              onClick={onFilterByClose}
                            >
                              Hide Filters
                            </Button>
                            <Box sx={{ ...PLPStyles.upperTotal }}>
                              {t('no-of-products', { count: result?.nbHits ?? 0 })}
                            </Box>
                          </Box>
                          <FullWidthDivider />
                          <ManualFacetBlock
                            facets={orderedFacets} // This is an array like ['brand', 'category']
                            facetValues={availableFacets} // This is the object with counts
                            selectedFilters={selectedFilters}
                            onFilterChange={handleFilterChange}
                          />
                          {isFilterOpen && (
                            <Box sx={{ mt: 'auto', ...PLPStyles.filterByMobileButtons }}>
                              <ManualFilterControls
                                onClear={handleClearAllFilters}
                                onClose={onFilterByClose}
                                disabled={Object.keys(selectedFilters).length === 0}
                              />
                            </Box>
                          )}
                          <Box sx={{ ...PLPStyles.lowerTotal }}>
                            {result?.nbHits && (
                              <Box>{t('results', { count: result?.nbHits ?? 0 })}</Box>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>

                    <Box
                      className="rightSearchContainer"
                      id="search-listing-section"
                      sx={{
                        display: {
                          xs: isFilterOpen ? 'none' : 'block',
                          md: 'block',
                        },
                        padding: {
                          xs: '0',
                          md: '2px 0px 20px 20px',
                        },
                      }}
                    >
                      {/* List and grid View */}

                      {/* toggle grid and list view */}

                      <div className="gridListViewContainer">
                        <Box sx={{ ...PLPStyles.navBarMain }}>
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
                                <Apps
                                  fontSize="medium"
                                  {...(!isListView && { color: 'primary' })}
                                />
                              </Box>
                            </Box>
                          )}
                          {/* Custom sort for search start */}
                          <Box sx={{ ...PLPStyles.navBarSort }}>
                            <Box sx={{ ...PLPStyles.sorting }}>
                              <ManualSortDropdown
                                sortIndex={sortIndex}
                                onChangeSort={setSortIndex}
                              />
                            </Box>
                            <Box sx={{ ...PLPStyles.filterBy }}>
                              <Button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                variant="outlined"
                                endIcon={<Add fontSize="small" />}
                                sx={{ ...PLPStyles.filterByButton }}
                              >
                                Filter By
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                        {/* Custom sort for search end */}
                      </div>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', margin: '1rem 0 0 1rem' }}>
                          <SelectedFiltersChips
                            selectedFilters={selectedFilters}
                            onFilterRemove={handleRemoveFilter}
                            onClearAll={handleClearAllFilters}
                          />
                        </Box>
                        <Box sx={{ ...PLPStyles.totalResults }} pb={1}>
                          {t('no-of-products', { count: result?.nbHits ?? 0 })}
                        </Box>
                      </Box>
                      <Box
                        className={
                          isMobile
                            ? 'product-grid-view'
                            : isListView
                            ? 'product-list-view'
                            : 'product-grid-view'
                        }
                      >
                        <div className="productviewstructure">
                          {result.hits.slice(0, 16).map((hit: any, i: number) => (
                            <div
                              className="productviewlistItem"
                              key={i}
                              data-insights-index={result?.index}
                            >
                              {isMobile ? (
                                <ProductHitGridView
                                  hit={hit}
                                  position={pagination.productsPage * HITS_PER_PAGE + i + 1}
                                  algoliaIndex={result?.index}
                                  queryId={result?.queryID ?? ''}
                                  dataInsideMethod={'clickedObjectIDsAfterSearch'}
                                />
                              ) : isListView ? (
                                <ProductHitListView
                                  hit={hit}
                                  position={pagination.productsPage * HITS_PER_PAGE + i + 1}
                                  algoliaIndex={result?.index}
                                  queryId={result?.queryID ?? ''}
                                  dataInsideMethod={'clickedObjectIDsAfterSearch'}
                                />
                              ) : (
                                <ProductHitGridView
                                  hit={hit}
                                  position={pagination.productsPage * HITS_PER_PAGE + i + 1}
                                  algoliaIndex={result?.index}
                                  queryId={result?.queryID ?? ''}
                                  dataInsideMethod={'clickedObjectIDsAfterSearch'}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </Box>
                      {/* pagination */}
                      <AlgoliaPagination
                        currentPage={result.page ?? 0}
                        totalPages={result.nbPages ?? 0}
                        onPageChange={(page) => {
                          setPagination((prev) => ({ ...prev, productsPage: page }))
                          handlePaginationClick() // scroll to rightSearchContainer
                        }}
                      />
                      {/* pagination end */}
                    </Box>
                  </div>
                </>
              ) : (
                <Box>
                  <h1 className="searchProductsTitle">
                    {`${result.nbHits ?? 0} Products for "${result.query ?? ''}"`}
                  </h1>
                  <BuilderComponent
                    model={publicRuntimeConfig?.builderIO?.modelKeys?.emptyProductSearchResults}
                    content={page}
                  />
                </Box>
              )}
            </>
          )
        })
      )}
    </>
  )
}
export default SearchPage
