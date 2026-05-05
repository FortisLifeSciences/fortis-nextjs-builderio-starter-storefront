export const topHeaderStyles = {
  wrapper: {
    display: {
      xs: 'none',
      md: 'flex',
    },
    backgroundColor: 'common.white',
    justifyContent: 'flex-end',
    zIndex: (theme: any) => theme.zIndex.modal,
    paddingBlock: 1,
    paddingInline: 2,
  },
  container: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '40px',
  },
}

export const headerActionAreaStyles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3e2ff',
  },
  container: {
    display: 'flex',
    justifyContent: 'end',
    alignItems: 'center',
  },
  searchSuggestionsWrapper: {
    width: '543px',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    flex: 1,
    display: { xs: 'none', md: 'inline-flex' },
    alignItems: 'center',
  },
  logoWrapper: {
    order: 0,
    top: '-27px',
  },
}

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
    display: {
      xs: 'none',
      md: 'block',
    },
  },
}
