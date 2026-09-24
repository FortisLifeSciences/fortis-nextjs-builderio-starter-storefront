export const accountActionButton = {
  minHeight: '2.75rem',
  borderRadius: '0px 22px',
  padding: '0.625rem 1.5rem',
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
  boxShadow: 'none',
  '& .MuiButton-startIcon': {
    marginRight: '0.5rem',
    '& svg': { fontSize: '1.125rem' },
  },
  '&.MuiButton-contained': {
    backgroundColor: 'primary.main',
    color: 'common.white',
    '&:hover': { backgroundColor: 'primary.light', boxShadow: 'none' },
  },
  '&.MuiButton-outlined': {
    borderColor: 'primary.main',
    color: 'primary.main',
    '&:hover': {
      borderColor: 'primary.main',
      backgroundColor: 'secondary.main',
    },
  },
}

export const accountTextButton = {
  minHeight: '2.75rem',
  padding: '0.625rem 0.75rem',
  fontSize: '0.9375rem',
  fontWeight: 600,
  color: 'text.secondary',
  whiteSpace: 'nowrap',
  '&:hover': { backgroundColor: 'transparent', color: 'text.primary' },
}

export const accountFormInput = {
  backgroundColor: 'common.white',
  '& .MuiOutlinedInput-root': {
    borderRadius: '0.375rem',
    minHeight: '2.625rem',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'grey.300',
  },
  '& .MuiOutlinedInput-input, & .MuiSelect-select': {
    padding: '0.625rem 0.75rem',
    fontSize: '0.9375rem',
    lineHeight: 1.5,
  },
}
