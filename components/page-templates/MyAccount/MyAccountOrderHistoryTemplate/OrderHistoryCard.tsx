import React, { useState } from 'react'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Chip, Divider, Grid, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { AccountItemMenu, accountType } from '@/components/my-account/common'
import type { AccountItemMenuAction } from '@/components/my-account/common'
import { orderGetters } from '@/lib/getters'

import type { CrAddress, CrOrder, CrOrderItem } from '@/lib/gql/types'

interface OrderHistoryCardProps {
  order: CrOrder
  organizationName?: string
  actions: AccountItemMenuAction[]
  onReorder: () => void
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
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  organization: {
    ...accountType.body,
    fontWeight: 700,
    color: 'text.primary',
  },
  orderNumber: {
    ...accountType.body,
    fontWeight: 600,
    color: 'primary.main',
  },
  total: {
    ...accountType.body,
    fontWeight: 700,
    color: 'text.primary',
  },
  subHeader: {
    typography: 'body2',
    color: 'text.secondary',
    marginTop: '0.25rem',
    marginBottom: '1rem',
  },
  fieldLabel: {
    typography: 'caption',
    color: 'text.secondary',
    display: 'block',
  },
  fieldValue: {
    typography: 'body2',
    color: 'text.primary',
  },
  itemName: {
    typography: 'body2',
    color: 'text.primary',
  },
  itemMeta: {
    typography: 'caption',
    color: 'text.secondary',
  },
  shipChip: {
    borderColor: 'primary.main',
    color: 'primary.main',
    borderRadius: '1rem',
    marginTop: '0.25rem',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  toggleLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    typography: 'body2',
    fontWeight: 600,
    color: 'primary.main',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
  },
}

const getStatusChipStyles = (status: string) => {
  const normalized = status?.toLowerCase()

  if (['paid', 'completed', 'delivered'].includes(normalized)) {
    return { backgroundColor: 'success.light', color: 'success.dark' }
  }
  if (['cancelled', 'canceled', 'voided', 'declined'].includes(normalized)) {
    return { backgroundColor: 'error.light', color: 'error.dark' }
  }
  return { backgroundColor: 'grey.200', color: 'text.primary' }
}

