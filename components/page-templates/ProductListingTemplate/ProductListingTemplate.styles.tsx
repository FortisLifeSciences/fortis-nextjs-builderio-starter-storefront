import { Theme } from '@emotion/react'
import { SxProps } from '@mui/material'

export const PLPStyles = {
  breadcrumbsClass: {
    // margin: '1.5rem 0',
    padding: {
      md: '0',
      xs: '0 1rem',
    },
    paddingBottom: { lg: '16px' },
    paddingTop: { lg: '4px' },
  },
  navBar: {
    display: 'flex',
    flexWrap: 'wrap',
    position: 'relative',
  },
  navBarMain: {
    display: 'flex',
    flex: 1,
    flexDirection: {
      md: 'row',
      xs: 'column',
    },
    alignItems: {
      md: 'center',
      xs: 'flex-start',
    },
    padding: {
      md: '0.5rem 0',
      xs: '2% 1rem',
    },
  },
  navBarSort: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: '0 0 0 auto',
    alignItems: 'center',
    width: { md: 'auto', xs: '100%' },
    // padding: '0.5rem 0',
  } as SxProps<Theme> | undefined,
  navBarLabel: {
    whiteSpace: 'noWrap',
    marginRight: '10px',
    color: '#020027',
    fontFamily: 'Poppins',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '24px',
    display: { md: 'block', xs: 'none' },
  } as SxProps<Theme> | undefined,
  navBarView: {
    margin: '0 0 0 1rem',
    order: 0,
    alignItems: 'center',
    display: {
      md: 'flex',
      xs: 'none',
    },
  },
  mainSection: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  sideBar: {
    display: {
      md: 'block',
      xs: 'none',
    },
    // borderRightWidth: '1px',
    // borderRightStyle: 'solid',
    // borderRightColor: 'grey.500',
    // padding: '0 1.5625rem 0 0',
    maxWidth: {
      md: '17%',
      xs: 'auto',
    },
  } as SxProps<Theme> | undefined,
  productGrid: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  filterByButton: {
    textTransform: 'capitalize',
    border: '1px solid #2b2b2b',
    color: '#2b2b2b',
    justifyContent: 'space-between',
    width: '100%',
    height: '2.188rem',
    fontWeight: '400',
  },
  showMoreButton: {
    borderRadius: '0px 26px',
    border: '1px solid #30299A',
    fontSize: '16px',
    padding: '12px 18px',
    lineHeight: '24px',
    fontWeight: '500',
    fontStyle: 'normal',
    color: 'primary.main',
    '&:hover': {
      backgroundColor: 'secondary.main',
      border: '1px solid #E3E2FF',
    },
  },
  productResults: {
    display: 'flex',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: 'poppins',
    fontStyle: 'normal',
    lineHeight: '20px',
  },
  categoryFacetHeader: {
    // fontWeight: 'bold',
    color: 'primary.main',
    marginBottom: '0.5rem',
  },
  categoryFacetHeaderLoading: {
    height: { md: '2.25rem', xs: '1.5rem' },
    width: { md: '15.625rem', xs: '10.75rem' },
  },
  sorting: {
    display: 'flex',
    alignItems: 'center',
    minWidth: { md: '11.875rem', xs: '9.313rem' },
    marginTop: { xs: '0.5rem', md: '0' },
  },
  filterBy: {
    minWidth: { md: '11.875rem', xs: '9.313rem' },
    display: { md: 'none' },
    marginTop: { xs: '0.5rem', md: '0' },
  },
  filterByMobile: {
    display: {
      md: 'none',
      xs: 'block',
    },
  },
  clearAllButton: {
    typography: 'body2',
    textDecoration: 'underline',
    marginTop: { md: '1.5rem', xs: 0 },
    marginLeft: 0,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    color: '#020027',
    fontFamily: 'Poppins',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
  },
  totalResults: {
    marginTop: '1.5rem',
    marginRight: { md: 0, xs: '1rem' },
    typography: 'body2',
    whiteSpace: 'nowrap',
    color: '#020027',
    fontFamily: 'Poppins',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
  },
  plpGrid: {
    width: {
      xs: '100%',
      md: '100%',
    },
  },
  FacetSection: {
    left: {
      xs: '0',
    },
  },
  FacetsContainer: {
    paddingRight: {
      xs: '0',
      md: '8px',
    },
  },
  FacetsInnerContainer: {
    padding: {
      xs: '20px 0',
      md: '0',
    },
  },
  Facetpanel: {
    padding: {
      xs: '0 20px',
    },
  },
}
