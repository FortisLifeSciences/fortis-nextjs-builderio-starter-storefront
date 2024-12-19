import Delete from '@mui/icons-material/Delete'
import {
  Box,
  Card,
  Divider,
  Grid,
  IconButton,
  Link,
  SxProps,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'next-i18next'

import { CartItemActions, CartItemActionsMobile } from '@/components/cart'
import { FulfillmentOptions, Price, ProductItem, QuantitySelector } from '@/components/common'
import { ProductOptionList } from '@/components/product'
import { QuoteStatus } from '@/lib/constants'
import { cartGetters, productGetters } from '@/lib/getters'
import { uiHelpers } from '@/lib/helpers'
import type { FulfillmentOption } from '@/lib/types'

import type { CrCartItem as CartItemType, CrOrderItem, CrProduct, Maybe } from '@/lib/gql/types'

interface CartItemProps {
  cartItem: Maybe<CartItemType> | Maybe<CrOrderItem>
  maxQuantity: number | undefined
  actions?: Array<string>
  fulfillmentOptions: FulfillmentOption[]
  mode?: string
  isQuote?: boolean
  status?: string
  onQuantityUpdate: (cartItemId: string, quantity: number) => void
  onCartItemDelete: (cartItemId: string) => void
  onCartItemActionSelection: () => void
  onFulfillmentOptionChange: (fulfillmentMethod: string, cartItemId: string) => void
  onProductPickupLocation: (cartItemId: string) => void
}

const styles = {
  card: {
    maxWidth: '100%',
    marginBottom: {
      xs: 0,
      sm: 0,
      md: '1.5rem',
    },
    border: {
      xs: `2px solid ${grey[300]}`,
      md: `2px solid ${grey[300]}`,
    },
    boxShadow: 'none',
  },
  cartItemContainer: {
    display: 'flex',
    flexDirection: {
      xs: 'column',
      md: 'row',
    },
    padding: '1rem 0.5rem',
    justifyContent: 'space-around',
  },
  subContainer: {
    flex: 1,
    padding: '0 0.5rem',
    paddingTop: {
      xs: 2,
      md: 0,
    },
    paddingLeft: {
      xs: 0,
      md: 2,
    },
  },
  icon: {
    alignItems: 'flex-start',
    margin: '0',
    position: 'absolute',
    padding: {
      xs: '0.5rem 0',
      sm: '0 0.5rem',
    },
    top: {
      xs: 0,
      sm: '2%',
      md: '5%',
      lg: '6%',
    },
    right: {
      xs: 0,
      sm: 0,
      md: '1%',
      lg: '1%',
    },
  } as SxProps<Theme>,
}

const CartItem = (props: CartItemProps) => {
  const {
    cartItem,
    maxQuantity,
    actions,
    fulfillmentOptions,
    mode,
    status,
    isQuote = false,
    onQuantityUpdate,
    onCartItemDelete,
    onCartItemActionSelection,
    onFulfillmentOptionChange,
    onProductPickupLocation,
  } = props

  const theme = useTheme()
  const { t } = useTranslation('common')
  const orientationVertical = useMediaQuery(theme.breakpoints.between('xs', 'md'))
  const cartItemQuantity = cartItem?.quantity || 1
  const { getProductLink } = uiHelpers()

  const handleDelete = (cartItemId: string) => onCartItemDelete(cartItemId)
  const handleQuantityUpdate = (quantity: number) =>
    onQuantityUpdate(cartItem?.id as string, quantity)
  const handleActionSelection = () => onCartItemActionSelection()
  const handleFulfillmentOptionChange = (fulfillmentMethod: string, cartItemId: string) =>
    onFulfillmentOptionChange(fulfillmentMethod, cartItemId)
  const handleProductPickupLocation = (cartItemId: string) => onProductPickupLocation(cartItemId)
  const subscriptionDetails = cartGetters.getSubscriptionDetails(cartItem)

  const link = getProductLink(cartItem?.product?.productCode as string)
  const options = productGetters.getOptions(cartItem?.product as CrProduct)

  return (
    <>
      <Card sx={{ ...styles.card }} role="group">
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ ...styles.cartItemContainer }}>
            <Box sx={{ ...styles.subContainer }}>
              <Grid container>
                <Grid item sm={12}>
                  <Grid container>
                    <Grid item sm={8}>
                      <Link href={link || ''}>
                        <Typography variant="body1" data-testid="productName" pb={0.375}>
                          {productGetters.getName(cartItem?.product as CrProduct)}
                        </Typography>
                      </Link>
                    </Grid>
                    <Grid item sm={4}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Price
                          variant="body1"
                          fontWeight="500"
                          color="gray.900"
                          price={t('currency', {
                            val: productGetters
                              .getPrice(cartItem?.product as CrProduct)
                              .regular?.toString(),
                          })}
                          salePrice={
                            productGetters.getPrice(cartItem?.product as CrProduct).special
                              ? t('currency', {
                                  val: productGetters.getPrice(cartItem?.product as CrProduct)
                                    .special,
                                })
                              : undefined
                          }
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item sm={12}>
                  <Grid container>
                    <Grid item sm={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'gray.900' }}>
                        {options && options[0]?.value}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      sm={12}
                      md={4}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* TBD */}
                        {/* <Box sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}>
                          <CartItemActionsMobile
                            actions={actions || []}
                            onMenuItemSelection={() => handleActionSelection()}
                          />
                        </Box> */}
                        <Typography variant="body2" sx={{ color: 'gray.900' }}>
                          {cartItem?.product?.variationProductCode
                            ? cartItem?.product?.variationProductCode
                            : cartItem?.product?.productCode}
                        </Typography>

                        {QuoteStatus[status as string] !== QuoteStatus.InReview &&
                          QuoteStatus[status as string] !== QuoteStatus.Completed &&
                          QuoteStatus[status as string] !== QuoteStatus.Expired &&
                          (mode === 'create' || mode === 'edit' || !isQuote) && (
                            <IconButton
                              sx={{ p: 0.5, color: 'primary.main' }}
                              aria-label="item-delete"
                              name="item-delete"
                              onClick={() => handleDelete(cartItem?.id as string)}
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </IconButton>
                          )}
                      </Box>
                    </Grid>
                    <Grid
                      item
                      sm={12}
                      md={4}
                      sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}
                    >
                      <Box sx={{ py: '0.5rem' }}>
                        {QuoteStatus[status as string] === QuoteStatus.InReview ||
                        QuoteStatus[status as string] === QuoteStatus.Completed ||
                        QuoteStatus[status as string] === QuoteStatus.Expired ||
                        (!mode && isQuote) ? (
                          <Typography variant="body2" sx={{ color: 'gray.900' }}>
                            {t('quantity')}:{cartItemQuantity}
                          </Typography>
                        ) : (
                          <QuantitySelector
                            quantity={cartItemQuantity}
                            label={t('quantity')}
                            maxQuantity={maxQuantity}
                            onIncrease={() => handleQuantityUpdate(cartItemQuantity + 1)}
                            onDecrease={() => handleQuantityUpdate(cartItemQuantity - 1)}
                            onQuantityUpdate={(q) => handleQuantityUpdate(q)}
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>

            {/* cart fulfillment, quotes, image and other related code are here currently not in design, may use in future */}
            {/* <ProductItem
                image={productGetters.handleProtocolRelativeUrl(
                  productGetters.getProductImage(cartItem?.product as CrProduct)
                )}
                name={productGetters.getName(cartItem?.product as CrProduct)}
                options={productGetters.getOptions(cartItem?.product as CrProduct)}
                link={getProductLink(cartItem?.product?.productCode as string)}
                subscriptionFrequency={subscriptionDetails as string}
                discounts={cartItem?.productDiscounts}
              >
              </ProductItem> */}
            {/* TBD */}
            {/* <Box sx={{ display: { xs: 'none', sm: 'none', md: 'block', ml: 1 } }}>
                <CartItemActions />
              </Box> */}
            {/* <Divider
              orientation={orientationVertical ? 'vertical' : 'horizontal'}
              sx={orientationVertical ? { borderTopWidth: '1px ' } : { borderLeftWidth: '1px' }}
              flexItem
            /> */}
            {/* <Box sx={{ ...styles.subContainer }}>
              {QuoteStatus[status as string] === QuoteStatus.InReview ||
              QuoteStatus[status as string] === QuoteStatus.Completed ||
              QuoteStatus[status as string] === QuoteStatus.Expired ||
              (!mode && isQuote) ? (
                <Typography>
                  {t('fulfillment-options')} {cartItem?.fulfillmentMethod} -{' '}
                  {cartItem?.fulfillmentLocationCode}
                </Typography>
              ) : (
                <FulfillmentOptions
                  title={t('fulfillment-options')}
                  fulfillmentOptions={fulfillmentOptions}
                  selected={cartItem?.fulfillmentMethod || ''}
                  onFulfillmentOptionChange={(fulfillmentMethod: string) =>
                    handleFulfillmentOptionChange(fulfillmentMethod, cartItem?.id as string)
                  }
                  onStoreSetOrUpdate={() => handleProductPickupLocation(cartItem?.id as string)} // change store: Open storelocator modal. Should not change global store.
                />
              )}
            </Box> */}
          </Box>
        </Box>
      </Card>
    </>
  )
}

export default CartItem
