import { useRef, useState } from 'react'

import { BuilderComponent, builder } from '@builder.io/react'
import { Add, ExpandLess, ExpandMore } from '@mui/icons-material'
import { Box, Button } from '@mui/material'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  InstantSearch,
  Hits,
  Pagination,
  Configure,
  DynamicWidgets,
  useClearRefinements,
  useCurrentRefinements,
} from 'react-instantsearch-hooks-web'

import { PLPStyles } from '@/components/page-templates/ProductListingTemplate/ProductListingTemplate.styles'
import { ProductHit } from '@/components/product'
import CustomRefinementList from '@/components/product/AlgoliaFacets/CustomRefinementList'
import DesktopRefinement from '@/components/product/AlgoliaFacets/DesktopRefinment'
import { productIndex, searchClient } from '@/lib/api/util/algolia'
import { getFacetLabel } from '@/lib/helpers/facetMapping'
import type { MetaData, PageWithMetaData } from '@/lib/types'

import type { GetStaticPropsContext, GetStaticPropsResult, NextPage } from 'next'

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

const CategoryPage: NextPage<CategoryPageType> = (props) => {
  const router = useRouter()
  const { t } = useTranslation('common')

  const [expandedFacets, setExpandedFacets] = useState<{ [key: string]: boolean }>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { publicRuntimeConfig } = getConfig()
  const { categoryCode } = router.query
  const code = props.categoryCode || categoryCode

  const algoliaFacets = props?.facets
  const facetKeys = Object.keys(algoliaFacets || {})
  const expandedFacetsRef = useRef<{ [key: string]: boolean }>({})
  const [, forceUpdate] = useState(0) // manual trigger

  const toggleFacet = (attribute: string) => {
    expandedFacetsRef.current[attribute] = !expandedFacetsRef.current[attribute]
    forceUpdate((n) => n + 1) // force re-render
  }

  const onFilterByClose = () => {
    setIsFilterOpen(false)
    const resultsSection = document.getElementById('productHitsView')
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
    <>
      <BuilderComponent
        model={publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection}
        content={props.section}
      />

      <InstantSearch searchClient={searchClient} indexName="products">
        <Configure {...({ hitsPerPage: 12, filters: `category_pages:${code}` } as any)} />
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

        <div style={{ display: 'flex', fontSize: '16px', fontFamily: 'Poppins' }}>
          {/* Left Column – Filters */}

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

          {/* Right Column – Results */}
          <div style={{ flex: 1, padding: '20px' }} id="productHitsView">
            <h1>Category: {categoryCode}</h1>
            <DesktopRefinement />
            <div>
              {/* <button
                  onClick={() => setViewMode('list')}
                  disabled={viewMode === 'list'}
                  style={{ marginRight: 8 }}
                >
                  Grid
                </button>
                <button onClick={() => setViewMode('grid')} disabled={viewMode === 'grid'}>
                  List
                </button> */}
            </div>
            <div>
              <Hits hitComponent={ProductHit} />
            </div>

            <Pagination />
          </div>
        </div>
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
