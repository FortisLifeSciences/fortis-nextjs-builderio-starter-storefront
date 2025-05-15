import React, { useState, useEffect, useRef, PropsWithChildren, useCallback } from 'react'

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
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import {
  useInfiniteHits,
  useConfigure,
  DynamicWidgets,
  useClearRefinements,
  useCurrentRefinements,
  Hits,
  Pagination,
} from 'react-instantsearch-hooks-web'

import { PLPStyles } from '@/components/page-templates/ProductListingTemplate/ProductListingTemplate.styles'
import { ResourceHitListView, ResourceHitGridView } from '@/components/product'
import CustomRefinementList from '@/components/product/AlgoliaFacets/CustomRefinementList'
import CustomSortBy from '@/components/product/AlgoliaFacets/CustomSortBy'
import DesktopRefinement from '@/components/product/AlgoliaFacets/DesktopRefinment'
import { getFacetLabel } from '@/lib/helpers/facetMapping'

import type { BaseHit } from 'instantsearch.js'

interface RefinementListItem {
  label: string
  value: string
  count: number
  isRefined: boolean
}

const ResourcesHitComponent = ({ categoryCode, facets }: { categoryCode: string; facets: any }) => {
  const infiniteHits = useInfiniteHits<BaseHit>(),
    results = infiniteHits.results,
    isMobile = useMediaQuery('(max-width:600px)')
  const [isListView, setIsListView] = useState<boolean>(true)
  const { t } = useTranslation('common')

  useEffect(() => {
    if (!isListView) {
      const syncHeights = () => {
        const elements = document.querySelectorAll('.resourceCardGrid')
        let maxHeight = 0

        elements.forEach((el) => {
          const element = el as HTMLElement
          element.style.height = 'auto'
          const height = element.offsetHeight
          maxHeight = Math.max(maxHeight, height)
        })

        elements.forEach((el) => {
          const element = el as HTMLElement
          element.style.height = `${maxHeight}px`
        })
      }

      // Wait for layout
      const raf = requestAnimationFrame(syncHeights)
      window.addEventListener('resize', syncHeights)

      return () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', syncHeights)
      }
    }
  }, [results, isListView])

  // const [expandedFacets, setExpandedFacets] = useState<{ [key: string]: boolean }>({})
  // const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { publicRuntimeConfig } = getConfig()
  const algoliaFacets = facets
  const facetKeys = Object.keys(algoliaFacets || {})
  const expandedFacetsRef = useRef<{ [key: string]: boolean }>({})
  const [, forceUpdate] = useState(0) // manual trigger

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
      <Box
        className="ais-Panel"
        style={{ cursor: 'pointer', borderBottom: '1px solid #000' }}
        sx={{ ...PLPStyles.Facetpanel }}
      >
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
            <CustomRefinementList attribute={attribute} searchableAttributes={[]} />
          </div>
        )}
      </Box>
    )
  }

  const handlePaginationClick = () => {
    const facetElement = document.querySelector('.FacetSection')
    if (facetElement) {
      facetElement.scrollIntoView({ behavior: 'smooth' })
    }
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
        {/* <Button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          variant="outlined"
          endIcon={<Add fontSize="small" />}
          sx={{ ...PLPStyles.filterByButton, width: '50%' }}
        >
          Filter By
        </Button> */}
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
            xs: '100vh',
            sm: 'auto',
          },
          boxShadow: {
            xs: isFilterOpen ? 3 : 0,
            sm: 0,
          },
          ...PLPStyles.FacetSection,
        }}
      >
        <Box
          sx={{ flex: 1, overflowY: 'auto', ...PLPStyles.FacetsContainer }}
          className="FacetsContainer"
        >
          <Box className="FacetsInnerContainer" sx={{ ...PLPStyles.FacetsInnerContainer }}>
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
      <Box sx={{ flex: 1, padding: { xs: '0', md: '20px 0 20px 20px' } }} id="productHitsView">
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
                <Box sx={{ ...PLPStyles.sorting, justifyContent: 'end' }}>
                  <Typography component="span" sx={{ ...PLPStyles.navBarLabel }}>
                    {t('sort')}
                  </Typography>
                  <CustomSortBy />
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
            {isMobile ? (
              <Hits hitComponent={ResourceHitGridView} />
            ) : isListView ? (
              <Hits hitComponent={ResourceHitListView} />
            ) : (
              <Hits hitComponent={ResourceHitGridView} />
            )}
          </Box>
        </Box>
        <Box className="AlgoliaPagination" sx={{ textAlign: 'center', marginTop: 2 }}>
          <Pagination onClick={handlePaginationClick} />
        </Box>
      </Box>
    </div>
  )
}

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

export default ResourcesHitComponent
