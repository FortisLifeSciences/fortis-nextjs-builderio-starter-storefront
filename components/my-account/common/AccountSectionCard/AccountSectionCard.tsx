import React from 'react'

import { Box, Grid, Typography } from '@mui/material'

import { accountType } from '../accountTypography'

interface AccountSectionCardProps {
  title: string
  titleAdornment?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}

const styles = {
  card: {
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: '0.75rem',
    backgroundColor: 'common.white',
    padding: { xs: '1.25rem', md: '1.5rem' },
    marginBottom: '1.5rem',
  },
  title: {
    ...accountType.cardTitle,
    fontWeight: 700,
    color: 'text.primary',
  },
}

const AccountSectionCard = (props: AccountSectionCardProps) => {
  const { title, titleAdornment, action, children } = props

  return (
    <Box sx={{ ...styles.card }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={4}>
          <Typography component="h2" sx={{ ...styles.title }}>
            {title}
          </Typography>
          {titleAdornment}
          {action && <Box sx={{ marginTop: '1rem' }}>{action}</Box>}
        </Grid>
        <Grid item xs={12} md={8}>
          {children}
        </Grid>
      </Grid>
    </Box>
  )
}

export default AccountSectionCard
