import React from 'react'

import SearchIcon from '@mui/icons-material/Search'
import { Grid } from '@mui/material'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import fortisLogo from '@/assets/fortisLogo.png'
import { HeaderAction, KiboLogo } from '@/components/common'
import { HamburgerIcon, CartIcon } from '@/components/layout'
import { useHeaderContext } from '@/context'

interface MobileHeaderProps {
  children?: React.ReactNode
  hideIcons?: boolean
}

const MobileHeaderStyles = {
  topBar: {
    height: '8px',
    width: '100%',
    backgroundColor: 'secondary.main',
  },
  container: {
    width: '100%',
    backgroundColor: 'common.white',
    height: '52px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0px !important',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0px !important',
  },
}

const MobileHeader = ({ children, hideIcons = false }: MobileHeaderProps) => {
  const { toggleMobileSearchPortal } = useHeaderContext()
  const { t } = useTranslation('common')

  return (
    <>
      <Grid container>
        <Grid item xs={12} sx={MobileHeaderStyles.topBar}></Grid>
        <Grid
          item
          xs={12}
          container
          spacing={2}
          data-testid="mobile-header"
          sx={{ ...MobileHeaderStyles.container, display: hideIcons ? 'none' : 'inherit' }}
        >
          <Grid item xs={1.5} sx={MobileHeaderStyles.item}>
            <HeaderAction
              title={t('search')}
              icon={SearchIcon}
              iconFontSize={'medium'}
              mobileIconColor="#30299A"
              onClick={() => toggleMobileSearchPortal()}
              data-testid="mobile-header-search-icon"
            />
          </Grid>
          <Grid item xs={1.5} sx={MobileHeaderStyles.item}>
            <CartIcon size="medium" mobileIconColor="black" data-testid="mobile-header-cart-icon" />
          </Grid>
          <Grid item xs={6} sx={MobileHeaderStyles.item}>
            <Link href="/" passHref>
              <KiboLogo mobile logo={fortisLogo} />
            </Link>
          </Grid>
          <Grid item xs={1.5} sx={MobileHeaderStyles.item}>
            {/* Empty slot */}
          </Grid>
          <Grid item xs={1.5} sx={MobileHeaderStyles.item}>
            <HamburgerIcon
              size="medium"
              mobileIconColor="#30299A"
              isElementVisible={true}
              data-testid="mobile-header-hamburger-icon"
            />
          </Grid>
        </Grid>
      </Grid>

      {children}
    </>
  )
}

export default MobileHeader
