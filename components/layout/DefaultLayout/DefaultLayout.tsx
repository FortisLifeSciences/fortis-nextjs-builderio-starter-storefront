import React, { ReactElement, useEffect } from 'react'

import { Box, Stack } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { HydrationBoundary } from '@tanstack/react-query'
import creditCardType from 'credit-card-type'
import Router from 'next/router'

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

const DefaultLayout = ({ pageProps, children }: { pageProps: any; children: ReactElement }) => {
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
                <Box id="main-content" sx={{ flex: '1 0 auto', width: '100%', pt: 0 }}>
                  {children}
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
