import React, { useState, useEffect, useRef, PropsWithChildren, useCallback } from 'react'

import { BuilderComponent, builder } from '@builder.io/react'
import { Add, ExpandLess, ExpandMore } from '@mui/icons-material'
import Apps from '@mui/icons-material/Apps'
import ReorderRounded from '@mui/icons-material/ReorderRounded'
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
import algoliasearch from 'algoliasearch'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  InstantSearch,
  SearchBox,
  RefinementList,
  useInfiniteHits,
  useConfigure,
  DynamicWidgets,
  useClearRefinements,
  useCurrentRefinements,
  Hits,
} from 'react-instantsearch-hooks-web'

import { PLPStyles } from '@/components/page-templates/ProductListingTemplate/ProductListingTemplate.styles'
import { ProductHitListView, ProductHitGridView } from '@/components/product'
import CustomRefinementList from '@/components/product/AlgoliaFacets/CustomRefinementList'
import DesktopRefinement from '@/components/product/AlgoliaFacets/DesktopRefinment'
import { productIndex, searchClient } from '@/lib/api/util/algolia'
import { getFacetLabel } from '@/lib/helpers/facetMapping'
import type { MetaData, PageWithMetaData } from '@/lib/types'

import type { BaseHit } from 'instantsearch.js'
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from 'next'

interface CategoryPageType extends PageWithMetaData {
  seoFriendlyUrl?: string
  categoryCode?: string
  section?: any
  facets: Record<string, any>
}

interface RefinementListItem {
  label: string
  value: string
  count: number
  isRefined: boolean
}

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)

function getMetaData(data: any): MetaData {
  return {
    title: data?.title || null,
    description: data?.description || null,
    keywords: data?.metaTagKeywords || null,
    canonicalUrl: null,
    robots: null,
  }
}

export async function getStaticPaths() {
  const response = await productIndex.search('', {
    facets: ['category_pages'],
  })

  const categories = response?.facets?.category_pages

  const paths = categories
    ? Object.keys(categories).map((categoryCode) => ({
        params: { categoryCode },
      }))
    : []

  return { paths, fallback: 'blocking' }
}

export async function getStaticProps(
  context: GetStaticPropsContext
): Promise<GetStaticPropsResult<CategoryPageType>> {
  const { locale, params } = context
  const { publicRuntimeConfig } = getConfig()
  const { categoryCode } = params as { categoryCode: string }
  const categoryTopSection = publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection || ''
  const builderSection = await builder
    .get(categoryTopSection, {
      userAttributes: { slug: `category-${categoryCode}`, urlPath: `/products/${categoryCode}` },
    })
    .promise()
  const { hits: products, facets } = await productIndex.search('', {
    filters: `category_pages:${categoryCode}`,
    facets: ['*'],
  })

  return {
    props: {
      categoryCode,
      metaData: getMetaData(builderSection?.data),
      section: builderSection || null,
      ...(await serverSideTranslations(locale as string, ['common'])),
      facets,
    } as CategoryPageType,
    revalidate: 60,
  }
}

