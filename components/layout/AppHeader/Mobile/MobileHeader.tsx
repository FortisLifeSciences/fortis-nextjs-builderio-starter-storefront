import React, { useEffect, useState } from 'react'

import SearchIcon from '@mui/icons-material/Search'
import { Box, IconButton } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import fortisLogoTransparent from '@/assets/fortislogo-transparent.png'
import fortisLogoBlue from '@/assets/fortisLogo.png'
import { CartIcon } from '@/components/layout'
import { HamburgerIcon } from '@/components/layout'

interface MobileHeaderProps {
  children?: React.ReactNode
  hideIcons?: boolean
  onAccountIconClick?: () => void
}

const TRANSPARENT_PAGES = ['/', '/new-home-page']

const MobileHeader = ({ children, hideIcons = false }: MobileHeaderProps) => {
  const router = useRouter()
  const isTransparentPage = TRANSPARENT_PAGES.includes(router.asPath.split('?')[0])
  const [hasScrolled, setHasScrolled] = useState(false)

  // Reset scroll tracking on route change
  useEffect(() => {
    setHasScrolled(false)
  }, [router.asPath])

  useEffect(() => {
    if (!isTransparentPage) return

    const buffer = 20
    const scrollThreshold = 50

    const handleScroll = () => {
      const y = window.scrollY
      if (y > scrollThreshold + buffer) setHasScrolled(true)
      else if (y < scrollThreshold - buffer) setHasScrolled(false)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isTransparentPage])

  const showWhite = !isTransparentPage || hasScrolled
  const iconColor = showWhite ? '#30299A' : '#FFFFFF'

  return (
    <>
      <Box
        data-testid="mobile-header"
        sx={{
          width: '100%',
          height: '60px',
          display: hideIcons ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: '16px',
          boxSizing: 'border-box',
          backgroundColor: showWhite ? '#FFFFFFE5' : 'transparent',
          boxShadow: showWhite ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          transition: 'background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        }}
      >
        {/* Left: Search + Cart */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <IconButton
            size="small"
            onClick={() => router.push('/search')}
            sx={{ color: iconColor }}
            aria-label="Search"
          >
            <SearchIcon fontSize="medium" />
          </IconButton>
          <Box sx={{ '& svg path': { fill: iconColor }, '& svg': { color: iconColor } }}>
            <CartIcon size="medium" mobileIconColor={iconColor} />
          </Box>
        </Box>

        {/* Center: Logo */}
        <Link
          href="/"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Image
            src={showWhite ? fortisLogoBlue : fortisLogoTransparent}
            alt="Fortis Life Sciences"
            width={100}
            height={26}
            priority
          />
        </Link>

        {/* Right: Hamburger */}
        <Box sx={{ '& svg': { color: iconColor }, '& svg path': { fill: iconColor } }}>
          <HamburgerIcon
            size="medium"
            mobileIconColor={iconColor}
            isElementVisible={true}
            data-testid="mobile-header-hamburger-icon"
          />
        </Box>
      </Box>

      {children}
    </>
  )
}

export default MobileHeader
