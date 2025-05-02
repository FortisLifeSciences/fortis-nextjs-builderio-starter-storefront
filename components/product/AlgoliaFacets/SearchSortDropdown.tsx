import { useEffect, useState } from 'react'

import { Box, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material'

interface Props {
  sortIndex: string
  onChangeSort: (value: string) => void
}

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
      <FormControl className="sortWrapper" fullWidth size="small" sx={{ minWidth: 120 }}>
        <span>Sort: </span>
        <Select
          className="sortDropdown"
          value={selectedSort}
          onChange={handleChange}
          size="small"
          displayEmpty
          inputProps={{ 'aria-label': 'Sort' }}
        >
          <MenuItem className="sortSearchItem" value="products">
            Relevance
          </MenuItem>
          <MenuItem className="sortSearchItem" value="products_relevance">
            Featured
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default ManualSortDropdown
