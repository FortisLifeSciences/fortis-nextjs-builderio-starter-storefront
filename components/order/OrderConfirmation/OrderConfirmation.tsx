import React, { useRef } from 'react'

import Print from '@mui/icons-material/Print'
import { Box, Container, Divider, Grid, IconButton, Stack, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useReactToPrint } from 'react-to-print'

import { ConfirmationDetails, OrderSummary, ProductItemList } from '@/components/common'
import { ProductOptionList } from '@/components/product'
import { orderGetters } from '@/lib/getters'

import type { CrOrder } from '@/lib/gql/types'

const OrderConfirmation = ({ order }: { order: CrOrder }) => {
  const { t } = useTranslation('common')
  const componentRef = useRef(null)

  console.log('This is order item ---> ', order)

  const orderTotal = orderGetters.getTotal(order)
  const orderNumber = orderGetters.getOrderNumber(order)
  const submittedDate = orderGetters.getSubmittedDate(order)
  const pickupItems = orderGetters.getPickupItems(order)
  const shipItems = orderGetters.getShipItems(order)
  const email = orderGetters.getEmail(order)
  const shippingDetails = orderGetters.getShippingDetails(order)
  const billingDetails = orderGetters.getBillingDetails(order)

  console.log('This is shipping details ---> ', shippingDetails)
  console.log('This is billing details ---> ', billingDetails)

  const options = [
    {
      name: t('your-order'),
      value: String(orderNumber),
    },
    {
      name: t('order-date'),
      value: submittedDate,
    },
  ]

  const orderSummeryArgs = {
    nameLabel: t('order-summary'),
    subTotalLabel: `${t('subtotal')} (${t('item-quantity', { count: order.items?.length })})`,
    shippingTotalLabel: t('shipping'),
    taxLabel: t('estimated-tax'),
    totalLabel: t('total-price'),
    handlingLabel: t('additional-handling'),
    orderDetails: order,
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  })

  return (
    <>
      <Grid container data-testid="order-confirmation-new">
        <Grid item xs={12}>
          <Typography
            variant="h2"
            component="h2"
            sx={{ color: 'primary.main', marginBottom: '30px' }}
          >
            {t('thank-you')}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" component="span" sx={{ fontWeight: '600' }}>
            {t('order-was-placed-successfully', { orderNumber: orderNumber })}
          </Typography>
          <Typography variant="body1" component="span">
            {t('have-sent-order-confirmation-to', { emailAddress: email })}
          </Typography>
          <Typography variant="body1" component="span">
            {t('thank-you-for-your-business')}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item md={8} xs={12}>
          <Typography
            variant="h2"
            component="h2"
            sx={{ color: 'primary.main', marginBottom: '20px' }}
          >
            {t('order-details')}
          </Typography>
          <ProductItemList items={shipItems} isOrderConfirmation={true} />
          <Typography variant="h3" component="h3" sx={{ color: 'primary.main' }}>
            {t('shipping-information')}
          </Typography>
          <ConfirmationDetails detailsData={shippingDetails} />
          <Typography variant="h3" component="h3" sx={{ color: 'primary.main' }}>
            {t('billing-information')}
          </Typography>
          <ConfirmationDetails detailsData={billingDetails} />
        </Grid>
        <Grid item md={4} xs={12}>
          <Stack width={'100%'} alignItems="center">
            <Container maxWidth="xs" disableGutters sx={{ paddingLeft: '40px' }}>
              <OrderSummary {...orderSummeryArgs} />
            </Container>
          </Stack>
        </Grid>
      </Grid>

      {/* // */}

      <Grid container data-testid="order-confirmation">
        <Grid item xs={12}>
          <Box display={'flex'} justifyContent={'flex-end'} width="100%">
            <IconButton onClick={handlePrint}>
              <Print />
            </IconButton>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{ display: 'flex', flexDirection: 'column', gap: 5, pt: 1 }}
          ref={componentRef}
        >
          <Container maxWidth="xs">
            <Stack width={'100%'} alignItems="center" gap={3} pt={0}>
              <Typography variant="h1">{t('thank-you')}</Typography>
              <Box display="flex" gap={3}>
                <Typography variant="h2" fontWeight={'normal'}>
                  {t('item-quantity', { count: order.items?.length })}
                </Typography>
                <Typography variant="h2">{t('currency', { val: orderTotal })}</Typography>
              </Box>
            </Stack>
          </Container>

          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              backgroundColor: 'primary.main',
              height: '14.375rem',
              paddingX: 3,
              gap: 3,
            }}
          >
            <Typography variant="h1" color={'common.white'}>
              {t('your-order-was-placed-successfully')}
            </Typography>
            <Typography variant="h3" color={'common.white'} fontWeight={'normal'}>
              {t('check-your-email-for-your-order-confirmation')}
            </Typography>
          </Stack>

          <Stack width={'100%'} alignItems="center" gap={3}>
            <Container maxWidth="xs">
              <Box>
                <ProductOptionList options={options} variant={'h3'} fontWeight={'normal'} />
              </Box>
              <br />
              <Typography variant="h3" sx={{ display: 'inline' }}>
                {t('we-have-sent-the-order-confirmation-details-to')}
                <Box sx={{ fontWeight: 'bold' }}>{email}</Box>
              </Typography>
            </Container>
          </Stack>

          <Stack width={'100%'} alignItems="center">
            <Container maxWidth="xs">
              <Typography variant="h2" gutterBottom>
                {t('order-details')}
              </Typography>
              <Divider sx={{ height: '1px', bgcolor: 'primary.main' }} />
              {shipItems && shipItems.length > 0 && (
                <Box sx={{ paddingBlock: 2 }}>
                  <Typography variant="h3" fontWeight={700} gutterBottom>
                    {t('shipping-to-home')}
                  </Typography>

                  <ProductItemList items={shipItems} />
                </Box>
              )}
              <Divider sx={{ height: '1px' }} />

              {/* Pickup orders */}
              {pickupItems && pickupItems.length > 0 && (
                <Box sx={{ paddingBlock: 2 }}>
                  <Typography variant="h3" fontWeight={700} gutterBottom>
                    {t('pickup')}
                  </Typography>
                  <ProductItemList items={pickupItems} />
                </Box>
              )}
            </Container>
          </Stack>
          {/* Order Summary */}
          <Stack width={'100%'} alignItems="center">
            <Container maxWidth="xs" sx={{ p: 0 }}>
              <OrderSummary {...orderSummeryArgs} />
            </Container>
          </Stack>
        </Grid>
      </Grid>
    </>
  )
}

export default OrderConfirmation
