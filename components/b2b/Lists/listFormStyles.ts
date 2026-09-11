export const listFormStyles = {
  card: {
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: '0.75rem',
    backgroundColor: 'common.white',
    padding: { xs: '1.25rem', md: '1.5rem' },
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.1875rem',
    fontWeight: 700,
    lineHeight: 1.3,
    color: 'text.primary',
    marginBottom: '1.25rem',
  },
  itemsHeader: {
    justifyContent: 'space-between',
    alignItems: { xs: 'flex-start', sm: 'center' },
    marginBottom: '1rem',
  },
  textBox: {
    height: 'auto !important',
    minHeight: '2.625rem',
    borderRadius: '0.375rem !important',
    borderColor: 'grey.300 !important',
    fontSize: '0.9375rem !important',
  },
  listName: {
    fontSize: '1.1875rem',
    fontWeight: 700,
    color: 'text.primary',
  },
  hint: {
    fontSize: '0.9375rem',
    color: 'text.secondary',
    marginTop: '1rem',
  },
  itemsHeaderRow: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: 'text.primary',
    paddingBottom: '0.5rem',
  },
  inlineLink: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'primary.main',
    padding: '0.25rem 0.5rem',
    minWidth: 0,
    whiteSpace: 'nowrap',
    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
  },
}
