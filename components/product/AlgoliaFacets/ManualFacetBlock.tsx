import React, { useState } from 'react'

import { Add, Remove, ExpandMore, ExpandLess, ArrowForwardIos } from '@mui/icons-material'
import {
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Button,
  useMediaQuery,
  Collapse,
  TextField,
  InputAdornment,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { PLPStyles } from '@/components/page-templates/ProductListingTemplate/ProductListingTemplate.styles'
import { getStaticSearchableFacets } from '@/lib/api/util/algolia'
import { getFacetLabel } from '@/lib/helpers/facetMapping'

interface ManualFacetBlockProps {
  facets: string[]
  facetValues: Record<string, Record<string, number>>
  selectedFilters: Record<string, string[]>
  onFilterChange: (facet: string, value: string) => void
}

const ManualFacetBlock = ({
  facets,
  facetValues,
  selectedFilters,
  onFilterChange,
}: ManualFacetBlockProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [expandedFacets, setExpandedFacets] = useState<Record<string, boolean>>({})
  const [showAllValues, setShowAllValues] = useState<Record<string, boolean>>({})
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})

  const searchableAttributes = getStaticSearchableFacets()

  const toggleSection = (facet: string) => {
    setExpandedFacets((prev) => ({
      ...prev,
      [facet]: !prev[facet],
    }))
  }

  const toggleShowAll = (facet: string) => {
    setShowAllValues((prev) => ({
      ...prev,
      [facet]: !prev[facet],
    }))
  }

  const handleSearchChange = (facet: string, value: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [facet]: value,
    }))
  }

  return (
    <Box>
      {facets.map((facet) => {
        const values = facetValues[facet] || {}
        const entries = Object.entries(values)
        const isSectionExpanded = expandedFacets[facet] ?? false
        const isShowAll = showAllValues[facet] ?? false
        const isSearchableFacet = isMobile && searchableAttributes.includes(facet)
        const searchQuery = searchQueries[facet] || ''

        const filteredEntries = isSearchableFacet
          ? entries.filter(([value]) => value.toLowerCase().includes(searchQuery.toLowerCase()))
          : entries

        const visibleEntries = isShowAll ? filteredEntries : filteredEntries.slice(0, 6)

        const showToggle = filteredEntries.length > 6

        return (
          <Box
            key={facet}
            style={{ cursor: 'pointer', borderBottom: '1px solid #000' }}
            sx={{ ...PLPStyles.Facetpanel }}
          >
            {/* Collapsible Header */}
            <Box
              display="flex"
              alignItems="center"
              className="ais-Panel-header"
              justifyContent="space-between"
              sx={{ cursor: 'pointer' }}
              onClick={() => toggleSection(facet)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontWeight: 500,
                padding: '8px 0',
              }}
            >
              <span>{getFacetLabel(facet)}</span>
              <span style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                {isSectionExpanded ? <ExpandLess /> : <ExpandMore />}
              </span>
            </Box>

            <Collapse in={isSectionExpanded} timeout="auto" unmountOnExit>
              {/* Search input for mobile searchable facets */}
              {isSearchableFacet && (
                <TextField
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(facet, e.target.value)}
                  placeholder="Begin typing..."
                  variant="standard"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <ArrowForwardIos fontSize="small" sx={{ color: 'rgb(90, 72, 251)' }} />
                      </InputAdornment>
                    ),
                    disableUnderline: true,
                    sx: {
                      borderBottom: '1px solid',
                      borderColor: 'rgb(90, 72, 251)',
                      paddingBottom: '4px',
                    },
                  }}
                  sx={{
                    marginBottom: '8px',
                    width: '100%',
                    '& input': {
                      padding: '0px 0px 8px 0px',
                      fontSize: '18px',
                      fontWeight: 500,
                      color: 'rgb(48, 41, 154)',
                      '&::placeholder': {
                        color: 'text.secondary',
                      },
                    },
                    '& .MuiInput-root': {
                      '&:before, &:after': {
                        display: 'none',
                      },
                      '&:hover:not(.Mui-disabled):before': {
                        display: 'none',
                      },
                    },
                  }}
                />
              )}

              {/* Facet Checkboxes */}
              {visibleEntries.map(([value, count]) => (
                <Box key={value} display="flex" alignItems="center" justifyContent="space-between">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedFilters[facet]?.includes(value) || false}
                        onChange={() => onFilterChange(facet, value)}
                        size="small"
                      />
                    }
                    label={value}
                    sx={{
                      width: '100%',
                      fontSize: theme.typography.body2.fontSize,
                      '& .MuiFormControlLabel-label': {
                        fontSize: '14px',
                        fontWeight: 300,
                      },
                    }}
                  />
                  <Typography variant="body2" fontSize={'16px'}>
                    ({count})
                  </Typography>
                </Box>
              ))}

              {/* View More / Less Toggle */}
              {showToggle && (
                <Button
                  onClick={() => toggleShowAll(facet)}
                  startIcon={isShowAll ? <Remove fontSize="small" /> : <Add fontSize="small" />}
                  variant="text"
                  sx={{ paddingLeft: 0, fontSize: '16px', textTransform: 'capitalize' }}
                >
                  {isShowAll ? 'View Less' : 'View More'}
                </Button>
              )}
            </Collapse>
          </Box>
        )
      })}
    </Box>
  )
}

export default ManualFacetBlock
