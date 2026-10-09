import React from 'react'

import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { LoadingButton } from '@mui/lab'
import { Box, Drawer, IconButton, Stack, Typography, Divider, Button, Link } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { Price, QuantitySelector } from '@/components/common'
import LoginDialog from '@/components/layout/Login/LoginDialog/LoginDialog'
import { useAuthContext, useHeaderContext, useModalContext } from '@/context'
import { useGetCart, useUpdateCartItemQuantity, useDeleteCartItem, useInitiateOrder } from '@/hooks'
import { cartGetters, cartItemGetters, orderGetters } from '@/lib/getters'

import type { CrCartItem } from '@/lib/gql/types'

const styles = {
  paper: {
    width: { xs: '100vw', sm: 494 },
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    px: 3,
    py: 2.5,
  },
  itemList: {
    flex: '1 1 auto',
    overflowY: 'auto',
    px: 3,
    py: 2,
  },
  footer: {
    px: 3,
    py: 2.5,
    borderTop: '1px solid',
    borderColor: 'grey.400',
  },
}

const CartSideDrawer = () => {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { headerState, toggleCartDrawer } = useHeaderContext()
  const { isCartDrawerVisible } = headerState
  const { isAuthenticated } = useAuthContext()
  const { showModal } = useModalContext()

  const { data: cart } = useGetCart()
  const cartItems = cartGetters.getCartItems(cart) as CrCartItem[]
  const cartItemCount = cartGetters.getCartItemCount(cart)

  const { updateCartItemQuantity } = useUpdateCartItemQuantity()
  const { deleteCartItem } = useDeleteCartItem()
  const { initiateOrder } = useInitiateOrder()

  const subTotal = orderGetters.getSubtotal(cart)
  const shippingTotal = orderGetters.getShippingTotal(cart)
  const total = orderGetters.getTotal(cart)

  const handleClose = () => toggleCartDrawer(false)

  const handleQuantityChange = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return
    updateCartItemQuantity.mutate({ cartItemId, quantity })
  }

  const handleDelete = (cartItemId: string) => {
    deleteCartItem.mutate({ cartItemId })
  }

  const handleBrowseProducts = () => {
    handleClose()
    router.push('/')
  }

  const handleLoginClick = () => {
    handleClose()
    showModal({ Component: LoginDialog })
  }

  const handleGoToCheckout = async () => {
    try {
      const checkout = await initiateOrder.mutateAsync({ cartId: cart?.id as string })
      if (checkout?.id) {
        handleClose()
        router.push(`/checkout/${checkout.id}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Drawer
      anchor="right"
      open={!!isCartDrawerVisible}
      onClose={handleClose}
      data-testid="cart-side-drawer"
      PaperProps={{ sx: styles.paper }}
    >
      <Stack sx={styles.header} direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h3" component="span">
          {t('cart')}{' '}
          <Typography variant="body2" component="span" color="text.secondary">
            ({t('item-quantity', { count: cartItemCount })})
          </Typography>
        </Typography>
        <IconButton onClick={handleClose} aria-label={t('close')} size="small">
          <CloseIcon />
        </IconButton>
      </Stack>
      <Divider />

      {!cartItemCount && (
        <>
          <Stack
            flex="1 1 auto"
            alignItems="center"
            justifyContent="center"
            spacing={3}
            sx={{ px: 3, py: 4, textAlign: 'center' }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('cart-drawer-empty-title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('cart-drawer-empty-message')}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleBrowseProducts}
              sx={{
                width: 321,
                height: 44,
                backgroundColor: 'primary.main',
                color: 'secondary.light',
                borderTopRightRadius: 24,
                borderBottomLeftRadius: 24,
                borderTopLeftRadius: 0,
                borderBottomRightRadius: 0,
                pt: '12px',
                pr: '24px',
                pb: '12px',
                pl: '24px',
                gap: '10px',
                fontSize: '13px',
                lineHeight: '150%',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {t('browse-products-and-services')}
            </Button>
          </Stack>
          {!isAuthenticated && (
            <Box sx={{ ...styles.footer, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" component="span">
                {t('already-have-an-account')}
              </Typography>{' '}
              <Link component="button" variant="body2" onClick={handleLoginClick}>
                {t('log-in')}
              </Link>
            </Box>
          )}
        </>
      )}

      {!!cartItemCount && (
        <>
          <Stack sx={styles.itemList} divider={<Divider />} spacing={2}>
            {cartItems.map((item) => {
              const lineId = cartItemGetters.getCartItemLineId(item)
              const quantity = cartItemGetters.getCartItemQuantity(item)
              const unitPrice = cartItemGetters.getCartItemUnitPrice(item)
              const productCode = cartItemGetters.getCartItemProductCode(item)

              return (
                <Box key={lineId}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" fontWeight={600}>
                      {cartItemGetters.getCartItemProductName(item)}
                    </Typography>
                    <Price
                      variant="body2"
                      fontWeight="600"
                      price={t('currency', { val: unitPrice })}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {productCode}
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={1.5}
                  >
                    <QuantitySelector
                      quantity={quantity}
                      minQty={1}
                      onDecrease={() => handleQuantityChange(lineId, quantity - 1)}
                      onIncrease={() => handleQuantityChange(lineId, quantity + 1)}
                      onQuantityUpdate={(qty) => handleQuantityChange(lineId, qty)}
                    />
                    <IconButton
                      onClick={() => handleDelete(lineId)}
                      aria-label={t('remove')}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              )
            })}
          </Stack>

          <Box sx={styles.footer}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2">{t('subtotal')}</Typography>
              <Price variant="body1" price={t('currency', { val: subTotal })} />
            </Stack>
            <Stack direction="row" justifyContent="space-between" mb={1.5}>
              <Box>
                <Typography variant="body2">{t('shipping')}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('with-fortis')}
                </Typography>
              </Box>
              <Price variant="body1" price={t('currency', { val: shippingTotal })} />
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography variant="body1" fontWeight={600}>
                {t('total')}
              </Typography>
              <Price variant="body1" fontWeight="600" price={t('currency', { val: total })} />
            </Stack>
            <LoadingButton
              variant="contained"
              fullWidth
              onClick={handleGoToCheckout}
              loading={initiateOrder.isPending}
              disabled={initiateOrder.isPending}
              sx={{
                backgroundColor: 'primary.main',
                color: 'secondary.light',
                borderRadius: '0px 24px',
                py: 1.5,
              }}
            >
              {t('go-to-checkout')}
            </LoadingButton>
          </Box>
        </>
      )}
    </Drawer>
  )
}

export default CartSideDrawer
