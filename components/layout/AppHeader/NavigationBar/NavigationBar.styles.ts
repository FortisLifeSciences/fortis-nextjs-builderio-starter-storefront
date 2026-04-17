import { SxProps } from '@mui/system'

// Full-width outer wrapper
export const navWrapperStyles: SxProps = {
  width: '100%',
  backgroundColor: 'transparent',
  transition: 'background-color 0.3s ease-in-out',

  // Algolia search — pill ghost style
  '& .aa-Autocomplete': { width: '100%' },
  '& .aa-DetachedSearchButton': { width: '100%' },
  '& .aa-Form': {
    left: '0 !important',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '100px !important',
    height: '42px',
    boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  '& .aa-InputWrapperPrefix': { display: 'none' },
  '& .aa-InputWrapper': { flex: 1 },
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
  padding: '16px 0',
  gap: '20px',
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
  height: '74px',
  boxSizing: 'border-box',
  transition: 'height 0.3s ease-in-out, padding 0.3s ease-in-out',
  '.scrolled &': {
    height: '66px',
    padding: '18px 0',
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
  gap: '24px',
  flex: 1,
}

// Nav links — gap: 4px between items per Figma
export const navLinksStyles: SxProps = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '4px',
  flexShrink: 0,
}

// Search — exactly 335px per Figma
export const searchWrapperStyles: SxProps = {
  flex: '0 0 335px',
  width: '335px',
  overflow: 'visible',
  position: 'relative',
}

// Divider + cart + account
export const iconGroupStyles: SxProps = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '24px',
  flexShrink: 0,
}
