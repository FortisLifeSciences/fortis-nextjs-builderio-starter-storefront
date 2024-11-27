import CloseIcon from '@mui/icons-material/Close'
import { Box, Chip, Stack } from '@mui/material'

import type { FacetValue } from '@/lib/gql/types'

export type FilterTilesProps = {
  appliedFilters: FacetValue[]
  children?: React.ReactNode
  onSelectedTileRemoval: (tile: string) => void
}

const styles = {
  filterTiles: {
    display: 'inline-flex',
    margin: '0 1rem 1rem 0',
    textTransform: 'capitalize',
  },
  closeIcon: {
    '& .MuiChip-deleteIcon': {
      color: '#2B2B2B',
      typography: 'body1',
      marginTop: '1',
    },
    color: '#2B2B2B',
    fontFamily: 'Roboto',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
    textTransform: 'capitalize',
    borderRadius: '16px',
    border: '1px solid #020027',
  },
}
const FilterTiles = (props: FilterTilesProps) => {
  const { appliedFilters, children, onSelectedTileRemoval } = props

  return (
    <Box component="div">
      {appliedFilters?.map((filter) => (
        <Stack
          key={filter.filterValue}
          direction="row"
          alignItems="center"
          sx={{ ...styles.filterTiles }}
        >
          <Chip
            variant="outlined"
            sx={{ ...styles.closeIcon }}
            label={filter.label}
            deleteIcon={<CloseIcon sx={{ height: '16px', width: '16px' }} />}
            onDelete={() => onSelectedTileRemoval(filter?.filterValue as string)}
          />
        </Stack>
      ))}
      <Box sx={{ display: { xs: 'block', md: 'inline' } }}>{children}</Box>
    </Box>
  )
}

export default FilterTiles
