import CloseIcon from '@mui/icons-material/Close'
import { Box, Chip, Link } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#fff',
  color: '#2B2B2B',
  fontWeight: 400,
  border: '1px solid #020027',
  fontSize: '14px',
  textTransform: 'capitalize',
  '.MuiChip-deleteIcon': {
    color: '#2B2B2B',
    borderRadius: '16px',
  },
}))

interface SelectedFiltersChipsProps {
  selectedFilters: Record<string, string[]>
  onFilterRemove: (facet: string, value: string) => void
  onClearAll: () => void
}

const SelectedFiltersChips = ({
  selectedFilters,
  onFilterRemove,
  onClearAll,
}: SelectedFiltersChipsProps) => {
  const hasFilters = Object.keys(selectedFilters).some((facet) => selectedFilters[facet].length > 0)

  if (!hasFilters) return null

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Object.entries(selectedFilters).map(([facet, values]) =>
          values.map((value) => (
            <StyledChip
              key={`${facet}-${value}`}
              label={value}
              onDelete={() => onFilterRemove(facet, value)}
              deleteIcon={<CloseIcon sx={{ height: '16px', width: '16px' }} />}
            />
          ))
        )}
      </Box>

      <Link
        component="button"
        onClick={onClearAll}
        underline="hover"
        sx={{
          color: '#020027',
          fontSize: '14px',
          fontWeight: 400,
          textTransform: 'none',
          marginLeft: 2,
          cursor: 'pointer',
          textDecoration: 'underline',
          fontFamily: 'Poppins',
          lineHeight: '20px',
        }}
      >
        Clear All Filters
      </Link>
    </Box>
  )
}

export default SelectedFiltersChips
