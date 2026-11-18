import { useEffect, useState } from 'react'

import { Box, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material'

interface Props {
  sortIndex: string
  onChangeSort: (value: string) => void
}

const options = [
  { value: 'products', label: 'Relevance' },
  { value: 'products_relevance', label: 'Featured' },
  { label: 'Citation Count', value: 'products_citation_count' },
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
        sx={{ minWidth: 200 }}
        variant="outlined"
      >
        <Select
          aria-label="Sort"
          value={selectedSort}
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
          MenuProps={{ disableScrollLock: true }}
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

export default ManualSortDropdown
