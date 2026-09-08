import React from 'react'

import { Collapse, Box, AppBar } from '@mui/material'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import aa from 'search-insights'

import { kiboHeaderStyles } from './FortisHeader.styles'
import { AccountHierarchyFormDialog } from '@/components/dialogs'
import {
  CheckoutHeader,
  HamburgerMenu,
  LoginDialog,
  MobileHeader,
  NavigationBar,
} from '@/components/layout'
import { useAuthContext, useHeaderContext, useModalContext } from '@/context'
import { useCreateCustomerB2bAccountMutation } from '@/hooks'
import { hasAnalyticsConsent } from '@/lib/consent/consent'
import { buildCreateCustomerB2bAccountParams } from '@/lib/helpers'
import type { CreateCustomerB2bAccountParams, NavigationLink } from '@/lib/types'

import type { Maybe, PrCategory } from '@/lib/gql/types'

interface FortisHeaderProps {
  navLinks: NavigationLink[]
  categoriesTree: Maybe<PrCategory>[]
  isSticky?: boolean
  isTransparentPage?: boolean
}

const FortisHeader = (props: FortisHeaderProps) => {
  const { navLinks, isSticky = true, isTransparentPage } = props
  const { headerState, toggleHamburgerMenu } = useHeaderContext()
  const { isAuthenticated, user } = useAuthContext()
  const { showModal, closeModal } = useModalContext()
  const { t } = useTranslation('common')
  const router = useRouter()

  const { createCustomerB2bAccount } = useCreateCustomerB2bAccountMutation()

  const { isHamburgerMenuVisible, isMobileSearchPortalVisible } = headerState
  const isCheckoutPage = router.pathname.includes('checkout')
  const { publicRuntimeConfig } = getConfig()
  const isMultiShipEnabled = publicRuntimeConfig.isMultiShipEnabled
  const hasConsent = hasAnalyticsConsent()

  React.useEffect(() => {
    if (!hasConsent) {
      if (window.localStorage.getItem('algoliaUserToken')) {
        window.localStorage.removeItem('algoliaUserToken')
      }
      return
    }

    const setToken = (token: string) => {
      const storedToken = window.localStorage.getItem('algoliaUserToken')
      if (storedToken !== token) {
        window.localStorage.setItem('algoliaUserToken', token)
      }
      if ((window as any).dataLayer) {
        window.dataLayer.push({ algoliaUserToken: token })
        if (isAuthenticated) {
          window.dataLayer.push({ algoliaAuthenticatedUserToken: token })
        } else {
          window.dataLayer.push({ algoliaAuthenticatedUserToken: undefined })
        }
      }
    }

    if (isAuthenticated && user && user.userId != null) {
      aa('setAuthenticatedUserToken', user.userId)
      setToken(user.userId)
    } else {
      aa('setAuthenticatedUserToken', undefined)
      aa('getUserToken', {}, (err, userToken) => {
        if (err) {
          console.error('user token error', err)
        }
        const token = String(userToken)
        setToken(token)
      })
    }
  }, [isAuthenticated, user?.userId, hasConsent])

  const handleAccountIconClick = () => {
    isHamburgerMenuVisible && toggleHamburgerMenu()
    if (!isAuthenticated) {
      showModal({ Component: LoginDialog })
    } else {
      router.push('/my-account')
    }
  }

  const handleAccountRequest = async (formValues: CreateCustomerB2bAccountParams) => {
    const variables = buildCreateCustomerB2bAccountParams(formValues)
    await createCustomerB2bAccount.mutateAsync(variables)
    closeModal()
  }

  const handleB2BAccountRequestClick = () => {
    showModal({
      Component: AccountHierarchyFormDialog,
      props: {
        isAddingAccountToChild: false,
        isRequestAccount: true,
        primaryButtonText: t('request-account'),
        formTitle: t('b2b-account-request'),
        onSave: (formValues: CreateCustomerB2bAccountParams) => handleAccountRequest(formValues),
        onClose: () => closeModal(),
      },
    })
  }

  const getSection = (): React.ReactNode => {
    if (isCheckoutPage) return <CheckoutHeader isMultiShipEnabled={isMultiShipEnabled} />

    return (
      <MobileHeader hideIcons={isHamburgerMenuVisible} isTransparentPage={isTransparentPage}>
        <Collapse in={isMobileSearchPortalVisible}>
          <Box height={'80px'} minHeight={'80px'} sx={{ px: 1, mt: 1, padding: '18px' }} />
        </Collapse>
        <HamburgerMenu
          isDrawerOpen={isHamburgerMenuVisible}
          setIsDrawerOpen={() => toggleHamburgerMenu()}
          navLinks={navLinks}
          onAccountIconClick={handleAccountIconClick}
        />
      </MobileHeader>
    )
  }

  return (
    <>
      <AppBar
        position={isSticky ? 'sticky' : 'static'}
        sx={kiboHeaderStyles.appBarStyles}
        data-testid="header-container"
      >
        {/*
          Mobile/desktop split is decided by global.css at HEADER_DESKTOP_MIN_PX
          (.fortis-mobile-header-slot / .fortis-desktop-header-slot), not by the
          theme `md` breakpoint — the theme redefines md=1200. Both slots render;
          CSS hides one, so the choice is correct during SSR.
        */}
        <Box
          component={'section'}
          className={isCheckoutPage ? undefined : 'fortis-mobile-header-slot'}
          sx={{ ...kiboHeaderStyles.topBarStyles }}
        >
          <Box sx={{ width: '100%' }}>{getSection()}</Box>
        </Box>

        <Box
          component={'section'}
          className="fortis-desktop-header-slot"
          sx={{ ...kiboHeaderStyles.megaMenuStyles }}
          data-testid="mega-menu-container"
        >
          <NavigationBar
            isCheckoutPage={isCheckoutPage}
            onAccountIconClick={handleAccountIconClick}
            isTransparentPage={isTransparentPage}
          />
        </Box>
      </AppBar>
    </>
  )
}

export default FortisHeader
