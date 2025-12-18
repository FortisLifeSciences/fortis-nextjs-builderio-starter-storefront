import React, { ReactElement, useEffect } from 'react'

import { Container, Stack } from '@mui/material'
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

  useEffect(() => {
    const wrapper = document.getElementById('fixed-header-wrapper')
    const content = document.getElementById('main-content')

    const updateContentOffset = () => {
      if (wrapper && content) {
        const height = wrapper.getBoundingClientRect().height
        content.style.marginTop = `${height}px`
      }
    }

    if (wrapper) {
      // ResizeObserver watches for any size changes in the wrapper
      const observer = new ResizeObserver(() => {
        updateContentOffset()
      })

      observer.observe(wrapper)
      // Initial call
      updateContentOffset()

      return () => {
        observer.disconnect()
      }
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
              <Stack sx={{ minHeight: '100vh' }}>
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
                <Container
                  id="main-content"
                  sx={{ py: 2, flex: '1 0 auto', maxWidth: '1200px', px: { lg: 0 } }}
                >
                  {children}
                </Container>
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
