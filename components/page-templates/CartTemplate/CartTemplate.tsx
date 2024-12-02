import React, { useEffect, useState } from 'react'

import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import { LoadingButton } from '@mui/lab'
import {
  Grid,
  Typography,
  Box,
  Stack,
  Button,
  useTheme,
  Divider,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { CartItemList } from '@/components/cart'
import { PromoCodeBadge, OrderSummary, Price } from '@/components/common'
import { ConfirmationDialog, StoreLocatorDialog } from '@/components/dialogs'
import { LoginDialog } from '@/components/layout'
import { useModalContext, useAuthContext } from '@/context'
import {
  useGetCart,
  useInitiateOrder,
  useGetStoreLocations,
  useGetPurchaseLocation,
  useUpdateCartItemQuantity,
  useDeleteCartItem,
  useUpdateCartCoupon,
  useDeleteCartCoupon,
  useInitiateCheckout,
  useCartActions,
  useProductCardActions,
  useRefetchCart,
} from '@/hooks'
import { orderGetters, cartGetters, checkoutGetters } from '@/lib/getters'

import type { CrCart, Location, CrCartItem, Checkout, CrOrder } from '@/lib/gql/types'

export interface CartTemplateProps {
  isMultiShipEnabled: boolean
  cart: CrCart
  cartTopContentSection?: any
  cartBottomContentSection?: any
}

const CartTemplate = (props: CartTemplateProps) => {
  const { isMultiShipEnabled } = props
  const { data: cart } = useGetCart(props?.cart)
  const { refetchCart } = useRefetchCart()
  const { cartTopContentSection, cartBottomContentSection } = props
  const { t } = useTranslation('common')
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const { initiateOrder } = useInitiateOrder()
  const { initiateCheckout } = useInitiateCheckout()
  const { updateCartItemQuantity } = useUpdateCartItemQuantity()
  const { deleteCartItem } = useDeleteCartItem()
  const { showModal, closeModal } = useModalContext()
  const { isAuthenticated } = useAuthContext()

  const cartItemCount = cartGetters.getCartItemCount(cart)
  const cartItems = cartGetters.getCartItems(cart)

  const locationCodes = orderGetters.getFulfillmentLocationCodes(cartItems as CrCartItem[])

  const { data: locations } = useGetStoreLocations({ filter: locationCodes })
  const { data: purchaseLocation } = useGetPurchaseLocation()
  const { updateCartCoupon } = useUpdateCartCoupon()
  const { deleteCartCoupon } = useDeleteCartCoupon()
  const [promoError, setPromoError] = useState<string>('')
  const [showLoadingButton, setShowLoadingButton] = useState<boolean>(false)
  const { handleDeleteCurrentCart } = useProductCardActions()

  const handleApplyPromoCode = async (couponCode: string) => {
    try {
      setPromoError('')
      const response = await updateCartCoupon.mutateAsync({
        cartId: cart?.id as string,
        couponCode,
      })
      if (response?.invalidCoupons?.length) {
        setPromoError(`<strong>${couponCode}</strong> ${response?.invalidCoupons[0]?.reason}`)
      }
    } catch (err) {
      console.error(err)
    }
  }
  const handleRemovePromoCode = async (couponCode: string) => {
    try {
      await deleteCartCoupon.mutateAsync({
        cartId: cart?.id as string,
        couponCode,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteItem = async (cartItemId: string) => {
    await deleteCartItem.mutateAsync({ cartItemId })
  }

  const handleItemActions = () => {
    // your code here
  }
  const handleRefetch = async () => {
    try {
      const data = await refetchCart()
      return data
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const handleForceLogin = async () => {
    if (!isAuthenticated) {
      showModal({
        Component: LoginDialog,
        props: {
          isCartCheckout: true,
          onLoginSuccess: proceedWithCheckout,
        },
      })
      return
    }
    await handleGotoCheckout()
  }

  const proceedWithCheckout = async () => {
    closeModal()
    await handleGotoCheckout()
  }

  const handleGotoCheckout = async () => {
    setShowLoadingButton(true)
    try {
      const currentCart = (await handleRefetch()) || cart
      const initiateOrderResponse = isMultiShipEnabled
        ? await initiateCheckout.mutateAsync(currentCart?.id)
        : await initiateOrder.mutateAsync({ cartId: currentCart?.id as string })

      if (initiateOrderResponse?.id) {
        router.push(`/checkout/${initiateOrderResponse.id}`)
      }
    } catch (err) {
      console.error(err)
      setShowLoadingButton(false)
    }
  }

  const orderSummaryArgs = {
    nameLabel: t('cart-summary'),
    subTotalLabel: `${t('subtotal')}`,
    totalCount: `${t('item-quantity', { count: cartItemCount })}`,
    totalLabel: t('estimated-order-total'),
    orderDetails: cart,
    isShippingTaxIncluded: false,
    promoComponent: (
      <PromoCodeBadge
        onApplyCouponCode={handleApplyPromoCode}
        onRemoveCouponCode={handleRemovePromoCode}
        promoList={cart?.couponCodes as string[]}
        promoError={!!promoError}
        helpText={promoError}
      />
    ),
  }

  const handleContinueShopping = () => {
    router.back()
  }

  const { onFulfillmentOptionChange, handleQuantityUpdate, handleProductPickupLocation } =
    useCartActions({
      cartItems: cartItems as CrCartItem[],
      purchaseLocation,
    })

  const openClearCartConfirmation = () => {
    showModal({
      Component: ConfirmationDialog,
      props: {
        onConfirm: handleDeleteCurrentCart,
        contentText: t('clear-cart-confirmation-text'),
        primaryButtonText: t('delete'),
      },
    })
  }

  const orderDetails = orderSummaryArgs?.orderDetails
  const subTotal = orderGetters.getSubtotal(orderDetails)
  const discountedSubtotal =
    orderGetters.getDiscountedSubtotal(orderDetails as CrOrder | CrCart) ||
    checkoutGetters.getDiscountedSubtotal(orderDetails as Checkout)

  return (
    <Grid container>
      {/* Header section */}
      {cartTopContentSection && (
        <Grid item xs={12}>
          {cartTopContentSection}
        </Grid>
      )}
      <Grid item xs={12} md={8} sx={{ paddingX: { xs: 2, md: 0 }, paddingY: { xs: 2 } }}>
        <Box display="flex" gap={1}>
          <Typography variant="h1" gutterBottom sx={{ color: 'primary.main' }}>
            {t('shopping-cart')}
          </Typography>
          {/* <Typography variant="h1" fontWeight={'normal'}>
            ({t('item-quantity', { count: cartItemCount })})
          </Typography> */}
        </Box>
      </Grid>
      {isMobileViewport && (
        <Grid item xs={12}>
          {<Divider />}
        </Grid>
      )}
      {/* Cart item Section */}
      {!!cart?.items?.length && (
        <>
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              paddingRight: { md: 2 },
              position: { md: 'relative' },
              top: { md: '-36px', sm: '0' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end ' }}>
              <Button
                variant="text"
                sx={{
                  color: 'primary.main',
                  width: 'fit-content',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 300,
                  lineHeight: '25px',
                  textDecorationLine: 'underline',
                  textDecorationStyle: 'solid',
                  textDecorationSkipInk: 'none',
                  textDecorationThickness: 'auto',
                  textUnderlineOffset: 'auto',
                  textUnderlinePosition: 'from-font',
                  '&:hover': {
                    textDecorationLine: 'underline',
                    background: 'transparent',
                    color: 'primary.light',
                  },
                }}
                name="clearCart"
                fullWidth
                onClick={openClearCartConfirmation}
                disabled={!cartItemCount}
              >
                {t('clear-cart')}
              </Button>
            </Box>

            <CartItemList
              cartItems={cartItems}
              fulfillmentLocations={
                locations && Object.keys(locations).length ? (locations as Location[]) : []
              }
              purchaseLocation={purchaseLocation}
              onCartItemDelete={handleDeleteItem}
              onCartItemQuantityUpdate={handleQuantityUpdate}
              onFulfillmentOptionChange={onFulfillmentOptionChange}
              onProductPickupLocation={handleProductPickupLocation}
              onCartItemActionSelection={handleItemActions}
            />
            {/* <Box py={5}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleContinueShopping}
                startIcon={<KeyboardArrowLeft fontSize="small" sx={{ color: 'text.secondary' }} />}
              >
                {t('continue-shopping')}
              </Button>
            </Box> */}
          </Grid>
          {/* Order Summary */}
          <Grid item xs={12} md={4} sx={{ paddingRight: { xs: 0, md: 2 } }}>
            <Box>
              <Card
                sx={{
                  bgcolor: 'grey.300',
                  width: '380px',
                  height: '330px',
                  flexShrink: '0',
                  padding: '20px',
                  boxShadow: 'none',
                }}
              >
                <CardContent sx={{ padding: '0px' }}>
                  <Typography variant="h3" color="gray.900" fontWeight="500" pt={0.5}>
                    {orderSummaryArgs?.nameLabel}
                  </Typography>
                  <Typography sx={{}} variant="body1">
                    {orderSummaryArgs?.subTotalLabel}
                  </Typography>
                  <Divider />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '25px',
                    }}
                  >
                    {orderSummaryArgs?.totalCount}
                    <Price
                      variant="body1"
                      fontWeight="normal"
                      price={t('currency', { val: subTotal })}
                      salePrice={
                        discountedSubtotal > 0 && discountedSubtotal !== subTotal
                          ? t('currency', { val: discountedSubtotal })
                          : ''
                      }
                    />
                  </Box>

                  <Typography variant="body2" sx={{ marginBottom: '25px' }}>
                    {t('shipping-tax-at-checkout')}
                  </Typography>

                  <Stack direction="column" gap={2} sx={{ alignItems: 'center' }}>
                    <LoadingButton
                      variant="contained"
                      color="primary"
                      name="goToCart"
                      fullWidth
                      onClick={handleForceLogin}
                      loading={showLoadingButton}
                      disabled={!cartItemCount || showLoadingButton}
                      sx={{
                        borderRadius: '0px 26px',
                        padding: '12px 30px',
                        width: 'fit-content',
                      }}
                    >
                      {t('checkout')}
                    </LoadingButton>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* <OrderSummary {...orderSummaryArgs}>
              <Stack direction="column" gap={2}>
                <LoadingButton
                  variant="contained"
                  color="primary"
                  name="goToCart"
                  fullWidth
                  onClick={handleForceLogin}
                  loading={showLoadingButton}
                  disabled={!cartItemCount || showLoadingButton}
                >
                  {t('go-to-checkout')}
                </LoadingButton>
              </Stack>
            </OrderSummary> */}
          </Grid>
        </>
      )}
      {!cart?.items?.length && (
        <Box data-testid="empty-cart">
          <Typography variant="subtitle2" fontWeight={'bold'}>
            {t('empty-cart-message')}
          </Typography>
          <Box maxWidth="23.5rem">
            <Button
              variant="contained"
              color="primary"
              sx={{ width: '100%', marginTop: '3.063rem' }}
              onClick={() => router.push('/')}
            >
              {t('shop-now')}
            </Button>
          </Box>
        </Box>
      )}
      {cartBottomContentSection && (
        <Grid item xs={12}>
          {cartBottomContentSection}
        </Grid>
      )}
    </Grid>
  )
}

export default CartTemplate