const MyHitsComponent = ({ categoryCode, facets }: { categoryCode: string; facets: any }) => {
  const infiniteHits = useInfiniteHits<BaseHit>(),
    hits = infiniteHits.hits,
    results = infiniteHits.results,
    isLast = (infiniteHits as any).isLast,
    showMore = (infiniteHits as any).showMore,
    isMobile = useMediaQuery('(max-width:600px)')
  const [isListView, setIsListView] = useState<boolean>(true)
  const { t } = useTranslation('common')

  // const [expandedFacets, setExpandedFacets] = useState<{ [key: string]: boolean }>({})
  // const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { publicRuntimeConfig } = getConfig()
  const algoliaFacets = facets
  const facetKeys = Object.keys(algoliaFacets || {})
  const expandedFacetsRef = useRef<{ [key: string]: boolean }>({})
  const [, forceUpdate] = useState(0) // manual trigger

  useConfigure({
    hitsPerPage: 15,
    filters: `category_pages:${categoryCode}`,
  } as any)

  const handleLoadMore = useCallback(() => {
    if (!isLast) {
      showMore()
    }
  }, [isLast, showMore])

  const toggleFacet = (attribute: string) => {
    expandedFacetsRef.current[attribute] = !expandedFacetsRef.current[attribute]
    forceUpdate((n) => n + 1) // force re-render
  }

  const onFilterByClose = () => {
    setIsFilterOpen(false)
    const resultsSection = document.getElementById('product-listing-section')
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function FallbackComponent({ attribute }: { attribute: string }) {
    const isExpanded = !!expandedFacetsRef.current[attribute]

    return (
      <Box className="ais-Panel" style={{ cursor: 'pointer', borderBottom: '1px solid #000' }}>
        <Box
          className="ais-Panel-header"
          onClick={() => toggleFacet(attribute)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontWeight: 500,
            padding: '8px 0',
          }}
        >
          <span>{getFacetLabel(attribute)}</span>
          <span>{isExpanded ? <ExpandLess /> : <ExpandMore />}</span>
        </Box>

        {isExpanded && (
          <div className="ais-Panel-body" style={{ padding: '8px 0' }}>
            <CustomRefinementList attribute={attribute} />
          </div>
        )}
      </Box>
    )
  }

  return (
    <div style={{ display: isMobile ? 'block' : 'flex', fontSize: '16px', fontFamily: 'Poppins' }}>
      <Box
        sx={{
          display: {
            xs: 'block',
            sm: 'none',
          },
        }}
      >
        <Button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          variant="outlined"
          endIcon={<Add fontSize="small" />}
          sx={{ ...PLPStyles.filterByButton, width: '50%' }}
        >
          Filter By
        </Button>
      </Box>
      {/* Left Column – Filters */}
      {/* <div
        style={{
          width: isMobile ? '100%' : '250px',
          padding: '20px',
          borderRight: isMobile ? 'none' : '1px solid #ddd',
        }}
      > */}
      <Box
        className="FacetSection"
        id="facetView"
        sx={{
          display: 'flex',
          flexDirection: 'column', // Make vertical layout
          width: {
            xs: isFilterOpen ? '100%' : '0',
            sm: '17%',
          },
          padding: {
            xs: isFilterOpen ? '20px' : '0',
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
            xs: '100vh',
            sm: 'auto',
          },
          boxShadow: {
            xs: isFilterOpen ? 3 : 0,
            sm: 0,
          },
        }}
      >
        <Box sx={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          <Box>
            <DynamicWidgets fallbackComponent={FallbackComponent} />
          </Box>
        </Box>
        {isFilterOpen && (
          <Box sx={{ mt: 'auto' }}>
            <FilterControls onClose={onFilterByClose} />
          </Box>
        )}
      </Box>
      {/* </div> */}

      {/* Right Column – Results */}
      <Box sx={{ flex: 1, padding: '20px' }} id="productHitsView">
        <Box id="product-listing-section" sx={{ ...PLPStyles.plpGrid }}>
          <Box sx={{ ...PLPStyles.navBar }}>
            <Box sx={{ ...PLPStyles.navBarMain }}>
              <Box sx={{ ...PLPStyles.navBarView }}>
                <Box
                  onClick={() => setIsListView(true)}
                  title="List View"
                  sx={{ cursor: 'pointer' }}
                  tabIndex={0}
                >
                  <ReorderRounded fontSize="medium" {...(isListView && { color: 'primary' })} />
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

              <Box sx={{ ...PLPStyles.navBarSort }}>
                <Box sx={{ ...PLPStyles.filterBy }}></Box>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', margin: '1rem 0 0 1rem' }}>
              <DesktopRefinement />
            </Box>
            <Box sx={{ ...PLPStyles.totalResults }} pb={1}>
              {t('no-of-products', { count: results?.nbHits ?? 0 })}
            </Box>
          </Box>
          <Box className={isListView ? 'product-list-view' : 'product-grid-view'}>
            {/* {isMobile ? (
              <Grid container sx={{ flexWrap: 'wrap', rowGap: 2 }}>
                {hits.map((hit) => (
                  <Grid
                    key={hit.objectID}
                    item
                    display={'flex'}
                    justifyContent={'center'}
                    lg={isListView ? 12 : 4}
                    md={isListView ? 12 : 4}
                    sm={isListView ? 12 : 4}
                    xs={isListView ? 12 : 6}
                  >
                    <ProductHitGridView hit={hit as any} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container sx={{ flexWrap: 'wrap', rowGap: 2 }}>
                {hits.map((hit) =>
                  isListView ? (
                    <Grid
                      key={hit.objectID}
                      item
                      display={'flex'}
                      justifyContent={'center'}
                      lg={isListView ? 12 : 4}
                      md={isListView ? 12 : 4}
                      sm={isListView ? 12 : 4}
                      xs={isListView ? 12 : 6}
                    >
                      <ProductHitListView key={hit.objectID} hit={hit as any} />
                    </Grid>
                  ) : (
                    <Grid
                      key={hit.objectID}
                      item
                      display={'flex'}
                      justifyContent={'center'}
                      lg={isListView ? 12 : 4}
                      md={isListView ? 12 : 4}
                      sm={isListView ? 12 : 4}
                      xs={isListView ? 12 : 6}
                    >
                      <ProductHitGridView key={hit.objectID} hit={hit as any} />
                    </Grid>
                  )
                )}
              </Grid>
            )} */}

            {isMobile ? (
              <Hits hitComponent={ProductHitGridView} />
            ) : isListView ? (
              <Hits hitComponent={ProductHitListView} />
            ) : (
              <Hits hitComponent={ProductHitGridView} />
            )}
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
          <Box sx={{ ...PLPStyles.productResults, color: 'grey.900', margin: '56px 0 12px 0' }}>
            {t('products-to-show', {
              m: `${hits.length}`,
              n: `${results?.nbHits ?? 0}`,
            })}
          </Box>
          {!isLast && (
            <Box sx={{ ...PLPStyles.productResults }}>
              <Button
                onClick={handleLoadMore}
                id="show-more-button"
                sx={{ ...PLPStyles.showMoreButton }}
                variant="outlined"
              >
                {t('show-more')}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </div>
  )
}

const CategoryPage: NextPage<CategoryPageType> = (props) => {
  const router = useRouter()
  const { publicRuntimeConfig } = getConfig()
  const categoryCode = (props.categoryCode as string) || (router.query.categoryCode as string)
  const facets = props.facets

  return (
    <>
      <BuilderComponent
        model={publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection}
        content={props.section}
      />

      <InstantSearch searchClient={searchClient} indexName="products">
        <MyHitsComponent categoryCode={categoryCode} facets={facets} />
      </InstantSearch>
    </>
  )
}
// Create a subcomponent that uses the hooks
const FilterControls = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation('common')
  const { refine: clearFilters } = useClearRefinements()
  const { items: appliedFilters } = useCurrentRefinements()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: '1rem',
        borderTop: '1px solid #ddd',
        backgroundColor: '#fff',
      }}
    >
      <Button
        variant="contained"
        color="secondary"
        sx={{ textTransform: 'capitalize' }}
        disabled={appliedFilters.length === 0}
        onClick={() => clearFilters()}
      >
        {t('clear-all')}
      </Button>
      <Button
        variant="contained"
        color="primary"
        sx={{ textTransform: 'capitalize' }}
        onClick={onClose}
      >
        {t('view-results')}
      </Button>
    </Box>
  )
}

export default CategoryPage
