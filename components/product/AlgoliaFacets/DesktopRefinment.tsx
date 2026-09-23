import CloseIcon from '@mui/icons-material/Close'
import { Box, Chip, Link } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useClearRefinements, useCurrentRefinements } from 'react-instantsearch-hooks-web'

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
    typography: 'body1',
    marginTop: '1',
    borderRadius: '16px',
    '&:hover': {
      opacity: 1,
      color: '#FFFFFF',
    },
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
        display: 'flex',
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

export default DesktopRefinement
