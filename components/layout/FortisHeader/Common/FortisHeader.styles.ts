export const kiboHeaderStyles = {
  topBarStyles: {
    zIndex: (theme: any) => theme.zIndex.modal,
    display: 'block', // WEB-1648
    width: '100%',
    backgroundColor: 'transparent',
    background: 'none',
  },
  appBarStyles: {
    zIndex: (theme: any) => theme.zIndex.modal,
    scrollBehavior: 'smooth',
    backgroundColor: 'transparent',
    background: 'none',
    backgroundImage: 'none',
    boxShadow: 'none',
  },
  logoStyles: {
    textAlign: 'center',
    position: 'relative',
    margin: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
    display: {
      xs: 'none',
      md: 'flex',
    },
    background: 'transparent',
  },
  megaMenuStyles: {
    margin: 'auto',
    color: 'common.black',
    width: '100%',
    minHeight: '50px',
    backgroundColor: 'transparent',
    background: 'none',
    // Visibility is handled by global.css at HEADER_DESKTOP_MIN_PX
    // (.fortis-desktop-header-slot), not the theme `md` breakpoint (=1200).
    display: 'block',
  },
}
