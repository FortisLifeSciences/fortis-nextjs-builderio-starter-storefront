import React from 'react'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, Stack, Typography } from '@mui/material'

import { checkoutColors } from '@/components/checkout/checkoutStyles'

export interface PaymentOptionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

// Selectable "Card" / "Purchase Order" tile used by both guest checkout and the
// logged-in PO checkout - kept as one component so the two stay visually identical.
const PaymentOptionCard = (props: PaymentOptionCardProps) => {
  const { icon, title, description, selected = false, disabled = false, onClick } = props
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        flex: 1,
        padding: '16px',
        borderRadius: '12px',
        border: `1px solid ${selected ? checkoutColors.selectedBorder : checkoutColors.border}`,
        backgroundColor: selected ? checkoutColors.selectedBg : '#fff',
        cursor: disabled ? 'pointer' : onClick ? 'pointer' : 'default',
        opacity: disabled ? 0.6 : 1,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          color: selected ? checkoutColors.selectedBorder : checkoutColors.placeholder,
          mt: 0.25,
        }}
      >
        {icon}
      </Box>
      <Stack gap={0.25} flex={1}>
        <Typography sx={{ fontWeight: 600, fontSize: '15px', color: checkoutColors.subtitle }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: '13px', color: checkoutColors.placeholder }}>
          {description}
        </Typography>
      </Stack>
      {selected && (
        <CheckCircleIcon sx={{ color: '#22C55E', position: 'absolute', top: 12, right: 12 }} />
      )}
    </Box>
  )
}

export default PaymentOptionCard
