import { SxProps } from '@mui/system'

// Full-width outer wrapper
export const navWrapperStyles: SxProps = {
  width: '100%',
  backgroundColor: 'transparent',
  transition: 'background-color 0.3s ease-in-out',

  // Algolia search — pill ghost style
  '& #autocomplete': { width: '100%', maxWidth: '100%', minWidth: 0 },
  '& .aa-Autocomplete': { width: '100%', maxWidth: '100%', minWidth: 0 },
  '& .aa-DetachedSearchButton': { width: '100%' },
  '& .aa-Form': {
    left: '0 !important',
    right: '0 !important',
    width: '100%',
    maxWidth: '100%',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '100px !important',
    height: '42px',
    boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  '& .aa-InputWrapperPrefix': { display: 'none' },
  '& .aa-InputWrapper': { flex: 1, minWidth: 0, overflow: 'hidden' },
  '& .aa-Input': {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#FFFFFF',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 400,
    fontSize: '15px',
    letterSpacing: '-0.005em',
    width: '100%',
    minWidth: 0,
    paddingLeft: '32px', // 20px icon + 12px gap
    '&::placeholder': { color: 'rgba(255,255,255,0.7)' },
  },
  '& .aa-InputWrapperSuffix': { display: 'none' },

  // Algolia panel — appears below the navbar
  '& .aa-Panel': {
    marginTop: '12px',
    zIndex: 1400,
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },

  // Icon color — white on dark bg
  '& .nav-right-icons svg': { color: '#FFFFFF' },
  '& .nav-right-icons svg path': { fill: '#FFFFFF' },

  // Scrolled — white background
  '&.scrolled': {
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',

    '& .aa-Form': {
      background: '#F5F5F5',
      border: '1px solid rgba(0,0,0,0.1)',
    },
    '& .aa-SubmitIcon, & .aa-InputWrapperPrefix svg': { color: '#111', fill: '#111' },
    '& .aa-Input': {
      color: '#111',
      '&::placeholder': { color: '#999' },
    },
    '& .aa-ClearButton svg': { color: '#111', fill: '#111' },
    '& .nav-right-icons svg': { color: '#30299A' },
    '& .nav-right-icons svg path': { fill: '#30299A' },
  },
}

// Inner nav — 1440px max, centered, exact Figma spacing
export const navInnerStyles: SxProps = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: { xs: '16px 16px', md: '16px 0' },
  gap: { xs: '12px', md: '20px' },
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
  height: '74px',
  boxSizing: 'border-box',
  transition: 'height 0.3s ease-in-out, padding 0.3s ease-in-out',
  '.scrolled &': {
    height: '66px',
    padding: { xs: '18px 16px', md: '18px 0' },
  },
}

// Logo — exact Figma size: 115.4 × 30px
export const logoStyles: SxProps = {
  flexShrink: 0,
  width: '115px',
  height: '30px',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
}

// Right group: nav links + search + icons — right-aligned
export const navRightContainerStyles: SxProps = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: { xs: '8px', md: '24px' },
  flex: 1,
  minWidth: 0,
}

// Nav links — gap: 4px between items per Figma
export const navLinksStyles: SxProps = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '4px',
  flexShrink: 0,
}

// Search — shrinks on tablet (900-1199px), full width on desktop (1200px+).
// theme md=1200, so tablet width is the base (xs) and desktop width is on `md`.
export const searchWrapperStyles: SxProps = {
  flex: { xs: '0 1 120px', md: '0 1 250px' },
  width: { xs: '120px', md: '250px' },
  maxWidth: { xs: '120px', md: '250px' },
  minWidth: 0,
  overflow: 'hidden',
  position: 'relative',
}

// Divider + cart + account
export const iconGroupStyles: SxProps = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: { xs: '8px', md: '24px' },
  flexShrink: 0,
}
