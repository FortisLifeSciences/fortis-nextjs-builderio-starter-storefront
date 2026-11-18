import React, { useState, useEffect } from 'react'

import { FilterList } from '@mui/icons-material'
import { Box, Button, IconButton, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
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
import { ResourceHitGridView } from '@/components/product'
import CustomRefinementList from '@/components/product/AlgoliaFacets/CustomRefinementList'
import CustomSortBy from '@/components/product/AlgoliaFacets/CustomSortBy'
import DesktopRefinement from '@/components/product/AlgoliaFacets/DesktopRefinment'
import { getFacetLabel } from '@/lib/helpers/facetMapping'

import type { BaseHit } from 'instantsearch.js'

const ResourcesHitComponent = ({ categoryCode }: { categoryCode: string }) => {
  const infiniteHits = useInfiniteHits<BaseHit>(),
    results = infiniteHits.results,
    theme = useTheme(),
    isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { t } = useTranslation('common')

  useEffect(() => {
    {
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
  }, [results])

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const onFilterByClose = () => {
    setIsFilterOpen(false)
    const resultsSection = document.getElementById('product-listing-section')
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function FallbackComponent({ attribute }: { attribute: string }) {
    return (
      <Box
        className="ais-Panel"
        sx={{ ...PLPStyles.Facetpanel, borderBottom: '1px solid #EAEAF1' }}
      >
        <Box className="ais-Panel-header" style={{ padding: '16px 0' }}>
          <span
            style={{
              fontFamily: 'Poppins',
              fontWeight: 800,
              fontSize: '12.5px',
              lineHeight: '20px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              verticalAlign: 'middle',
              color: '#1B1A24',
            }}
          >
            {getFacetLabel(attribute)}
          </span>
        </Box>

        <div className="ais-Panel-body" style={{ padding: '0px 0px 16px 0px' }}>
          <CustomRefinementList attribute={attribute} searchableAttributes={[]} />
        </div>
      </Box>
    )
  }

  const handlePaginationClick = () => {
    const facetElement = document.querySelector('.FacetSection')
    if (facetElement) {
      facetElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const sortingOptions = [
    { label: 'Newest', value: 'builder-page_newest-first' },
    { label: 'Oldest', value: 'builder-page_oldest-first' },
    { label: 'Alphabetical', value: 'builder-page_alpha' },
  ]

  return (
    <div style={{ display: isMobile ? 'block' : 'flex', fontSize: '16px', fontFamily: 'Poppins' }}>
      <Box
        sx={{
          display: {
            xs: 'block',
            md: 'none',
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
            md: '250px',
          },
          padding: {
            xs: '0',
            md: '20px 0',
          },
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          backgroundColor: {
            xs: '#fff',
            md: 'transparent',
          },
          position: {
            xs: 'absolute',
            md: 'static',
          },
          zIndex: {
            xs: 1200,
            md: 'auto',
          },
          height: {
            xs: '100vh',
            md: 'auto',
          },
          boxShadow: {
            xs: isFilterOpen ? 3 : 0,
            md: 0,
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
      <Box
        sx={{ flex: 1, padding: { xs: '20px 16px 0', md: '20px 0 20px 34px' }, minWidth: 0 }}
        id="productHitsView"
      >
        <Box id="product-listing-section" sx={{ ...PLPStyles.plpGrid }}>
          <Box sx={{ display: 'flex' }}>
            <DesktopRefinement />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 1,
            }}
          >
            <Box sx={{ ...PLPStyles.totalResults, marginTop: 0 }}>
              {results?.index === 'products'
                ? t('no-of-products', { count: results?.nbHits ?? 0 })
                : t('no-of-resources', { count: results?.nbHits ?? 0 })}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ ...PLPStyles.filterBy, minWidth: 'auto', marginTop: 0 }}>
                <IconButton
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  aria-label="Filter By"
                  title="Filter By"
                  sx={{
                    border: '1px solid #EAEAF1',
                    borderRadius: '9px',
                    width: '39px',
                    height: '39px',
                    color: '#1B1A24',
                    '&:hover': {
                      backgroundColor: '#F6F6FA',
                      borderColor: '#C9C7D6',
                    },
                  }}
                >
                  <FilterList fontSize="small" />
                </IconButton>
              </Box>
              <CustomSortBy items={sortingOptions} />
            </Box>
          </Box>
          <Box className="product-grid-view" sx={{ marginLeft: '0 !important', marginTop: '18px' }}>
            <Hits hitComponent={ResourceHitGridView} />
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
