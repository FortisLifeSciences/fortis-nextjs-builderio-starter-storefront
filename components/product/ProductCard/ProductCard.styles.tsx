import { Margin, Padding } from '@mui/icons-material'
import zIndex from '@mui/material/styles/zIndex'
import { color } from 'framer-motion'

export const ProductCardStyles = {
  main: {
    '& a': {
      textDecoration: 'none',
    },
    cursor: 'pointer',
    maxWidth: 260,
  },
  cardRoot: {
    position: 'relative',
    padding: '0.625rem',
    backgroundColor: 'secondary.light',
    textDecoration: 'none',
    width: 260,
    maxWidth: 260,
    boxShadow: 'none',
    cursor: 'pointer',
    borderRadius: '0px 0px 25px 0px',
    border: '1px solid #E3E2FF',
    boxSizing: 'border-box',
    overflow: 'hidden',
    // '&:hover .quick-actions': {
    //   opacity: 1,
    // },
    '&:hover': {
      boxShadow: '0 2px 16px 4px rgb(11 32 61 / 7%)',
      borderColor: 'primary.light',
      // '.quick-view': {
      //   opacity: 1,
      // },
    },
    '&:hover .MuiIconButton-root': {
      opacity: 1,
    },
    '&:hover .productNameStyle': {
      color: 'grey.900',
    },
  },

  iconButton: {
    backgroundColor: 'primary.light',
    width: 50,
    height: 50,
    borderRadius: '25px 0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    Padding: 0,
    Margin: 0,
    '&:hover': {
      opacity: 1,
      backgroundColor: 'primary.light',
    },
  },
  newTag: {
    width: 80,
    height: 41,
    top: '0px',
    position: 'absolute',
    left: '0px',
    zIndex: 2,
  },
  quickView: {
    opacity: 0,
    width: '100%',
    marginTop: '1 rem',
  },
  cardMedia: {
    width: '100%',
    position: 'relative',
    maxWidth: 240,
  },
  shopNow: { width: '100%', marginTop: '3.063rem' },
  hoveredButtons: {
    display: ' flex',
    alignItems: 'center',
    padding: 0.5,
    whiteSpace: 'nowrap',
    backgroundColor: 'grey.500',
    '&:hover': {
      backgroundColor: 'primary.main',
      '& > *': {
        color: 'secondary.light',
      },
    },
  },
  quickViewButton: {
    backgroundColor: 'primary.main',
    color: 'common.white',
    px: 2,
  },
  resourceIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'primary.main',
    color: 'common.white',
    width: '46px',
    height: '46px',
  },
  brandLabel: {
    color: 'grey.900',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '300',
    lineHeight: 'normal',
    fontFamily: 'Poppins',
  },
  productNameStyle: {
    color: '#2B2B2B',
  },
}
