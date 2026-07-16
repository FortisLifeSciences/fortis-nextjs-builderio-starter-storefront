import React, { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import { Box, IconButton } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import fortisLogoTransparent from '@/assets/fortislogo-transparent.png'
import fortisLogoBlue from '@/assets/fortisLogo.png'
import { CartIcon } from '@/components/layout'
import { HamburgerIcon } from '@/components/layout'
import AlgoliaAutocomplete from '@/components/layout/Algolia/AlgoliaAutocomplete'

interface MobileHeaderProps {
  children?: React.ReactNode
  hideIcons?: boolean
  onAccountIconClick?: () => void
  isTransparentPage?: boolean
}

// Legacy URL-based fallback used only when `isTransparentPage` is not passed in.
const TRANSPARENT_PAGES = ['/', '/new-home-page']

const MobileHeader = ({
  children,
  hideIcons = false,
  isTransparentPage: isTransparentPageProp,
}: MobileHeaderProps) => {
  const router = useRouter()
  const isTransparentPage =
    typeof isTransparentPageProp === 'boolean'
      ? isTransparentPageProp
      : TRANSPARENT_PAGES.includes(router.asPath.split('?')[0])
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    setHasScrolled(false)
  }, [router.asPath])

  useEffect(() => {
    if (!isTransparentPage) return

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
  }, [isTransparentPage])

  const showWhite = !isTransparentPage || hasScrolled
  const iconColor = showWhite ? '#30299A' : '#FFFFFF'

  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    setIsSearchOpen(false)
  }, [router.asPath])

  return (
    <>
      <Box
        className="fortis-mobile-header-slot"
        data-testid="mobile-header"
        sx={{
          width: '100%',
          height: '60px',
          display: hideIcons ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: '16px',
          boxSizing: 'border-box',
          backgroundColor: showWhite ? '#FFFFFF' : 'transparent',
          boxShadow: showWhite ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          transition: 'background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        }}
      >
        {/* Left: Search + Cart */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <IconButton
            size="small"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            sx={{ color: iconColor }}
            aria-label="Search"
          >
            {isSearchOpen ? <CloseIcon fontSize="medium" /> : <SearchIcon fontSize="medium" />}
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

      {isSearchOpen && (
        <Box
          sx={{
            width: '100%',
            px: '16px',
            py: '8px',
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFFE5',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            '& #autocomplete': { width: '100%' },
            '& .aa-Autocomplete': { width: '100%' },
            '& .aa-Form': {
              background: '#F5F5F5',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '100px',
              height: '42px',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              width: '100%',
              boxSizing: 'border-box',
            },
            '& .aa-InputWrapperPrefix': { display: 'none' },
            '& .aa-InputWrapper': { flex: 1, minWidth: 0 },
            '& .aa-Input': {
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#111',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '15px',
              width: '100%',
              height: '42px',
              '&::placeholder': { color: '#999' },
            },
            '& .aa-InputWrapperSuffix': { display: 'none' },
            '& .aa-Panel': {
              zIndex: 1400,
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            },
          }}
        >
          <AlgoliaAutocomplete />
        </Box>
      )}

      {children}
    </>
  )
}

export default MobileHeader