const OrderHistoryCard = (props: OrderHistoryCardProps) => {
  const { order, organizationName, actions, onReorder } = props
  const { t } = useTranslation('common')
  const [showItems, setShowItems] = useState(false)

  const orderNumber = orderGetters.getOrderNumber(order)
  const submittedDate = orderGetters.getSubmittedDate(order)
  const orderTotal = orderGetters.getOrderTotal(order)
  const paymentStatus = orderGetters.getOrderPaymentStatus(order)
  const fulfillmentStatus = orderGetters.getOrderFulfillmentStatus(order)
  const shippingAddress = orderGetters.getShippingAddress(order)
  const billingAddress = orderGetters.getBillingAddress(order)
  const paymentType = orderGetters.getSelectedPaymentType(order)?.paymentType
  const items = (order?.items ?? []) as CrOrderItem[]
  const expectedDeliveryDate = items.length ? orderGetters.getExpectedDeliveryDate(items) : null

  const billingContact = order?.billingInfo?.billingContact
  const billingName = [billingContact?.firstName, billingContact?.lastNameOrSurname]
    .filter(Boolean)
    .join(' ')

  const formatAddressLines = (address?: Partial<CrAddress> | null) =>
    [
      address?.address1,
      [address?.cityOrTown, address?.stateOrProvince, address?.postalOrZipCode]
        .filter(Boolean)
        .join(', '),
    ].filter(Boolean)

  return (
    <Box sx={{ ...styles.card }}>
      <Box sx={{ ...styles.headerRow }}>
        {organizationName && (
          <>
            <Typography component="span" sx={{ ...styles.organization }}>
              {organizationName}
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'grey.300' }} />
          </>
        )}
        <Typography component="span" sx={{ ...styles.fieldValue }}>
          {t('order')}
        </Typography>
        <Typography component="span" sx={{ ...styles.orderNumber }}>
          #{orderNumber}
        </Typography>

        <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {paymentStatus && (
            <Chip
              label={paymentStatus}
              size="small"
              sx={{ ...getStatusChipStyles(paymentStatus), fontWeight: 600, borderRadius: '1rem' }}
            />
          )}
          <Typography component="span" sx={{ ...styles.total }}>
            {t('currency', { val: orderTotal })}
          </Typography>
          <AccountItemMenu actions={actions} ariaLabel={`${t('actions')} #${orderNumber}`} />
        </Box>
      </Box>

      <Typography component="p" sx={{ ...styles.subHeader }}>
        {paymentType} · {t('placed')} {submittedDate}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Typography component="span" sx={{ ...styles.fieldLabel }}>
            {t('ship-to-address')}
          </Typography>
          {formatAddressLines(shippingAddress).map((line) => (
            <Typography key={line} component="p" sx={{ ...styles.fieldValue }}>
              {line}
            </Typography>
          ))}
        </Grid>

        <Grid item xs={12} sm={4}>
          <Typography component="span" sx={{ ...styles.fieldLabel }}>
            {t('billing')}
          </Typography>
          {billingName && (
            <Typography component="p" sx={{ ...styles.fieldValue, fontWeight: 700 }}>
              {billingName}
            </Typography>
          )}
          {formatAddressLines(billingAddress).map((line) => (
            <Typography key={line} component="p" sx={{ ...styles.fieldValue }}>
              {line}
            </Typography>
          ))}
        </Grid>

        <Grid item xs={12} sm={4}>
          <Typography component="span" sx={{ ...styles.fieldLabel }}>
            {t('delivery-status')}
          </Typography>
          {fulfillmentStatus && (
            <Typography component="p" sx={{ ...styles.fieldValue, fontWeight: 700 }}>
              {fulfillmentStatus}
            </Typography>
          )}
          {expectedDeliveryDate && (
            <Typography component="p" sx={{ ...styles.fieldValue }}>
              {t('estimated-ship-date')} {expectedDeliveryDate}
            </Typography>
          )}
        </Grid>
      </Grid>

      {showItems && (
        <>
          <Divider sx={{ borderColor: 'grey.300', margin: '1rem 0' }} />
          {items.map((item) => (
            <Box
              key={item?.id}
              sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}
            >
              <Box>
                <Typography component="p" sx={{ ...styles.itemName }}>
                  {item?.product?.name}
                </Typography>
                <Typography component="p" sx={{ ...styles.itemMeta }}>
                  {item?.product?.productCode} · {t('quantity')}:{item?.quantity}
                </Typography>
                {item?.expectedDeliveryDate && (
                  <Chip
                    label={`${t('ships')} ${orderGetters.getExpectedDeliveryDate([item])}`}
                    size="small"
                    variant="outlined"
                    sx={{ ...styles.shipChip }}
                  />
                )}
              </Box>
              <Typography component="span" sx={{ ...styles.fieldValue, fontWeight: 700 }}>
                {t('currency', { val: item?.total ?? 0 })}
              </Typography>
            </Box>
          ))}
        </>
      )}

      <Box sx={{ ...styles.toggleRow }}>
        <Box
          component="button"
          type="button"
          sx={{ ...styles.toggleLink }}
          aria-expanded={showItems}
          onClick={() => setShowItems(!showItems)}
        >
          {showItems ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          {showItems ? t('hide-items') : t('show-items')}
        </Box>
        <Box component="button" type="button" sx={{ ...styles.toggleLink }} onClick={onReorder}>
          <ChevronRightIcon fontSize="small" />
          {t('reorder')}
        </Box>
      </Box>
    </Box>
  )
}

export default OrderHistoryCard
