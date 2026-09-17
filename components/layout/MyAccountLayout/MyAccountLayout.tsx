import React from 'react'

import { Box, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { MyAccountLayoutStyles } from './MyAccountLayout.styles'
import MyAccountSidebar from './MyAccountSidebar'

import type { CustomerAccount } from '@/lib/gql/types'

interface MyAccountLayoutProps {
  user?: CustomerAccount
  children: React.ReactNode
}

const MyAccountLayout = (props: MyAccountLayoutProps) => {
  const { user, children } = props
  const { t } = useTranslation('common')

  return (
    <Box sx={{ ...MyAccountLayoutStyles.container }}>
      <Typography
        component="nav"
        aria-label="breadcrumb"
        sx={{ ...MyAccountLayoutStyles.breadcrumb }}
      >
        <Box component={Link} href="/" sx={{ ...MyAccountLayoutStyles.breadcrumbLink }}>
          {t('home')}
        </Box>
        <Box component="span" aria-hidden="true">
          /
        </Box>
        <Box component="span">{t('my-account')}</Box>
      </Typography>

      <Grid container spacing={{ xs: 0, md: 4 }}>
        <Grid item xs={12} md={3}>
          <MyAccountSidebar user={user} />
        </Grid>
        <Grid item xs={12} md={9}>
          {children}
        </Grid>
      </Grid>
    </Box>
  )
}

export default MyAccountLayout
