import React from 'react'

import { Box, Typography } from '@mui/material'

import { accountType } from '../accountTypography'

interface AccountPageHeaderProps {
  title: string
  action?: React.ReactNode
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'flex-start', sm: 'center' },
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  title: {
    ...accountType.pageTitle,
    color: 'text.primary',
  },
}

const AccountPageHeader = (props: AccountPageHeaderProps) => {
  const { title, action } = props

  return (
    <Box sx={{ ...styles.wrapper }}>
      <Typography variant="h1" component="h1" sx={{ ...styles.title }}>
        {title}
      </Typography>
      {action}
    </Box>
  )
}

export default AccountPageHeader
