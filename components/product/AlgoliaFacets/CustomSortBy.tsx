import React from 'react'

import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { useSortBy } from 'react-instantsearch-hooks-web'

const CustomSortBy = () => {
  const { options, currentRefinement, refine } = useSortBy({
    items: [
      { label: 'Relevance', value: 'products' },
      { label: 'Featured', value: 'products_relevance' },
      // Add more replicas if needed
    ],
  })

  const handleChange = (event: SelectChangeEvent) => {
    refine(event.target.value)
  }

  return (
    <Box>
      <FormControl fullWidth size="small" sx={{ minWidth: 120 }} variant="outlined">
        <Select
          aria-label="Sort"
          value={currentRefinement}
          onChange={handleChange}
          size="small"
          displayEmpty
          sx={{
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '5px',
            fontSize: '14px !important',
            height: '32px',
            color: '#2B2B2B',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '20px',
            padding: '4.5px 12px',
          }}
          inputProps={{
            id: 'custom-sort-by',
            'aria-label': 'Sort',
          }}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                color: '#2B2B2B',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '20px',
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default CustomSortBy
