import { useEffect, useState } from 'react'

import { Box, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material'

interface Props {
  sortIndex: string
  onChangeSort: (value: string) => void
}

const options = [
  { value: 'products', label: 'Relevance' },
  { value: 'products_relevance', label: 'Featured' },
]

const ManualSortDropdown = ({ sortIndex, onChangeSort }: Props) => {
  const [selectedSort, setSelectedSort] = useState(sortIndex)

  useEffect(() => {
    setSelectedSort(sortIndex)
  }, [sortIndex])

  const handleChange = (event: SelectChangeEvent) => {
    const newSort = event.target.value
    setSelectedSort(newSort)
    onChangeSort(newSort) // notify parent without touching URL
  }

  return (
    <Box className="sortDropdownContainer">
      <FormControl
        className="sortWrapper"
        fullWidth
        size="small"
        sx={{ minWidth: 120 }}
        variant="outlined"
      >
        <span>Sort: </span>
        <Select
          aria-label="Sort"
          value={selectedSort}
          onChange={handleChange}
          size="small"
          displayEmpty
          sx={{
            borderWidth: '1px',
            borderStyle: 'solid',
            //borderColor: '#ccc',
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

export default ManualSortDropdown
