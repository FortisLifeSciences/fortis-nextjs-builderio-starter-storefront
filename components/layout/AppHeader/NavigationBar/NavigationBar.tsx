import { useEffect, useState } from 'react'

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
  const { isCheckoutPage, onAccountIconClick } = props
  const isTransparentPage = TRANSPARENT_PAGES.includes(router.asPath.split('?')[0])
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

  return (
    <Box
      sx={{
        ...navWrapperStyles,
        backgroundColor: showWhite ? '#FFFFFFE5' : 'transparent',
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
              <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <SearchIcon
                  sx={{
                    position: 'absolute',
                    left: '20px',
                    zIndex: 1,
                    fontSize: '20px',
                    color: showWhite ? '#111' : '#FFFFFF',
                    pointerEvents: 'none',
                  }}
                />
                <AlgoliaAutocomplete />
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
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default NavigationBar
