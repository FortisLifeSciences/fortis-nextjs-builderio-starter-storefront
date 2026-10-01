import React from 'react'

import { Box, Chip, Grid, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { AccountItemMenu, accountType } from '@/components/my-account/common'
import type { AccountItemMenuAction } from '@/components/my-account/common'

import type { CuAddress, CustomerContact } from '@/lib/gql/types'

interface AddressDisplayCardProps {
  customerContact: CustomerContact
  isDefault: boolean
  actions: AccountItemMenuAction[]
}

const styles = {
  card: {
    position: 'relative',
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: '0.75rem',
    backgroundColor: 'common.white',
    padding: { xs: '1.25rem', md: '1.5rem' },
    marginBottom: '1.5rem',
  },
  menuAnchor: {
    position: 'absolute',
    top: { xs: '0.75rem', md: '1rem' },
    right: { xs: '0.75rem', md: '1rem' },
  },
  addressLabel: {
    ...accountType.cardTitle,
    fontWeight: 700,
    color: 'text.primary',
    lineHeight: 1.3,
  },
  defaultChip: {
    marginTop: '0.75rem',
    borderRadius: '1rem',
    borderColor: 'primary.main',
    color: 'primary.main',
    fontWeight: 600,
  },
  fieldLabel: {
    typography: 'caption',
    color: 'text.secondary',
    display: 'block',
  },
  fieldValue: {
    ...accountType.body,
    color: 'text.primary',
  },
  fieldGroup: {
    marginBottom: '1rem',
  },
}

export const getAddressDisplayName = (customerContact: CustomerContact) =>
  customerContact?.label || customerContact?.companyOrOrganization || ''

const AddressDisplayCard = (props: AddressDisplayCardProps) => {
  const { customerContact, isDefault, actions } = props
  const { t } = useTranslation('common')

  const { firstName, lastNameOrSurname, email, phoneNumbers, address } = customerContact
  const { address1, address2, cityOrTown, stateOrProvince, postalOrZipCode, countryCode } =
    (address ?? {}) as CuAddress

  const recipient = [firstName, lastNameOrSurname].filter(Boolean).join(' ')
  const cityLine = [
    [cityOrTown, stateOrProvince].filter(Boolean).join(', '),
    postalOrZipCode,
    countryCode,
  ]
    .filter(Boolean)
    .join(', ')
  const phone = phoneNumbers?.home || phoneNumbers?.work || phoneNumbers?.mobile

  return (
    <Box sx={{ ...styles.card }}>
      <Box sx={{ ...styles.menuAnchor }}>
        <AccountItemMenu
          actions={actions}
          ariaLabel={`${t('actions')} ${getAddressDisplayName(customerContact)}`}
        />
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={4}>
          <Typography component="h2" sx={{ ...styles.addressLabel }}>
            {getAddressDisplayName(customerContact)}
          </Typography>
          {isDefault && (
            <Chip
              label={t('default')}
              size="small"
              variant="outlined"
              sx={{ ...styles.defaultChip }}
            />
          )}
        </Grid>

        <Grid item xs={12} md={8} sx={{ paddingRight: { md: '2.5rem' } }}>
          <Box sx={{ ...styles.fieldGroup }}>
            <Typography component="span" sx={{ ...styles.fieldLabel }}>
              {t('recipient')}
            </Typography>
            <Typography component="p" sx={{ ...styles.fieldValue, fontWeight: 700 }}>
              {recipient}
            </Typography>
          </Box>

          <Box sx={{ ...styles.fieldGroup }}>
            <Typography component="span" sx={{ ...styles.fieldLabel }}>
              {t('ship-to')}
            </Typography>
            <Typography component="p" sx={{ ...styles.fieldValue }}>
              {address1}
            </Typography>
            {address2 && (
              <Typography component="p" sx={{ ...styles.fieldValue }}>
                {address2}
              </Typography>
            )}
            <Typography component="p" sx={{ ...styles.fieldValue }}>
              {cityLine}
            </Typography>
          </Box>

          <Box>
            <Typography component="span" sx={{ ...styles.fieldLabel }}>
              {t('contact')}
            </Typography>
            {phone && (
              <Typography component="p" sx={{ ...styles.fieldValue }}>
                {phone}
              </Typography>
            )}
            {email && (
              <Typography component="p" sx={{ ...styles.fieldValue }}>
                {email}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AddressDisplayCard
