import React from 'react'

import { Box, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { useSortBy } from 'react-instantsearch-hooks-web'

interface SortItem {
  label: string
  value: string
}

interface CustomSortByProps {
  items: SortItem[]
}

const CustomSortBy: React.FC<CustomSortByProps> = ({ items }) => {
  const { options, currentRefinement, refine } = useSortBy({
    items,
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
          renderValue={(value) => {
            const selected = options.find((option) => option.value === value)
            return `Sort: ${selected?.label ?? ''}`
          }}
          sx={{
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#EAEAF1',
            borderRadius: '9px',
            fontSize: '13px !important',
            height: '39px',
            backgroundColor: '#FFFFFF',
            color: '#1B1A24',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '19px',
            padding: '4.5px 12px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#EAEAF1',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#C9C7D6',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#30299A',
            },
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
                color: '#1B1A24',
                fontFamily: 'Poppins',
                fontSize: '13px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '19px',
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
