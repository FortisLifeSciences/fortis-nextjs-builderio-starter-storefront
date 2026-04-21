import React, { ReactElement, useEffect, useRef, useState } from 'react'

import { Box, Container, Stack } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { HydrationBoundary } from '@tanstack/react-query'
import creditCardType from 'credit-card-type'
import Router, { useRouter } from 'next/router'

import { AnnouncementBar, GlobalFetchingIndicator } from '@/components/common'
import { Footer, FortisHeader, KiboHeader } from '@/components/layout'
import {
  AuthContextProvider,
  ModalContextProvider,
  DialogRoot,
  HeaderContextProvider,
  SnackbarRoot,
} from '@/context'
import theme from '@/styles/theme'

creditCardType.updateCard('mastercard', {
  niceType: 'MC',
})

creditCardType.updateCard('american-express', {
  niceType: 'AMEX',
})

const TRANSPARENT_PAGES = [
  '/',
  '/new-home-page',
  '/new-about',
  '/about',
  '/our-company',
  '/new-services-page',
  '/fortis-grant-2026-abnano-vhh-discovery',
  '/data-in-focus',
]

const DefaultLayout = ({ pageProps, children }: { pageProps: any; children: ReactElement }) => {
  const router = useRouter()
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const isTransparentPage = TRANSPARENT_PAGES.includes(router.asPath.split('?')[0])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setHeaderHeight(el.offsetHeight))
    observer.observe(el)
    setHeaderHeight(el.offsetHeight)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleRouteChange = (url: any) => {
      const isMyAccountPage = url.includes('/my-account')
      const isCheckoutPage = url.includes('/checkout')
      const divElement = document.querySelector<HTMLElement>('.grecaptcha-badge')
      if (divElement) {
        if (isMyAccountPage || isCheckoutPage) {
          divElement.style.visibility = 'visible'
        } else {
          divElement.style.visibility = 'hidden'
        }
      }
    }
    Router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  // Force scroll to top on every page path change
  // Note: body and #__next are the actual scroll containers here (not window)
  // because global.css sets height:100% + overflow-x:hidden on both.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash) return
    const forceTop = () => {
      window.scrollTo(0, 0)
      if (document.documentElement) document.documentElement.scrollTop = 0
      if (document.body) document.body.scrollTop = 0
      const next = document.getElementById('__next')
      if (next) next.scrollTop = 0
      const mainContent = document.getElementById('main-content')
      if (mainContent) mainContent.scrollTop = 0
    }
    forceTop()
    const timers = [
      setTimeout(forceTop, 0),
      setTimeout(forceTop, 50),
      setTimeout(forceTop, 200),
      setTimeout(forceTop, 500),
      setTimeout(forceTop, 1000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [router.asPath])

  return (
    <HydrationBoundary state={pageProps.dehydratedState}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ModalContextProvider>
          <AuthContextProvider>
            <HeaderContextProvider>
              <GlobalFetchingIndicator />
              <Stack sx={{ minHeight: '100vh', width: '100%' }}>
                {/* <KiboHeader
                  navLinks={[
                    {
                      link: '/order-status',
                      text: 'order-status',
                    },
                    {
                      link: '/wishlist',
                      text: 'wishlist',
                    },
                  ]}
                  categoriesTree={pageProps.categoriesTree || []}
                  isSticky={true}
                /> */}
                <Stack
                  ref={headerRef}
                  id="fixed-header-wrapper"
                  sx={{
                    position: 'fixed',
                    width: '100%',
                    zIndex: 999,
                  }}
                >
                  <AnnouncementBar />
                  <FortisHeader
                    navLinks={[
                      {
                        link: '/order-status',
                        text: 'order-status',
                      },
                      {
                        link: '/wishlist',
                        text: 'wishlist',
                      },
                    ]}
                    categoriesTree={pageProps.categoriesTree || []}
                    isSticky={true}
                  />
                </Stack>
                <DialogRoot />
                <SnackbarRoot />
                <Box
                  id="main-content"
                  sx={{
                    flex: '1 0 auto',
                    width: '100%',
                    position: 'relative',
                    pt: isTransparentPage ? 0 : `${headerHeight}px`,
                  }}
                >
                  {isTransparentPage ? (
                    children
                  ) : (
                    <Container
                      disableGutters
                      sx={{ maxWidth: '1200px !important', mx: 'auto', px: { xs: 2, md: 0 } }}
                    >
                      {children}
                    </Container>
                  )}
                </Box>
                <Footer />
              </Stack>
            </HeaderContextProvider>
          </AuthContextProvider>
        </ModalContextProvider>
      </ThemeProvider>
    </HydrationBoundary>
  )
}

export default DefaultLayout
