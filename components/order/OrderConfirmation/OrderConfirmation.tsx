import React, { useEffect, useRef, useState } from 'react'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import { Box, Button, Divider, Grid, Stack, Typography } from '@mui/material'
import getConfig from 'next/config'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { useReactToPrint } from 'react-to-print'

import { OrderPrice } from '@/components/common'
import { useProductCardActions } from '@/hooks'
import { orderGetters, productGetters } from '@/lib/getters'

import type { CrOrder, CrOrderItem, CrProduct, Maybe } from '@/lib/gql/types'

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

const colors = {
  border: '#D3D7D9',
  heading: '#070707',
  subtitle: '#333333',
  body: '#454545',
  placeholder: '#808080',
  accent: '#30299A',
  accentBg: '#EEF1FF',
}

const cardSx = {
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  padding: '20px',
  height: '100%',
}

const infoCardSx = {
  ...cardSx,
  border: 'none',
  backgroundColor: '#F7F7F7',
}

const actionButtonSx = {
  // Fortis' signature cut-corner pill (same shape as the Sign Up CTA / feature buttons
  // elsewhere on the site) instead of a plain full pill.
  borderRadius: '0px 26px',
  whiteSpace: 'nowrap' as const,
  textTransform: 'none' as const,
  fontFamily: 'Poppins',
  fontWeight: 600,
  fontSize: '13px',
  lineHeight: '150%',
  letterSpacing: 'normal',
  height: '44px',
  gap: '8px',
  '& .MuiButton-startIcon': { margin: 0 },
}

