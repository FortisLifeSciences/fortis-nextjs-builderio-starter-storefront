import theme from '@/styles/theme'

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
    // paddingBlock: { xs: 0, md: 1 },
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
    width: '100%',
    backgroundColor: '#e3e2ff', //Change with theme term later
    height: '40',
    [theme.breakpoints.down('md')]: {
      backgroundColor: 'common.white', // new color when screen is below 900px, for mobile search.
    },
  },
  appBarStyles: {
    zIndex: (theme: any) => theme.zIndex.modal,
    scrollBehavior: 'smooth',
    backgroundColor: 'common.white',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  logoStyles: {
    // cursor: 'pointer',
    textAlign: 'center',
    position: 'relative',
    margin: 'auto',
    // minHeight: '70px',
    // width: '100%',
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
    backgroundColor: 'common.white',
    display: {
      xs: 'none',
      md: 'block',
    },
  },
}
