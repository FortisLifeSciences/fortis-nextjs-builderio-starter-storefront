import React, { useEffect, useState } from 'react'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import { Box, Button, Divider, Grid, Stack, Typography, IconButton } from '@mui/material'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { OrderPrice } from '@/components/common'
import { OrderStatus } from '@/lib/constants'
import { orderGetters, productGetters } from '@/lib/getters'

import type { CrOrder, CrOrderItem, CrProduct, Maybe } from '@/lib/gql/types'

const getOrderNotes = async (order: CrOrder) => {
  try {
    const orderPayLoad = { orderId: order.id }
    const response = await fetch('/api/getOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderPayLoad }),
    })
    return await response.json()
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
  accentBg: '#DFE6FF',
  success: '#34BC34',
  successBg: '#E4F5E6',
  pending: '#9E9E9E',
  pendingBg: '#F0F0F0',
}

const cardSx = {
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  padding: '24px',
}

interface DeliveryStep {
  key: string
  label: string
  description: string
  icon: React.ReactNode
  date?: string
}

const OrderStatusDetails = ({ order }: { order: CrOrder }) => {
  const { t } = useTranslation('common')

  const orderNumber = orderGetters.getOrderNumber(order)
  const submittedDate = orderGetters.getSubmittedDate(order)
  const shipItems = orderGetters.getShipItems(order)
  const shippingDetails = orderGetters.getShippingDetails(order)
  const billingDetails = orderGetters.getBillingDetails(order)
  const paymentMethods = orderGetters.getPaymentMethods(order)
  const purchaseOrderPaymentMethods =
    orderGetters.getCheckoutDetails(order)?.purchaseOrderPaymentMethods
  const orderStatus = orderGetters.getOrderStatus(order)
  const packages = orderGetters.getPackages(order)
  const trackingInfo = orderGetters.getTrackingInfo(order)
  const expectedDeliveryDate = orderGetters.getExpectedDeliveryDate(shipItems as CrOrderItem[])

  const { shippingAddress, companyOrOrganization, firstName, lastNameOrSurname, shippingMethod } =
    shippingDetails
  const { billingAddress, billingCompanyOrOrganization } = billingDetails
  // Empty means no contact saved on this order, not a fetch failure - show that plainly.
  const hasRecipientOrAddress = Boolean(firstName || lastNameOrSurname || shippingAddress?.address1)
  const hasBillingInfo = Boolean(
    billingDetails?.firstName ||
      billingDetails?.lastNameOrSurname ||
      billingAddress?.address1 ||
      paymentMethods?.[0] ||
      purchaseOrderPaymentMethods?.[0]
  )

  const [shopperNotes, setShopperNotes] = useState<any>()
  useEffect(() => {
    const fetchShopperNotes = async () => {
      const response = await getOrderNotes(order)
      setShopperNotes(response?.data?.shopperNotes)
    }
    fetchShopperNotes()
  }, [order])

  const handleCopyTrackingNumber = () => {
    if (trackingInfo.trackingNumber) navigator.clipboard.writeText(trackingInfo.trackingNumber)
  }

  // No dedicated "processing"/"shipped" status field exists on the order - derive a best-effort
  // timeline instead: a package means shipped, OrderStatus.COMPLETED means delivered.
  const hasShipped = packages.length > 0
  const isDelivered = orderStatus === OrderStatus.COMPLETED
  const isProcessingStarted = orderStatus === 'Processing' || hasShipped || isDelivered
  const stepsComplete = [true, isProcessingStarted, hasShipped || isDelivered, isDelivered]
  const currentStepIndex = stepsComplete.indexOf(false)

  const deliverySteps: DeliveryStep[] = [
    {
      key: 'placed',
      label: t('order-placed'),
      description: t('order-placed-description'),
      icon: <CheckCircleIcon />,
      date: submittedDate as string,
    },
    {
      key: 'processing',
      label: t('processing'),
      description: t('processing-description'),
      icon: <Inventory2OutlinedIcon />,
    },
    {
      key: 'shipped',
      label: t('shipped'),
      description: t('shipped-description'),
      icon: <LocalShippingOutlinedIcon />,
    },
    {
      key: 'delivered',
      label: t('delivered'),
      description: expectedDeliveryDate
        ? t('delivered-description', { date: expectedDeliveryDate })
        : '',
      icon: <PlaceOutlinedIcon />,
    },
  ]

  return (
    <Box data-testid="order-status-details">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
        gap={2}
        sx={{ mb: '32px' }}
      >
        <Stack gap={0.5}>
          <Typography
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: { xs: '28px', md: '44px' },
              lineHeight: '120%',
              letterSpacing: '-0.02em',
              textTransform: 'capitalize',
              color: colors.heading,
            }}
          >
            {t('order-status')}
          </Typography>
          <Typography sx={{ fontSize: '15px', color: colors.body }}>
            {t('order-number')}{' '}
            <Box component="span" sx={{ color: colors.accent, fontWeight: 600 }}>
              {t('order-hash', { orderNumber })}
            </Box>
          </Typography>
        </Stack>
        <Button
          component={Link}
          href="/contact-us"
          variant="outlined"
          sx={{
            borderRadius: '0px 20px',
            borderColor: colors.accent,
            color: colors.accent,
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '13px',
            textTransform: 'none',
            px: 3,
            py: 1.25,
            whiteSpace: 'nowrap',
          }}
        >
          {t('contact-support')}
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Stack gap={2.5}>
            <Box sx={cardSx}>
              <Typography sx={{ fontWeight: 600, fontSize: '20px', color: colors.heading, mb: 2 }}>
                {t('order-summary')}
              </Typography>
              <Stack gap={2}>
                {shipItems?.map((item: Maybe<CrOrderItem>) => {
                  const product = item?.product as CrProduct
                  const itemDeliveryDate = orderGetters.getExpectedDeliveryDate([
                    item,
                  ] as CrOrderItem[])
                  return (
                    <Stack key={item?.id} gap={0.5}>
                      <Stack direction="row" justifyContent="space-between" gap={2}>
                        <Typography sx={{ fontSize: '15px', color: colors.subtitle }}>
                          {productGetters.getName(product)}
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 600, fontSize: '17px', color: colors.subtitle }}
                        >
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

            <Box sx={cardSx}>
              <Typography
                sx={{ fontWeight: 600, fontSize: '20px', color: colors.heading, mb: 2.5 }}
              >
                {t('delivery-status')}
              </Typography>
              <Stack gap={0}>
                {deliverySteps.map((step, index) => {
                  const isComplete = stepsComplete[index]
                  const isCurrent = index === currentStepIndex
                  const iconColor = isComplete
                    ? colors.success
                    : isCurrent
                    ? colors.accent
                    : colors.pending
                  const iconBg = isComplete
                    ? colors.successBg
                    : isCurrent
                    ? colors.accentBg
                    : colors.pendingBg
                  const isLast = index === deliverySteps.length - 1
                  return (
                    <Stack key={step.key} direction="row" gap={2}>
                      <Stack alignItems="center" gap="10px">
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: iconBg,
                            color: iconColor,
                            flexShrink: 0,
                            '& svg': { fontSize: '20px' },
                          }}
                        >
                          {step.icon}
                        </Box>
                        {!isLast && (
                          <Box
                            sx={{
                              width: '2px',
                              flex: 1,
                              backgroundColor: iconColor,
                              minHeight: '24px',
                            }}
                          />
                        )}
                      </Stack>
                      <Stack sx={{ pb: isLast ? 0 : 3 }} gap={0.5} flex={1}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{ fontWeight: 600, fontSize: '17px', color: 'rgba(0,0,0,0.8)' }}
                          >
                            {step.label}
                          </Typography>
                          {step.date && (
                            <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                              {step.date}
                            </Typography>
                          )}
                        </Stack>
                        {step.description && (
                          <Typography sx={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)' }}>
                            {step.description}
                          </Typography>
                        )}
                        {step.key === 'shipped' && trackingInfo.trackingNumber && (
                          <Box
                            sx={{
                              backgroundColor: colors.accentBg,
                              borderRadius: '8px',
                              p: 2,
                              mt: 1,
                            }}
                          >
                            <Stack direction="row" alignItems="center" gap={1}>
                              <Typography
                                sx={{ fontWeight: 600, fontSize: '15px', color: colors.heading }}
                              >
                                {t('tracking-number', {
                                  trackingNumber: trackingInfo.trackingNumber,
                                })}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={handleCopyTrackingNumber}
                                aria-label={t('tracking-number', {
                                  trackingNumber: trackingInfo.trackingNumber,
                                })}
                              >
                                <ContentCopyIcon sx={{ fontSize: '16px', color: colors.accent }} />
                              </IconButton>
                            </Stack>
                            {trackingInfo.trackingUrl && (
                              <Link
                                href={trackingInfo.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: colors.accent, fontSize: '14px' }}
                              >
                                {t('carrier-tracking', {
                                  carrier: trackingInfo.carrier || t('shipped'),
                                })}
                              </Link>
                            )}
                          </Box>
                        )}
                      </Stack>
                    </Stack>
                  )
                })}
              </Stack>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack gap={2.5}>
            <Box sx={cardSx}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <LocalShippingOutlinedIcon sx={{ color: colors.heading }} />
                <Typography sx={{ fontWeight: 600, fontSize: '18px', color: colors.heading }}>
                  {t('shipping-details')}
                </Typography>
              </Stack>
              <Stack gap={1.5}>
                {hasRecipientOrAddress ? (
                  <>
                    <Stack gap={0.25}>
                      <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                        {t('recipient')}
                      </Typography>
                      <Typography
                        sx={{ fontWeight: 600, fontSize: '15px', color: colors.subtitle }}
                      >
                        {firstName} {lastNameOrSurname}
                      </Typography>
                    </Stack>
                    <Stack gap={0.25}>
                      <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                        {t('ship-to-address')}
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
                  </>
                ) : (
                  <Typography sx={{ fontSize: '14px', color: colors.placeholder }}>
                    {t('no-shipping-address-on-file')}
                  </Typography>
                )}
                <Stack gap={0.25}>
                  <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                    {t('contact')}
                  </Typography>
                  {shippingDetails?.shippingPhoneHome && (
                    <Typography sx={{ fontSize: '14px', color: colors.body }}>
                      {shippingDetails.shippingPhoneHome}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: '14px', color: colors.body }}>
                    {orderGetters.getEmail(order)}
                  </Typography>
                </Stack>
                {shippingMethod?.shippingMethodName && (
                  <Stack gap={0.25}>
                    <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                      {t('shipping-method')}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: colors.body }}>
                      {shippingMethod.shippingMethodName}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>

            <Box sx={cardSx}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <CreditCardOutlinedIcon sx={{ color: colors.heading }} />
                <Typography sx={{ fontWeight: 600, fontSize: '18px', color: colors.heading }}>
                  {t('billing-information')}
                </Typography>
              </Stack>
              {hasBillingInfo ? (
                <>
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
                  {paymentMethods?.[0] && (
                    <Stack gap={0.25} sx={{ mt: 1.5 }}>
                      <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                        {t('payment-method')}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', color: colors.subtitle }}>
                        {t('payment-method-card-summary', {
                          cardName: paymentMethods[0].cardType,
                          last4: paymentMethods[0].cardNumberPartOrMask?.slice(-4),
                        })}
                      </Typography>
                    </Stack>
                  )}
                  {!paymentMethods?.[0] && purchaseOrderPaymentMethods?.[0] && (
                    <Stack gap={0.25} sx={{ mt: 1.5 }}>
                      <Typography sx={{ fontSize: '13px', color: colors.placeholder }}>
                        {t('payment-method')}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', color: colors.subtitle }}>
                        {t('po-number')}: {purchaseOrderPaymentMethods[0].purchaseOrderNumber}
                      </Typography>
                    </Stack>
                  )}
                </>
              ) : (
                <Typography sx={{ fontSize: '14px', color: colors.placeholder }}>
                  {t('no-billing-information-on-file')}
                </Typography>
              )}
            </Box>

            {shopperNotes?.comments && (
              <Box sx={{ ...cardSx, backgroundColor: '#F7F7F7', border: 'none' }}>
                <Typography
                  sx={{ fontWeight: 600, fontSize: '18px', color: colors.heading, mb: 1 }}
                >
                  {t('special-instructions')}
                </Typography>
                <Typography sx={{ fontSize: '14px', color: colors.body }}>
                  {shopperNotes.comments}
                </Typography>
              </Box>
            )}

            <Box sx={{ backgroundColor: colors.accentBg, borderRadius: '12px', padding: '20px' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '18px', color: colors.accent, mb: 1 }}>
                {t('need-help')}
              </Typography>
              <Stack>
                <Stack
                  component={Link}
                  href="/contact-us"
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    py: 1.25,
                    color: colors.accent,
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  {t('contact-support')}
                  <NavigateNextIcon sx={{ fontSize: '18px' }} />
                </Stack>
                {trackingInfo.trackingUrl && (
                  <Stack
                    component={Link}
                    href={trackingInfo.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      py: 1.25,
                      color: colors.accent,
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {t('track-package')}
                    <NavigateNextIcon sx={{ fontSize: '18px' }} />
                  </Stack>
                )}
                <Stack
                  component={Link}
                  href="/my-account/order-history"
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    py: 1.25,
                    color: colors.accent,
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  {t('returns-or-cancellations')}
                  <NavigateNextIcon sx={{ fontSize: '18px' }} />
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrderStatusDetails
