import { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import { Box } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import {
  iconGroupStyles,
  logoStyles,
  navInnerStyles,
  navLinksStyles,
  navRightContainerStyles,
  navWrapperStyles,
  searchWrapperStyles,
} from './NavigationBar.styles'
import FortisMegaMenu from '../FortisMegaMenu/FortisMegaMenu'
import logo from '@/assets/fortislogo-transparent.png'
import logoBlue from '@/assets/fortisLogo.png'
import AlgoliaAutocomplete from '@/components/layout/Algolia/AlgoliaAutocomplete'
import AccountIcon from '@/components/layout/AppHeader/Icons/AccountIcon/AccountIcon'
import CartIcon from '@/components/layout/AppHeader/Icons/CartIcon/CartIcon'

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

const NavigationBar = (props: any) => {
  const router = useRouter()
  const { isCheckoutPage, onAccountIconClick, isTransparentPage: isTransparentPageProp } = props
  const isTransparentPage =
    typeof isTransparentPageProp === 'boolean'
      ? isTransparentPageProp
      : TRANSPARENT_PAGES.includes(router.asPath.split('?')[0])
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    setHasScrolled(false)
  }, [router.asPath])

  useEffect(() => {
    if (!isTransparentPage || isCheckoutPage) return

    // Place a sentinel at the top of #main-content.
    // IntersectionObserver fires when it exits the viewport regardless of scroll container.
    const target = document.getElementById('main-content') || document.body
    const sentinel = document.createElement('div')
    sentinel.style.cssText =
      'position:absolute;top:80px;left:0;height:1px;width:1px;pointer-events:none;z-index:-1;'
    target.prepend(sentinel)

    const observer = new IntersectionObserver(([entry]) => setHasScrolled(!entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [isCheckoutPage, isTransparentPage])

  const showWhite = !isTransparentPage || isCheckoutPage || hasScrolled
  const iconColor = showWhite ? '#111' : '#FFFFFF'

  const [hasQuery, setHasQuery] = useState(false)

  useEffect(() => {
    const el = document.querySelector<HTMLInputElement>('#autocomplete input')
    if (!el) return
    const onInput = () => setHasQuery(el.value.length > 0)
    el.addEventListener('input', onInput)
    return () => el.removeEventListener('input', onInput)
  })

  const clearSearch = () => {
    const el = document.querySelector<HTMLInputElement>('#autocomplete input')
    if (!el) return
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(el, '')
    el.dispatchEvent(new Event('input', { bubbles: true }))
    setHasQuery(false)
  }

  return (
    <Box
      sx={{
        ...navWrapperStyles,
        backgroundColor: showWhite ? '#FFFFFF' : 'transparent',
        boxShadow: showWhite ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
      }}
      className={showWhite ? 'scrolled' : ''}
    >
      <Box component="nav" sx={navInnerStyles}>
        {/* Logo — 115×30px exact Figma size */}
        <Box sx={logoStyles}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src={showWhite ? logoBlue : logo}
              alt="Fortis Life Sciences"
              width={115}
              height={30}
              priority
            />
          </Link>
        </Box>

        {/* Right group: nav links + search + icons */}
        {!isCheckoutPage && (
          <Box sx={navRightContainerStyles}>
            {/* Nav links */}
            <Box sx={navLinksStyles}>
              <FortisMegaMenu scrolled={showWhite} />
            </Box>

            {/* Search — pill ghost with plain icon */}
            <Box sx={searchWrapperStyles}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  width: '100%',
                  minWidth: 0,
                  overflow: 'hidden',
                  '& > #autocomplete': { width: '100%', minWidth: 0, flex: '1 1 auto' },
                }}
              >
                {hasQuery ? (
                  <CloseIcon
                    onClick={clearSearch}
                    sx={{
                      position: 'absolute',
                      left: '20px',
                      zIndex: 1,
                      fontSize: '20px',
                      color: iconColor,
                      cursor: 'pointer',
                    }}
                  />
                ) : (
                  <SearchIcon
                    sx={{
                      position: 'absolute',
                      left: '20px',
                      zIndex: 1,
                      fontSize: '20px',
                      color: iconColor,
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <AlgoliaAutocomplete detachedMediaQuery="none" />
              </Box>
            </Box>

            {/* Divider + Cart + Account */}
            <Box sx={iconGroupStyles} className="nav-right-icons">
              <Box
                sx={{
                  width: '1px',
                  height: '32px',
                  bgcolor: showWhite ? '#B5B5B5' : 'rgba(181,181,181,0.6)',
                }}
              />
              <CartIcon size="medium" />
              <button
                aria-label="Login"
                onClick={onAccountIconClick}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
              >
                <AccountIcon size="medium" onAccountIconClick={onAccountIconClick} />
              </button>
            </Box>

            {/* Contact CTA button */}
            <Link href="/contact-us" passHref legacyBehavior>
              <Box
                component="a"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: { xs: '12px', md: '20px' },
                  py: { xs: '8px', md: '10px' },
                  bgcolor: '#30299A',
                  color: '#FFFFFF',
                  borderRadius: '0px 20px 0px 20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  fontSize: { xs: '13px', md: '15px' },
                  lineHeight: '150%',
                  letterSpacing: '-0.005em',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  flexShrink: 0,
                  cursor: 'pointer !important',
                  '&:hover': { bgcolor: 'rgb(10, 17, 56)', cursor: 'pointer !important' },
                }}
              >
                Contact
              </Box>
            </Link>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default NavigationBar