const OrderConfirmation = ({ order }: { order: CrOrder }) => {
  const { t } = useTranslation('common')
  const { publicRuntimeConfig } = getConfig()
  const printRef = useRef(null)

  const orderNumber = orderGetters.getOrderNumber(order)
  const shipItems = orderGetters.getShipItems(order)
  const email = orderGetters.getEmail(order)
  const shippingDetails = orderGetters.getShippingDetails(order)
  const billingDetails = orderGetters.getBillingDetails(order)
  const paymentMethods = orderGetters.getPaymentMethods(order)
  const purchaseOrderPaymentMethods =
    orderGetters.getCheckoutDetails(order)?.purchaseOrderPaymentMethods
  const estimatedDelivery = orderGetters.getExpectedDeliveryDate(shipItems as CrOrderItem[])

  const {
    shippingAddress,
    companyOrOrganization,
    firstName,
    lastNameOrSurname,
    shippingPhoneHome,
  } = shippingDetails
  const { billingAddress, billingCompanyOrOrganization } = billingDetails

  const [shopperNotes, setShopperNotes] = useState<any>()
  const { handleDeleteCurrentCart } = useProductCardActions()
  useEffect(() => {
    const fetchShopperNotes = async () => {
      const response = await getOrderNotes(order)
      setShopperNotes(response?.data?.shopperNotes)
      if (response.data && response.data.status && response.data.status !== 'Errored') {
        handleDeleteCurrentCart()
      }
    }
    fetchShopperNotes()
  }, [order])

  // Set by GuestCheckoutStep's "Save information for next time" checkbox before it navigated
  // here - read once, then clear so it doesn't leak into a future order this shopper didn't
  // opt into.
  const [createAccountQuery, setCreateAccountQuery] = useState<Record<string, string> | null>(null)
  useEffect(() => {
    const raw = localStorage.getItem('wantsAccountCreation')
    if (raw) {
      try {
        setCreateAccountQuery(JSON.parse(raw))
      } catch {
        // ignore malformed value
      }
      localStorage.removeItem('wantsAccountCreation')
    }
  }, [])

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  })

  const creditCard = publicRuntimeConfig?.creditCard || {}
  const getCardName = (cardType: string) => {
    const match = creditCard.find((card: any) => card.code === cardType?.toUpperCase())
    return match ? match.name : cardType
  }

  return (
    <Box ref={printRef} data-testid="order-confirmation-new">
      <Stack alignItems="center" textAlign="center" gap={1} sx={{ mb: 4 }}>
        <CheckCircleIcon sx={{ color: '#22C55E', fontSize: '56px' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '32px', color: colors.heading }}>
          {t('order-confirmed')}
        </Typography>
        <Typography sx={{ fontSize: '15px', color: colors.body }}>
          {t('order-confirmed-description')}
        </Typography>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: '20px' }}>
        <Grid item xs={12} md={6}>
          <Box sx={infoCardSx}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
              <MailOutlineIcon sx={{ color: colors.placeholder, fontSize: '18px' }} />
              <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                {t('order-number')}
              </Typography>
            </Stack>
            <Typography sx={{ fontWeight: 700, fontSize: '18px', color: colors.heading }}>
              {t('order-hash', { orderNumber })}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: colors.body, mt: 0.5 }}>
              {t('have-sent-order-confirmation-to', { emailAddress: email })}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={infoCardSx}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
              <LocalShippingOutlinedIcon sx={{ color: colors.placeholder, fontSize: '18px' }} />
              <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                {t('estimated-delivery')}
              </Typography>
            </Stack>
            <Typography sx={{ fontWeight: 700, fontSize: '18px', color: colors.heading }}>
              {estimatedDelivery || '-'}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: colors.body, mt: 0.5 }}>
              {orderGetters.getShippingMethodName(order)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: '20px' }}>
        <Grid item xs={12} md={6}>
          <Box sx={cardSx}>
            <Typography sx={{ fontWeight: 600, fontSize: '18px', color: colors.subtitle, mb: 1.5 }}>
              {t('shipping-details')}
            </Typography>
            <Stack gap={0.25}>
              <Typography sx={{ fontWeight: 600, fontSize: '15px', color: colors.subtitle }}>
                {firstName} {lastNameOrSurname}
              </Typography>
              {companyOrOrganization && (
                <Typography sx={{ fontSize: '14px', color: colors.body }}>
                  {companyOrOrganization}
                </Typography>
              )}
              {shippingAddress?.address1 && (
                <Typography sx={{ fontSize: '14px', color: colors.body }}>
                  {shippingAddress.address1}
                </Typography>
              )}
              {(shippingAddress?.cityOrTown ||
                shippingAddress?.stateOrProvince ||
                shippingAddress?.postalOrZipCode) && (
                <Typography sx={{ fontSize: '14px', color: colors.body }}>
                  {[shippingAddress?.cityOrTown, shippingAddress?.stateOrProvince]
                    .filter(Boolean)
                    .join(', ')}{' '}
                  {shippingAddress?.postalOrZipCode}
                </Typography>
              )}
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={cardSx}>
            <Typography sx={{ fontWeight: 600, fontSize: '18px', color: colors.subtitle, mb: 1.5 }}>
              {t('contact-information')}
            </Typography>
            <Stack gap={0.25}>
              <Typography sx={{ fontWeight: 600, fontSize: '15px', color: colors.subtitle }}>
                {firstName} {lastNameOrSurname}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: colors.body }}>{email}</Typography>
              {shippingPhoneHome && (
                <Typography sx={{ fontSize: '14px', color: colors.body }}>
                  {shippingPhoneHome}
                </Typography>
              )}
            </Stack>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ ...cardSx, mb: '20px' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '18px', color: colors.subtitle, mb: 1.5 }}>
              {t('billing-information')}
            </Typography>
            <Stack gap={0.25}>
              <Typography sx={{ fontWeight: 600, fontSize: '15px', color: colors.subtitle }}>
                {billingDetails?.firstName} {billingDetails?.lastNameOrSurname}
              </Typography>
              {billingCompanyOrOrganization && (
                <Typography sx={{ fontSize: '14px', color: colors.body }}>
                  {billingCompanyOrOrganization}
                </Typography>
              )}
              {billingAddress?.address1 && (
                <Typography sx={{ fontSize: '14px', color: colors.body }}>
                  {billingAddress.address1}
                </Typography>
              )}
              {(billingAddress?.cityOrTown ||
                billingAddress?.stateOrProvince ||
                billingAddress?.postalOrZipCode) && (
                <Typography sx={{ fontSize: '14px', color: colors.body }}>
                  {[billingAddress?.cityOrTown, billingAddress?.stateOrProvince]
                    .filter(Boolean)
                    .join(', ')}{' '}
                  {billingAddress?.postalOrZipCode}
                </Typography>
              )}
            </Stack>
          </Box>
          {paymentMethods?.[0] && (
            <Box textAlign={{ xs: 'left', sm: 'right' }}>
              <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                {t('payment-method')}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: colors.subtitle }}>
                {t('payment-method-card-summary', {
                  cardName: getCardName(paymentMethods[0].cardType as string),
                  last4: paymentMethods[0].cardNumberPartOrMask?.slice(-4),
                })}
              </Typography>
            </Box>
          )}
          {!paymentMethods?.[0] && purchaseOrderPaymentMethods?.[0] && (
            <Box textAlign={{ xs: 'left', sm: 'right' }}>
              <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                {t('payment-method')}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: colors.subtitle }}>
                {t('po-number')}: {purchaseOrderPaymentMethods[0].purchaseOrderNumber}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <Box sx={{ ...cardSx, mb: '20px' }}>
        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: colors.subtitle, mb: 1.5 }}>
          {t('order-summary')}
        </Typography>
        <Stack gap={2}>
          {shipItems?.map((item: Maybe<CrOrderItem>) => {
            const product = item?.product as CrProduct
            const itemDeliveryDate = orderGetters.getExpectedDeliveryDate([item] as CrOrderItem[])
            return (
              <Stack key={item?.id} gap={0.5}>
                <Stack direction="row" justifyContent="space-between" gap={2}>
                  <Typography sx={{ fontWeight: 600, fontSize: '15px', color: colors.subtitle }}>
                    {productGetters.getName(product)}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '15px', color: colors.subtitle }}>
                    {t('currency', { val: productGetters.getPrice(product).regular })}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: '12px', color: colors.placeholder }}>
                  {productGetters.getVariationProductCodeOrProductCode(product as any)}{' '}
                  {t('quantity')}: {orderGetters.getProductQuantity(item as CrOrderItem)}
                </Typography>
                {itemDeliveryDate && (
                  <Box
                    sx={{
                      display: 'inline-block',
                      width: 'fit-content',
                      border: `1px solid ${colors.accent}`,
                      backgroundColor: colors.accentBg,
                      color: colors.accent,
                      borderRadius: '100px',
                      padding: '2px 12px',
                      fontSize: '13px',
                    }}
                  >
                    {t('ships-on-date', { date: itemDeliveryDate })}
                  </Box>
                )}
              </Stack>
            )
          })}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <OrderPrice
          subTotalLabel={t('subtotal')}
          shippingTotalLabel={t('shipping')}
          taxLabel={t('tax')}
          totalLabel={t('total')}
          orderDetails={order}
          isShippingTaxIncluded
        />
      </Box>

      <Box sx={{ ...cardSx, mb: '20px' }}>
        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: colors.subtitle, mb: 1 }}>
          {t('special-instructions')}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: colors.body }}>
          {shopperNotes?.comments || ''}
        </Typography>
      </Box>

      <Box sx={{ backgroundColor: colors.accentBg, borderRadius: '12px', padding: '20px', mb: 4 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '18px', color: colors.accent, mb: 1 }}>
          {t('whats-next')}
        </Typography>
        <Stack component="ul" sx={{ margin: 0, paddingLeft: '20px' }} gap={0.5}>
          <Typography component="li" sx={{ fontSize: '14px', color: colors.accent }}>
            {t('order-confirmation-tracking-sent')}
          </Typography>
          <Typography component="li" sx={{ fontSize: '14px', color: colors.accent }}>
            {t('contact-support-for-questions')}{' '}
            <Link href="/contact-us" style={{ color: colors.accent }}>
              {t('contact-us')}
            </Link>
            .
          </Typography>
        </Stack>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
        {createAccountQuery ? (
          <Button
            component={Link}
            href={`/create-account?${new URLSearchParams(createAccountQuery).toString()}`}
            variant="contained"
            sx={{
              ...actionButtonSx,
              backgroundColor: colors.accent,
              px: 3,
              '&:hover': { backgroundColor: '#4C47C4' },
            }}
          >
            {t('create-an-account')}
          </Button>
        ) : (
          <Button
            component={Link}
            href="/"
            variant="contained"
            sx={{
              ...actionButtonSx,
              backgroundColor: colors.accent,
              px: 3,
              '&:hover': { backgroundColor: '#4C47C4' },
            }}
          >
            {t('continue-shopping')}
          </Button>
        )}
        <Button
          component={Link}
          href={`/order-status?${new URLSearchParams({
            orderNumber: String(orderNumber ?? ''),
            billingEmail: email ?? '',
          }).toString()}`}
          variant="outlined"
          startIcon={<LocalShippingOutlinedIcon />}
          sx={{
            ...actionButtonSx,
            borderColor: colors.accent,
            color: colors.accent,
            px: 3,
          }}
        >
          {t('track-order')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<ReceiptLongOutlinedIcon />}
          onClick={handlePrint}
          sx={{
            ...actionButtonSx,
            borderColor: colors.accent,
            color: colors.accent,
            px: 3,
          }}
        >
          {t('download-receipt')}
        </Button>
      </Stack>
    </Box>
  )
}

export default OrderConfirmation
