import { useEffect, useState } from 'react'

import { Box } from '@mui/material'
import Link from 'next/link'

import { logoStyles, navbarStyles, navMenuStyles } from './NavigationBar.styles'
import FortisMegaMenu from '../FortisMegaMenu/FortisMegaMenu'
import logo from '@/assets/fortisLogo.png'
import { KiboLogo } from '@/components/common'

const NavigationBar = (props: any) => {
  const [scrolled, setScrolled] = useState(false)
  const { isCheckoutPage } = props

  useEffect(() => {
    // If it's a checkout page, force the `scrolled` state to true and exit
    if (isCheckoutPage) {
      setScrolled(true)
      return
    }

    // Normal scroll behavior for non-checkout pages
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

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isCheckoutPage, scrolled]) // Listen for changes to `isCheckoutPage` and `scrolled`

  return (
    <Box component="nav" sx={navbarStyles} className={scrolled ? 'scrolled' : ''}>
      <Box component="section" sx={logoStyles}>
        <Link href="/">
          <KiboLogo logo={logo} small={scrolled} />
        </Link>
      </Box>
      <Box component="ul" sx={navMenuStyles}>
        {!isCheckoutPage && <FortisMegaMenu scrolled={scrolled} />}
      </Box>
    </Box>
  )
}

export default NavigationBar
