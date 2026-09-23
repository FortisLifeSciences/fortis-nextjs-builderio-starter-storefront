import CloseIcon from '@mui/icons-material/Close'
import { Box, Chip, Link } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#30299A',
  color: '#FFFFFF',
  fontWeight: 600,
  fontFamily: 'Poppins',
  border: 'none',
  fontSize: '12px',
  borderRadius: '20px',
  textTransform: 'capitalize',
  '.MuiChip-deleteIcon': {
    color: '#FFFFFF',
    opacity: 0.85,
    borderRadius: '16px',
    '&:hover': {
      opacity: 1,
      color: '#FFFFFF',
    },
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
          color: '#30299A',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'none',
          marginLeft: 2,
          cursor: 'pointer',
          textDecoration: 'underline',
          fontFamily: 'Poppins',
          lineHeight: '19px',
        }}
      >
        Clear all
      </Link>
    </Box>
  )
}

export default SelectedFiltersChips
