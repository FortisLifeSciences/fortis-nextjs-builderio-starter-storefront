import CloseIcon from '@mui/icons-material/Close'
import { Box, Chip, Link } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useClearRefinements, useCurrentRefinements } from 'react-instantsearch-hooks-web'

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#fff',
  color: '#2B2B2B',
  fontWeight: 400,
  border: '1px solid #020027',
  fontSize: '14px',
  textTransform: 'capitalize',
  '.MuiChip-deleteIcon': {
    color: '#2B2B2B',
    typography: 'body1',
    marginTop: '1',
    borderRadius: '16px',
  },
}))

const DesktopRefinement = () => {
  const { refine: clearFilters } = useClearRefinements()
  const refinements = useCurrentRefinements().items

  const handleRemove = (refinementItem: any, valueToRemove: any) => {
    refinementItem.refine(valueToRemove)
  }

  if (!refinements.length) return null

  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'flex' },
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {refinements.map((refinementItem) =>
          refinementItem.refinements.map((refinementValue) => (
            <StyledChip
              key={`${refinementItem.attribute}-${refinementValue.label}`}
              label={refinementValue.label}
              deleteIcon={<CloseIcon sx={{ height: '16px', width: '16px' }} />}
              onDelete={() => handleRemove(refinementItem, refinementValue)}
            />
          ))
        )}
      </Box>

      <Link
        component="button"
        onClick={clearFilters}
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

export default DesktopRefinement
