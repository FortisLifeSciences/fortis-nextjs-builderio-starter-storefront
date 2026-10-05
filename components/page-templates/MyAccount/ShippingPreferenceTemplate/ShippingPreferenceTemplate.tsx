import React, { useEffect, useState } from 'react'

import InfoOutlined from '@mui/icons-material/InfoOutlined'
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'next-i18next'

import { AccountPageHeader, AccountSectionCard, accountType } from '@/components/my-account/common'
import { useSnackbarContext } from '@/context'
import { useCustomerAttribute } from '@/hooks'

import type { CustomerAccount } from '@/lib/gql/types'

interface ShippingPreferenceTemplateProps {
  user: CustomerAccount
}

export const SHIPPING_ATTRIBUTE_FQN = {
  fedex: 'tenant~customer-fedex-account-number',
  ups: 'tenant~customer-ups-account-number',
  shippingMethod: 'tenant~shipping-method',
}

export enum PreferredShippingMethod {
  FortisOvernight = 'fortis-overnight',
  Fedex = 'fedex',
  Ups = 'ups',
}

const FEDEX_ACCOUNT_METHOD_NAME = 'FedEx Account'
const UPS_ACCOUNT_METHOD_NAME = 'UPS Account'

const SHIPPING_METHOD_ATTRIBUTE_VALUE: Record<PreferredShippingMethod, string> = {
  [PreferredShippingMethod.FortisOvernight]: 'Fortis Overnight',
  [PreferredShippingMethod.Fedex]: FEDEX_ACCOUNT_METHOD_NAME,
  [PreferredShippingMethod.Ups]: UPS_ACCOUNT_METHOD_NAME,
}

const getPreferredShippingMethod = (shippingMethodName: string) => {
  if (shippingMethodName.includes(FEDEX_ACCOUNT_METHOD_NAME)) return PreferredShippingMethod.Fedex
  if (shippingMethodName.includes(UPS_ACCOUNT_METHOD_NAME)) return PreferredShippingMethod.Ups
  return PreferredShippingMethod.FortisOvernight
}

const FEDEX_ACCOUNT_LENGTH = 9
const UPS_ACCOUNT_LENGTH = 6

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
  fieldActions: {
    marginTop: '0.75rem',
  },
}

