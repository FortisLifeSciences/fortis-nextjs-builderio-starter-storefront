import React, { useEffect, useState } from 'react'

import InfoOutlined from '@mui/icons-material/InfoOutlined'
import {
  Box,
  Chip,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'next-i18next'

import { AccountPageHeader, AccountSectionCard, accountType } from '@/components/my-account/common'
import { useCustomerAttribute } from '@/hooks'

import type { CustomerAccount } from '@/lib/gql/types'

interface ShippingPreferenceTemplateProps {
  user: CustomerAccount
}

export const SHIPPING_ATTRIBUTE_FQN = {
  fedex: 'tenant~customer-fedex-account-number',
  ups: 'tenant~customer-ups-account-number',
  preferredMethod: 'tenant~customer-preferred-shipping-method',
}

export enum PreferredShippingMethod {
  FortisOvernight = 'fortis-overnight',
  Fedex = 'fedex',
  Ups = 'ups',
}

const styles = {
  methodOption: {
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: '0.5rem',
    padding: '0.25rem 1rem',
    marginBottom: '0.75rem',
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
    '& .MuiFormControlLabel-label': {
      ...accountType.body,
      fontWeight: 600,
    },
  },
  methodOptionSelected: {
    borderColor: 'primary.main',
  },
  accountHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  accountTitle: {
    ...accountType.body,
    fontWeight: 700,
  },
  primaryChip: {
    backgroundColor: 'success.light',
    color: 'success.dark',
    fontWeight: 600,
    borderRadius: '1rem',
  },
  callout: {
    backgroundColor: 'secondary.main',
    borderRadius: '0.5rem',
    padding: '0.875rem 1rem',
    marginBottom: '1rem',
  },
  calloutText: {
    typography: 'body2',
    color: 'primary.main',
  },
  fieldGroup: {
    marginBottom: '1.5rem',
  },
  fieldLabel: {
    ...accountType.body,
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
}

const ShippingPreferenceTemplate = (props: ShippingPreferenceTemplateProps) => {
  const { user } = props
  const { t } = useTranslation('common')

  const attributeParams = { userId: user?.userId, accountId: user?.id }

  const fedex = useCustomerAttribute({
    ...attributeParams,
    attributeFqn: SHIPPING_ATTRIBUTE_FQN.fedex,
  })
  const ups = useCustomerAttribute({
    ...attributeParams,
    attributeFqn: SHIPPING_ATTRIBUTE_FQN.ups,
  })
  const preferredMethod = useCustomerAttribute({
    ...attributeParams,
    attributeFqn: SHIPPING_ATTRIBUTE_FQN.preferredMethod,
  })

  const [fedexDraft, setFedexDraft] = useState('')
  const [upsDraft, setUpsDraft] = useState('')
  const [showFedexHelp, setShowFedexHelp] = useState(true)

  useEffect(() => setFedexDraft(fedex.value), [fedex.value])
  useEffect(() => setUpsDraft(ups.value), [ups.value])

  const selectedMethod = preferredMethod.value || PreferredShippingMethod.FortisOvernight

  const shippingMethods = [
    { value: PreferredShippingMethod.FortisOvernight, label: t('fortis-overnight-shipping') },
    { value: PreferredShippingMethod.Fedex, label: t('use-your-fedex-account') },
    { value: PreferredShippingMethod.Ups, label: t('use-your-ups-account') },
  ]

  const sanitizeAccountNumber = (value: string, maxLength: number) =>
    value.replace(/[^0-9]/g, '').slice(0, maxLength)

  return (
    <>
      <AccountPageHeader title={String(t('shipping-preference'))} />

      <AccountSectionCard title={String(t('preferred-shipping-methods'))}>
        <RadioGroup
          value={selectedMethod}
          onChange={(event) => preferredMethod.saveAttribute(event.target.value)}
        >
          {shippingMethods.map((method) => (
            <FormControlLabel
              key={method.value}
              value={method.value}
              control={<Radio />}
              label={method.label}
              sx={{
                ...styles.methodOption,
                ...(selectedMethod === method.value ? styles.methodOptionSelected : {}),
              }}
            />
          ))}
        </RadioGroup>
      </AccountSectionCard>

      <AccountSectionCard title={String(t('shipping-accounts'))}>
        <Box sx={{ ...styles.fieldGroup }}>
          <Box sx={{ ...styles.accountHeader }}>
            <Typography component="h3" sx={{ ...styles.accountTitle }}>
              FedEx
            </Typography>
            {selectedMethod === PreferredShippingMethod.Fedex && (
              <Chip label={t('primary')} size="small" sx={{ ...styles.primaryChip }} />
            )}
            <IconButton
              size="small"
              aria-label={String(t('where-to-find'))}
              aria-expanded={showFedexHelp}
              onClick={() => setShowFedexHelp(!showFedexHelp)}
              sx={{ marginLeft: 'auto', color: 'primary.main' }}
            >
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Box>

          {showFedexHelp && (
            <Box sx={{ ...styles.callout }}>
              <Typography component="p" sx={{ ...styles.calloutText }}>
                <strong>{t('where-to-find')}</strong> {t('fedex-account-help')}
              </Typography>
            </Box>
          )}

          <TextField
            variant="standard"
            fullWidth
            value={fedexDraft}
            label={t('ending')}
            onChange={(event) => setFedexDraft(sanitizeAccountNumber(event.target.value, 9))}
            onBlur={() => fedexDraft !== fedex.value && fedex.saveAttribute(fedexDraft)}
            inputProps={{ maxLength: 9, 'aria-label': `FedEx ${t('ending')}` }}
          />
        </Box>

        <Box>
          <Typography component="h3" sx={{ ...styles.fieldLabel }}>
            UPS
          </Typography>
          <TextField
            variant="standard"
            fullWidth
            value={upsDraft}
            placeholder={String(t('enter-your-ups-account-number'))}
            onChange={(event) => setUpsDraft(sanitizeAccountNumber(event.target.value, 6))}
            onBlur={() => upsDraft !== ups.value && ups.saveAttribute(upsDraft)}
            inputProps={{ maxLength: 6, 'aria-label': `UPS ${t('ending')}` }}
          />
        </Box>
      </AccountSectionCard>
    </>
  )
}

export default ShippingPreferenceTemplate
