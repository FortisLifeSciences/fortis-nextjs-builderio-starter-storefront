import React from 'react'

import { Box, Typography } from '@mui/material'

import { accountType } from '../accountTypography'

interface InlineFieldProps {
  label: string
  value?: React.ReactNode
  action?: React.ReactNode
  children?: React.ReactNode
  last?: boolean
}

const styles = {
  wrapper: {
    paddingBottom: '0.75rem',
    marginBottom: '1rem',
    borderBottom: '1px solid',
    borderColor: 'grey.300',
  },
  wrapperLast: {
    marginBottom: 0,
  },
  label: {
    typography: 'caption',
    fontWeight: 600,
    color: 'text.primary',
    display: 'block',
    marginBottom: '0.375rem',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  value: {
    ...accountType.body,
    color: 'text.primary',
  },
}

const InlineField = (props: InlineFieldProps) => {
  const { label, value, action, children, last } = props

  return (
    <Box sx={{ ...styles.wrapper, ...(last ? styles.wrapperLast : {}) }}>
      <Typography component="span" sx={{ ...styles.label }}>
        {label}
      </Typography>
      {children ?? (
        <Box sx={{ ...styles.row }}>
          <Typography component="span" sx={{ ...styles.value }}>
            {value}
          </Typography>
          {action}
        </Box>
      )}
    </Box>
  )
}

export default InlineField