const ShippingPreferenceTemplate = (props: ShippingPreferenceTemplateProps) => {
  const { user } = props
  const { t } = useTranslation('common')
  const { showSnackbar } = useSnackbarContext()

  const attributeParams = { userId: user?.userId, accountId: user?.id }

  const fedex = useCustomerAttribute({
    ...attributeParams,
    attributeFqn: SHIPPING_ATTRIBUTE_FQN.fedex,
  })
  const ups = useCustomerAttribute({
    ...attributeParams,
    attributeFqn: SHIPPING_ATTRIBUTE_FQN.ups,
  })
  const shippingMethod = useCustomerAttribute({
    ...attributeParams,
    attributeFqn: SHIPPING_ATTRIBUTE_FQN.shippingMethod,
  })

  const [fedexDraft, setFedexDraft] = useState('')
  const [upsDraft, setUpsDraft] = useState('')
  const [fedexError, setFedexError] = useState('')
  const [upsError, setUpsError] = useState('')
  const [showFedexHelp, setShowFedexHelp] = useState(true)

  useEffect(() => setFedexDraft(fedex.value), [fedex.value])
  useEffect(() => setUpsDraft(ups.value), [ups.value])

  const selectedMethod = getPreferredShippingMethod(shippingMethod.value)

  const shippingMethods = [
    { value: PreferredShippingMethod.FortisOvernight, label: t('fortis-overnight-shipping') },
    { value: PreferredShippingMethod.Fedex, label: t('use-your-fedex-account') },
    { value: PreferredShippingMethod.Ups, label: t('use-your-ups-account') },
  ]

  const sanitizeAccountNumber = (value: string, maxLength: number) =>
    value.replace(/[^0-9]/g, '').slice(0, maxLength)

  const handleMethodChange = async (method: PreferredShippingMethod) => {
    const isSaved = await shippingMethod.saveAttribute(SHIPPING_METHOD_ATTRIBUTE_VALUE[method])
    showSnackbar(
      String(isSaved ? t('shipping-preference-saved') : t('something-went-wrong')),
      isSaved ? 'success' : 'error'
    )
  }

  const handleSaveAccount = async (
    draft: string,
    requiredLength: number,
    lengthErrorKey: string,
    setError: (message: string) => void,
    save: (value: string) => Promise<boolean | undefined>
  ) => {
    if (draft && draft.length !== requiredLength) {
      setError(String(t(lengthErrorKey)))
      return
    }

    setError('')

    const isSaved = await save(draft)
    showSnackbar(
      String(isSaved ? t('shipping-account-saved') : t('something-went-wrong')),
      isSaved ? 'success' : 'error'
    )
  }

  const isFedexDirty = fedexDraft !== fedex.value
  const isUpsDirty = upsDraft !== ups.value

  return (
    <>
      <AccountPageHeader title={String(t('shipping-preference'))} />

      <AccountSectionCard title={String(t('preferred-shipping-methods'))}>
        <RadioGroup
          value={selectedMethod}
          onChange={(event) => handleMethodChange(event.target.value as PreferredShippingMethod)}
        >
          {shippingMethods.map((method) => (
            <FormControlLabel
              key={method.value}
              value={method.value}
              control={<Radio />}
              label={method.label}
              disabled={shippingMethod.isSaving}
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
            error={Boolean(fedexError)}
            helperText={fedexError}
            onChange={(event) => {
              setFedexDraft(sanitizeAccountNumber(event.target.value, FEDEX_ACCOUNT_LENGTH))
              setFedexError('')
            }}
            inputProps={{ maxLength: FEDEX_ACCOUNT_LENGTH, 'aria-label': `FedEx ${t('ending')}` }}
          />

          <Stack direction="row" spacing={1} sx={{ ...styles.fieldActions }}>
            <Button
              variant="contained"
              size="small"
              disabled={!isFedexDirty || fedex.isSaving}
              onClick={() =>
                handleSaveAccount(
                  fedexDraft,
                  FEDEX_ACCOUNT_LENGTH,
                  'fedex-account-number-length',
                  setFedexError,
                  fedex.saveAttribute
                )
              }
            >
              {t('save')}
            </Button>
            <Button
              variant="text"
              size="small"
              disabled={!isFedexDirty || fedex.isSaving}
              onClick={() => {
                setFedexDraft(fedex.value)
                setFedexError('')
              }}
            >
              {t('cancel')}
            </Button>
          </Stack>
        </Box>

        <Box>
          <Box sx={{ ...styles.accountHeader }}>
            <Typography component="h3" sx={{ ...styles.accountTitle }}>
              UPS
            </Typography>
            {selectedMethod === PreferredShippingMethod.Ups && (
              <Chip label={t('primary')} size="small" sx={{ ...styles.primaryChip }} />
            )}
          </Box>
          <TextField
            variant="standard"
            fullWidth
            value={upsDraft}
            placeholder={String(t('enter-your-ups-account-number'))}
            error={Boolean(upsError)}
            helperText={upsError}
            onChange={(event) => {
              setUpsDraft(sanitizeAccountNumber(event.target.value, UPS_ACCOUNT_LENGTH))
              setUpsError('')
            }}
            inputProps={{ maxLength: UPS_ACCOUNT_LENGTH, 'aria-label': `UPS ${t('ending')}` }}
          />

          <Stack direction="row" spacing={1} sx={{ ...styles.fieldActions }}>
            <Button
              variant="contained"
              size="small"
              disabled={!isUpsDirty || ups.isSaving}
              onClick={() =>
                handleSaveAccount(
                  upsDraft,
                  UPS_ACCOUNT_LENGTH,
                  'ups-account-number-length',
                  setUpsError,
                  ups.saveAttribute
                )
              }
            >
              {t('save')}
            </Button>
            <Button
              variant="text"
              size="small"
              disabled={!isUpsDirty || ups.isSaving}
              onClick={() => {
                setUpsDraft(ups.value)
                setUpsError('')
              }}
            >
              {t('cancel')}
            </Button>
          </Stack>
        </Box>
      </AccountSectionCard>
    </>
  )
}

export default ShippingPreferenceTemplate
