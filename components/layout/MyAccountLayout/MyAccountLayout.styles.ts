import { accountType } from '@/components/my-account/common'

export const MyAccountLayoutStyles = {
  container: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: { xs: '0 1rem 2rem', md: '0 1.5rem 4rem' },
  },
  breadcrumb: {
    ...accountType.label,
    color: 'text.primary',
    padding: { xs: '1rem 0', md: '1.5rem 0 1rem' },
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  breadcrumbLink: {
    color: 'text.primary',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },
  sidebarCard: {
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: '0.75rem',
    backgroundColor: 'common.white',
    padding: '1.5rem 1rem',
  },
  userName: {
    ...accountType.cardTitle,
    fontWeight: 700,
    color: 'text.primary',
    lineHeight: 1.3,
  },
  userOrganization: {
    ...accountType.label,
    color: 'text.secondary',
    marginTop: '0.125rem',
  },
  groupLabel: {
    ...accountType.groupLabel,
    color: 'text.primary',
    display: 'block',
    padding: '0 0.75rem',
    marginBottom: '0.5rem',
  },
  navItem: {
    borderRadius: '0.5rem',
    padding: '0.625rem 0.75rem',
    marginBottom: '0.125rem',
    color: 'text.primary',
    borderLeft: '3px solid transparent',
    '&:hover': { backgroundColor: 'grey.100' },
  },
  navItemActive: {
    backgroundColor: 'secondary.main',
    borderLeftColor: 'primary.main',
    color: 'primary.main',
    '&:hover': { backgroundColor: 'secondary.main' },
  },
  navItemIcon: {
    minWidth: '2rem',
    color: 'inherit',
  },
  navItemText: {
    '& .MuiTypography-root': {
      ...accountType.body,
      color: 'inherit',
    },
  },
  divider: {
    borderColor: 'grey.300',
    margin: '1rem 0',
  },
  mobileNav: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    padding: '0.5rem 0 1rem',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
  mobileNavItem: {
    flexShrink: 0,
    borderRadius: '2rem',
    border: '1px solid',
    borderColor: 'grey.300',
    padding: '0.5rem 1rem',
    ...accountType.body,
    color: 'text.primary',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  mobileNavItemActive: {
    backgroundColor: 'secondary.main',
    borderColor: 'primary.main',
    color: 'primary.main',
    fontWeight: 600,
  },
}
