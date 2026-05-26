import React, { useState } from 'react'

import { Collapse, Box, AppBar, Backdrop, Container, useMediaQuery, useTheme } from '@mui/material'
import getConfig from 'next/config'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import aa from 'search-insights'
import { v4 as uuidv4 } from 'uuid'

import { headerActionAreaStyles, kiboHeaderStyles, topHeaderStyles } from './FortisHeader.styles'
import { AccountHierarchyFormDialog } from '@/components/dialogs'
import {
  AccountIcon,
  CartIcon,
  CheckoutHeader,
  HamburgerMenu,
  LoginDialog,
  MobileHeader,
  NavigationBar,
  SearchSuggestions,
  AlgoliaAutocomplete,
} from '@/components/layout'
import { useAuthContext, useHeaderContext, useModalContext } from '@/context'
import { useCreateCustomerB2bAccountMutation } from '@/hooks'
import { getAnalyticsConsentFromLocalStorage } from '@/lib/getAnalyticsConsent'
import { buildCreateCustomerB2bAccountParams } from '@/lib/helpers'
import type { CreateCustomerB2bAccountParams, NavigationLink } from '@/lib/types'

import type { Maybe, PrCategory } from '@/lib/gql/types'

interface KiboHeaderProps {
  navLinks: NavigationLink[]
  categoriesTree: Maybe<PrCategory>[]
  isSticky?: boolean
  isTransparentPage?: boolean
}

interface HeaderActionAreaProps {
  isHeaderSmall: boolean
  isElementVisible?: boolean
  onAccountIconClick: () => void
  onAccountRequestClick: () => void
}

const HeaderActionArea = (props: HeaderActionAreaProps) => {
  const { isHeaderSmall, onAccountIconClick, onAccountRequestClick } = props
  const { headerState, toggleSearchBar } = useHeaderContext()
  const { isMobileSearchPortalVisible, isSearchBarVisible } = headerState
  const { t } = useTranslation('common')

  const showSearchBarInLargeHeader = !isHeaderSmall || isSearchBarVisible
  return (
    <Box sx={{ ...headerActionAreaStyles.wrapper }} data-testid="header-action-area">
      <Container
        maxWidth="xl"
        disableGutters
        sx={{
          ...topHeaderStyles.container,
          justifyContent: 'space-between',
        }}
      >
        {/*
        {showSearchBarInLargeHeader && (
          <Box sx={headerActionAreaStyles.searchSuggestionsWrapper} data-testid="Search-container">
            <SearchSuggestions
              isViewSearchPortal={isMobileSearchPortalVisible}
              onEnterSearch={() => toggleSearchBar(false)}
            />
          </Box>
        )}
          */}

        {/* Algolia Autocomplete render */}
        {showSearchBarInLargeHeader && <AlgoliaAutocomplete />}

        <Box display="flex" flex={1} justifyContent={'flex-end'} gap={2}>
          <Box
            component={'span'}
            sx={{
              color: 'primary.main',
              fontFamily: 'poppins',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            <Link href={'/contact-us'} style={{ textDecoration: 'none' }}>
              CONTACT
            </Link>
          </Box>
          <button
            aria-label="Login"
            onClick={onAccountIconClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <AccountIcon
              size={isHeaderSmall ? 'small' : 'medium'}
              onAccountIconClick={onAccountIconClick}
            />
          </button>
          <button
            aria-label="Cart"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <CartIcon size={isHeaderSmall ? 'small' : 'medium'} />
          </button>
        </Box>
      </Container>
    </Box>
  )
}

const KiboHeader = (props: KiboHeaderProps) => {
  const { navLinks, isSticky = true, isTransparentPage } = props
  const { headerState, toggleMobileSearchPortal, toggleHamburgerMenu } = useHeaderContext()
  const { isAuthenticated, user } = useAuthContext()
  const { showModal, closeModal } = useModalContext()
  const { t } = useTranslation('common')
  const router = useRouter()
  const theme = useTheme()
  const mdScreen = useMediaQuery(theme.breakpoints.up('md'))

  const { createCustomerB2bAccount } = useCreateCustomerB2bAccountMutation()

  const [isBackdropOpen, setIsBackdropOpen] = useState<boolean>(false)

  const { isHamburgerMenuVisible, isMobileSearchPortalVisible } = headerState
  const isCheckoutPage = router.pathname.includes('checkout')
  const { publicRuntimeConfig } = getConfig()
  const isMultiShipEnabled = publicRuntimeConfig.isMultiShipEnabled
  const hasConsent = getAnalyticsConsentFromLocalStorage()
  const randomToken = `anonymous-${uuidv4()}`
  const randomAuthToken = `anonymous-${uuidv4()}`

  React.useEffect(() => {
    const setToken = (token: string) => {
      // Store the token in localStorage and dataLayer if it has changed
      const storedToken = window.localStorage.getItem('algoliaUserToken')
      if (hasConsent) {
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
      } else {
        if (!isAuthenticated) {
          aa('setAuthenticatedUserToken', undefined)
        }
        if (storedToken) {
          window.localStorage.removeItem('algoliaUserToken')
        }
        if ((window as any).dataLayer) {
          window.dataLayer.push({ algoliaUserToken: randomToken })
          if (isAuthenticated) {
            window.dataLayer.push({ algoliaAuthenticatedUserToken: randomAuthToken })
          } else {
            window.dataLayer.push({ algoliaAuthenticatedUserToken: undefined })
          }
        }
      }
    }

    if (isAuthenticated && user && user.userId != null && hasConsent) {
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
  }, [isAuthenticated, user?.userId, hasConsent, randomToken])

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

    if (!mdScreen)
      return (
        <MobileHeader hideIcons={isHamburgerMenuVisible} isTransparentPage={isTransparentPage}>
          <Collapse in={isMobileSearchPortalVisible}>
            <Box
              height={'80px'}
              minHeight={'80px'} //According to designs
              sx={{ display: { xs: 'block', md: 'none' }, px: 1, mt: 1, padding: '18px' }}
            >
              {/* <SearchSuggestions
                isViewSearchPortal={isMobileSearchPortalVisible}
                onEnterSearch={() => toggleMobileSearchPortal()}
              /> */}
            </Box>
          </Collapse>
          <HamburgerMenu
            isDrawerOpen={isHamburgerMenuVisible}
            setIsDrawerOpen={() => toggleHamburgerMenu()}
            navLinks={navLinks}
            onAccountIconClick={handleAccountIconClick}
          />
        </MobileHeader>
      )

    return null
  }

  return (
    <>
      <AppBar
        position={isSticky ? 'sticky' : 'static'}
        sx={kiboHeaderStyles.appBarStyles}
        data-testid="header-container"
      >
        <Backdrop open={isBackdropOpen} data-testid="backdrop" />

        <Box component={'section'} sx={{ ...kiboHeaderStyles.topBarStyles }}>
          <Box sx={{ width: '100%' }}>{getSection()}</Box>
        </Box>

        <Box
          component={'section'}
          sx={{
            ...kiboHeaderStyles.megaMenuStyles,
          }}
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

export default KiboHeader
