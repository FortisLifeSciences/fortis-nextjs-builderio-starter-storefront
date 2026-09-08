import React from 'react'

import { Box, Stack, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { checkoutColors } from '@/components/checkout/checkoutStyles'
import { orderGetters } from '@/lib/getters'

import type { CrOrder } from '@/lib/gql/types'

export interface ContactShippingSummaryProps {
  checkout: CrOrder
  onEdit: () => void
}

// Read-only "already collected" view of the contact & shipping details - shown once the
// shopper has moved past that step, in both guest checkout and the logged-in PO checkout.
const ContactShippingSummary = (props: ContactShippingSummaryProps) => {
  const { checkout, onEdit } = props
  const { t } = useTranslation('common')
  const contact = orderGetters.getShippingContact(checkout)
  const shippingMethodName = orderGetters.getShippingMethodName(checkout)
  const address = contact?.address

  return (
    <Stack gap={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography sx={{ fontWeight: 700, fontSize: '28px', color: checkoutColors.heading }}>
          {t('contact-and-shipping')}
        </Typography>
        <Typography
          onClick={onEdit}
          sx={{
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '15px',
            color: checkoutColors.selectedBorder,
          }}
        >
          {t('edit')}
        </Typography>
      </Stack>
      <Box
        sx={{
          border: `1px solid ${checkoutColors.border}`,
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <Stack gap={0.25}>
          <Typography sx={{ fontWeight: 600, fontSize: '15px', color: checkoutColors.subtitle }}>
            {contact?.firstName} {contact?.lastNameOrSurname}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: checkoutColors.body }}>
            {contact?.email}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: checkoutColors.body }}>
            {contact?.phoneNumbers?.home}
          </Typography>
          {contact?.companyOrOrganization && (
            <Typography sx={{ fontSize: '14px', color: checkoutColors.body }}>
              {contact.companyOrOrganization}
            </Typography>
          )}
          {address?.address1 && (
            <Typography sx={{ fontSize: '14px', color: checkoutColors.body }}>
              {address.address1}
            </Typography>
          )}
          {address?.address2 && (
            <Typography sx={{ fontSize: '14px', color: checkoutColors.body }}>
              {address.address2}
            </Typography>
          )}
          {(address?.cityOrTown || address?.stateOrProvince || address?.postalOrZipCode) && (
            <Typography sx={{ fontSize: '14px', color: checkoutColors.placeholder }}>
              {[address?.cityOrTown, address?.stateOrProvince, address?.countryCode]
                .filter(Boolean)
                .join(', ')}{' '}
              {address?.postalOrZipCode}
            </Typography>
          )}
        </Stack>
        {shippingMethodName && (
          <Stack gap={0.25} sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: '13px', color: checkoutColors.placeholder }}>
              {t('shipping-method')}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: checkoutColors.subtitle }}>
              {shippingMethodName}
            </Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  )
}

export default ContactShippingSummary
