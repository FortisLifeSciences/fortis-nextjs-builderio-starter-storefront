import React from 'react'

import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined'
import { Box, Chip, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { AccountItemMenu, accountType } from '@/components/my-account/common'
import type { AccountItemMenuAction } from '@/components/my-account/common'
import { cardGetters } from '@/lib/getters'
import type { PaymentAndBilling } from '@/lib/types'

interface SavedCardRowProps {
  paymentAndBilling: PaymentAndBilling
  actions: AccountItemMenuAction[]
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '0.75rem',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    borderRadius: '0.375rem',
    backgroundColor: 'grey.100',
    color: 'text.secondary',
    flexShrink: 0,
  },
  cardTitle: {
    ...accountType.body,
    color: 'text.primary',
  },
  meta: {
    typography: 'body2',
    color: 'text.secondary',
  },
  primaryChip: {
    backgroundColor: 'secondary.main',
    color: 'primary.main',
    fontWeight: 600,
    borderRadius: '1rem',
  },
  expiringChip: {
    backgroundColor: 'warning.main',
    color: 'text.primary',
    fontWeight: 600,
    borderRadius: '0.25rem',
    marginTop: '0.5rem',
  },
}

const SavedCardRow = (props: SavedCardRowProps) => {
  const { paymentAndBilling, actions } = props
  const { t } = useTranslation('common')

  const { cardInfo, billingAddressInfo } = paymentAndBilling

  const cardType = cardGetters.getCardType(cardInfo)
  const cardNumberPart = cardGetters.getCardNumberPart(cardInfo)
  const isPrimary = cardGetters.getIsDefaultPayMethod(cardInfo)
  const isExpiringSoon = cardGetters.getIsExpiringSoon(cardInfo)
  const billingName = billingAddressInfo?.contact?.companyOrOrganization

  return (
    <Box sx={{ ...styles.row }}>
      <Box sx={{ ...styles.iconWrapper }}>
        <CreditCardOutlined fontSize="small" />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography component="p" sx={{ ...styles.cardTitle }}>
          {cardType} {t('ending')} <strong>{cardNumberPart}</strong>
        </Typography>
        <Typography component="p" sx={{ ...styles.meta }}>
          {t('expires')} {cardGetters.getExpireDate(cardInfo)}
        </Typography>
        {billingName && (
          <Typography component="p" sx={{ ...styles.meta }}>
            {t('billing')}: {billingName}
          </Typography>
        )}
        {isExpiringSoon && (
          <Chip label={t('expires-soon')} size="small" sx={{ ...styles.expiringChip }} />
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {isPrimary && <Chip label={t('primary')} size="small" sx={{ ...styles.primaryChip }} />}
        <AccountItemMenu
          actions={actions}
          ariaLabel={`${t('actions')} ${cardType} ${cardNumberPart}`}
        />
      </Box>
    </Box>
  )
}

export default SavedCardRow
