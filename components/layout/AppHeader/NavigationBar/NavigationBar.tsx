import { useEffect, useState } from 'react'

import SearchIcon from '@mui/icons-material/Search'
import { Box } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

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

const NavigationBar = (props: any) => {
  const [scrolled, setScrolled] = useState(false)
  const { isCheckoutPage, onAccountIconClick } = props

  useEffect(() => {
    if (isCheckoutPage) {
      setScrolled(true)
      return
    }

    const buffer = 20
    const scrollThreshold = 70

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > scrollThreshold + buffer && !scrolled) {
        setScrolled(true)
      } else if (currentScrollY < scrollThreshold - buffer && scrolled) {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isCheckoutPage, scrolled])

  return (
    <Box sx={navWrapperStyles} className={scrolled ? 'scrolled' : ''}>
      <Box component="nav" sx={navInnerStyles}>
        {/* Logo — 115×30px exact Figma size */}
        <Box sx={logoStyles}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src={scrolled ? logoBlue : logo}
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
              <FortisMegaMenu scrolled={scrolled} />
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
                    color: scrolled ? '#111' : '#FFFFFF',
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
                  bgcolor: scrolled ? '#B5B5B5' : 'rgba(181,181,181,0.6)',
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
