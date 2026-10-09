export const styles = {
  tableContainer: {
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: '0.75rem',
    backgroundColor: 'common.white',
    overflow: 'hidden',
  },
  headerRow: {
    backgroundColor: 'transparent',
    borderBottom: '1px solid',
    borderColor: 'grey.300',
  },
  headerCell: {
    padding: '0.875rem 1.25rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: 'text.primary',
    borderBottom: 'none',
  },
  bodyRow: {
    '&:not(:last-of-type) td': {
      borderBottom: '1px solid',
      borderColor: 'grey.200',
    },
    '&:last-of-type td': {
      borderBottom: 'none',
    },
  },
  tableCellStyles: {
    padding: '0.875rem 1.25rem',
    fontSize: '0.9375rem',
    color: 'text.primary',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mutedText: {
    fontSize: '0.8125rem',
    color: 'text.secondary',
  },
  rowActionIcon: {
    color: 'primary.main',
    '&:hover': { backgroundColor: 'secondary.main' },
  },
  iconButtonStyles: {
    fontWeight: '400',
    lineHeight: '19px',
    fontSize: '16px',
    color: '#000000',
    textDecoration: 'underline',
    '&:hover': {
      textDecoration: 'underline',
      background: '#fff',
    },
  },
}
