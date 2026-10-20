import React from 'react'

import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { checkoutColors } from '@/components/checkout/checkoutStyles'

export interface ChoiceCardProps {
  selected: boolean
  onClick: () => void
  icon?: React.ReactNode
  primary?: boolean
  addNew?: boolean
  disabled?: boolean
  title?: string
  subtitle?: string
  errorText?: string
  testId?: string
}

const ChoiceCard = ({
  selected,
  onClick,
  icon,
  primary,
  addNew,
  disabled = false,
  title,
  subtitle,
  errorText,
  testId,
}: ChoiceCardProps) => {
  const { t } = useTranslation('common')
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      data-testid={testId}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        padding: '14px 20px',
        borderRadius: '12px',
        border: `1px solid ${selected ? checkoutColors.selectedBorder : checkoutColors.border}`,
        backgroundColor: selected ? checkoutColors.selectedBg : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          flexShrink: 0,
          backgroundColor: selected ? checkoutColors.selectedBorder : '#F0F0F0',
          color: selected ? '#fff' : checkoutColors.placeholder,
        }}
      >
        {addNew ? <AddIcon /> : icon}
      </Box>
      <Stack gap={0.25} flex={1} sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '15px',
              color: addNew ? checkoutColors.selectedBorder : checkoutColors.subtitle,
            }}
          >
            {addNew ? t('add-new') : title}
          </Typography>
          {primary && (
            <Chip
              label={t('primary')}
              size="small"
              sx={{
                backgroundColor: checkoutColors.selectedBg,
                color: checkoutColors.selectedBorder,
                fontWeight: 600,
                fontSize: '12px',
              }}
            />
          )}
        </Stack>
        {subtitle && (
          <Typography sx={{ fontSize: '13px', color: checkoutColors.placeholder }}>
            {subtitle}
          </Typography>
        )}
        {errorText && (
          <Typography sx={{ fontSize: '13px', color: 'error.main' }}>{errorText}</Typography>
        )}
      </Stack>
      {selected && <CheckCircleIcon sx={{ color: '#22C55E', flexShrink: 0 }} />}
    </Box>
  )
}

export default ChoiceCard
