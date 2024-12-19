// components/Navbar.styles.ts
import { SxProps } from '@mui/system'

export const navbarStyles: SxProps = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 0px',
  backgroundColor: 'white',
  transition: 'height 0.3s ease-in-out',
  height: '90px',
  minHeight: '58px',
  maxHeight: '90px',
  willChange: 'height',
  '&.scrolled': {
    height: '58px',
  },
}

export const logoStyles: SxProps = {
  width: '43px',
}

export const navMenuStyles: SxProps = {
  display: 'flex',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  listStyle: 'none',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '0 !important',
  // overflow: 'hidden',
}

export const navItemStyles: SxProps = {
  margin: '0 15px',
  display: 'flex',
  '& a': {
    textDecoration: 'none',
    color: '#1e2ba6',
    fontSize: '16px',
    fontWeight: 500,
    '&:hover': {
      color: '#555',
    },
  },
}
