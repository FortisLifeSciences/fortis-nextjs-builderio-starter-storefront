import React, { useEffect, useRef, useState } from 'react'

import Print from '@mui/icons-material/Print'
import { Box, Container, Divider, Grid, IconButton, Stack, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useReactToPrint } from 'react-to-print'

import { ConfirmationDetails, OrderSummary, ProductItemList } from '@/components/common'
import { ProductOptionList } from '@/components/product'
import { orderGetters } from '@/lib/getters'

import type { CrOrder } from '@/lib/gql/types'

const getOrderNotes = async (order: any) => {
  try {
    const orderId = order.id
    const orderPayLoad = {
      orderId: orderId,
    }
    const orderItem = await fetch('/api/getOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderPayLoad }),
    })

    const data = await orderItem.json()
    return data
  } catch (error) {
    console.error('Error fetching shopper notes:', error)
    throw error
  }
}

const OrderConfirmation = ({ order }: { order: CrOrder }) => {
  const { t } = useTranslation('common')
  const componentRef = useRef(null)

  const orderTotal = orderGetters.getTotal(order)
  const orderNumber = orderGetters.getOrderNumber(order)
  const submittedDate = orderGetters.getSubmittedDate(order)
  const pickupItems = orderGetters.getPickupItems(order)
  const shipItems = orderGetters.getShipItems(order)
  const email = orderGetters.getEmail(order)
  const shippingDetails = orderGetters.getShippingDetails(order)
  const billingDetails = orderGetters.getBillingDetails(order)

  const [shopperNotes, setShopperNotes] = useState<any>()

  useEffect(() => {
    const fetchShopperNotes = async () => {
      const response = await getOrderNotes(order)
      setShopperNotes(response?.data?.shopperNotes)
    }
    fetchShopperNotes()
  }, [order])

  const orderSummeryArgs = {
    nameLabel: t('order-summary'),
    subTotalLabel: t('subtotal'),
    shippingTotalLabel: t('shipping'),
    taxLabel: t('estimated-tax'),
    totalLabel: t('total-price'),
    handlingLabel: t('handling'),
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
            tabIndex={0}
          >
            {t('thank-you')}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" component="span" sx={{ fontWeight: '600' }} tabIndex={0}>
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
          <Divider sx={{ borderWidth: '1.75px', marginBottom: '30px', marginTop: '30px' }} />
        </Grid>
        <Grid item md={8} xs={12}>
          <Typography
            variant="h2"
            component="h2"
            sx={{ color: 'primary.main', marginBottom: '20px' }}
            tabIndex={0}
          >
            {t('order-details')}
          </Typography>
          <ProductItemList items={shipItems} isOrderConfirmation={true} />
          <Typography
            variant="h3"
            component="h3"
            sx={{ color: 'primary.main', marginBottom: '10px' }}
            tabIndex={0}
          >
            {t('shipping-information')}
          </Typography>
          <ConfirmationDetails detailsData={shippingDetails} />
          <Typography
            variant="h3"
            component="h3"
            sx={{ color: 'primary.main', marginBottom: '10px' }}
            tabIndex={0}
          >
            {t('billing-information')}
          </Typography>
          <ConfirmationDetails detailsData={billingDetails} />
          {shopperNotes && (
            <>
              <Typography
                variant="body2"
                component="body"
                sx={{ fontWeight: '700', lineHeight: '25px', height: 'auto', marginBottom: '10px' }}
              >
                {t('special-instructions')}
              </Typography>
              <Typography variant="body2" component="body" sx={{ height: 'auto' }}>
                {shopperNotes?.comments}
              </Typography>
            </>
          )}
        </Grid>
        <Grid item md={4} xs={12}>
          <Stack width={'100%'} alignItems="center">
            <Container maxWidth="xs" disableGutters sx={{ paddingLeft: '40px' }}>
              <OrderSummary {...orderSummeryArgs} />
            </Container>
          </Stack>
        </Grid>
      </Grid>
    </>
  )
}

export default OrderConfirmation
