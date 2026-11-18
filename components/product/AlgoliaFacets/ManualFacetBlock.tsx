import React, { useState } from 'react'

import { Add, Remove, ArrowForwardIos, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'
import {
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Button,
  useMediaQuery,
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

  const [showAllValues, setShowAllValues] = useState<Record<string, boolean>>({})
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})

  const searchableAttributes = getStaticSearchableFacets()

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
                {getFacetLabel(facet)}
              </span>
            </Box>

            <Box sx={{ paddingBottom: '16px' }}>
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
                <Box
                  key={value}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: '100%', padding: '8px 0' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedFilters[facet]?.includes(value) || false}
                        data-insights-filter={`${facet}:${value}`}
                        onChange={() => onFilterChange(facet, value)}
                        size="small"
                        icon={<CheckBoxOutlineBlank />}
                        checkedIcon={<CheckBox />}
                        sx={{
                          padding: '4px 8px 4px 0',
                          color: '#C9C7D6',
                          '& .MuiSvgIcon-root': { fontSize: '18px', borderRadius: '4px' },
                          '&.Mui-checked': { color: '#30299A' },
                        }}
                        inputProps={
                          {
                            'data-insights-filter': `${facet}:${value}`,
                          } as React.InputHTMLAttributes<HTMLInputElement>
                        }
                        className="algolia-facet-label"
                      />
                    }
                    label={value}
                    sx={{
                      width: '100%',
                      margin: 0,
                      '& .MuiFormControlLabel-label': {
                        fontFamily: 'Poppins',
                        fontSize: '13.5px',
                        lineHeight: '22px',
                        color: selectedFilters[facet]?.includes(value) ? '#1B1A24' : '#5C5A70',
                        fontWeight: selectedFilters[facet]?.includes(value) ? 600 : 400,
                      },
                    }}
                  />
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '11.5px',
                      lineHeight: '18px',
                      color: '#8B8AA0',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {count}
                  </Typography>
                </Box>
              ))}

              {/* View More / Less Toggle */}
              {showToggle && (
                <Button
                  onClick={() => toggleShowAll(facet)}
                  startIcon={isShowAll ? <Remove fontSize="small" /> : <Add fontSize="small" />}
                  variant="text"
                  sx={{
                    paddingLeft: 0,
                    marginTop: '8px',
                    textTransform: 'none',
                    color: '#30299A',
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                  }}
                >
                  {isShowAll ? 'View Less' : 'View More'}
                </Button>
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export default ManualFacetBlock
