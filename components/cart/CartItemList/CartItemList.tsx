import { useRef } from 'react'

import { Box, Collapse } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'

import { CartItem } from '@/components/cart'
import { FullWidthDivider } from '@/components/common'
import { useAuthContext } from '@/context/AuthContext'
import { FulfillmentOptions } from '@/lib/constants'
import { cartItemGetters } from '@/lib/getters'
import { cartGetters } from '@/lib/getters/cartGetters'
import { FulfillmentOption } from '@/lib/types'
import { addToCartGTMPDP, removeFromCartGTM } from '@/lib/utils/google-tag-manager'

import type { CrCartItem, CrOrderItem, Location, Maybe } from '@/lib/gql/types'

interface CartItemListProps {
  cartItems: Maybe<CrCartItem>[] | Maybe<CrOrderItem>[]
  fulfillmentLocations: Location[]
  purchaseLocation: Location
  status?: string
  mode?: string
  isQuote?: boolean
  onCartItemQuantityUpdate: (cartItemId: string, quantity: number, cartItem: CrCartItem) => void
  onCartItemDelete: (cartItemId: string, cartItem: CrCartItem) => void
  onCartItemActionSelection: () => void
  onFulfillmentOptionChange: (fulfillmentMethod: string, cartItemId: string) => void
  onProductPickupLocation: (cartItemId: string) => void
}

const CartItemList = (props: CartItemListProps) => {
  const {
    cartItems,
    fulfillmentLocations = [],
    purchaseLocation,
    status,
    mode,
    isQuote,
    onCartItemQuantityUpdate,
    onCartItemDelete,
    onCartItemActionSelection,
    onFulfillmentOptionChange,
    onProductPickupLocation,
  } = props
  const { isAuthenticated, user } = useAuthContext()
  const previousQuantities = useRef<Record<string, number>>({})
  const handleQuantityUpdate = (cartItemId: string, quantity: number, cartItem: CrCartItem) => {
    const previousQuantity = previousQuantities.current[cartItemId] || cartItem.quantity
    onCartItemQuantityUpdate(cartItemId, quantity, cartItem)
    if (
      quantity > previousQuantity &&
      cartItem &&
      cartItem?.product?.productCode &&
      cartItem?.product?.name
    ) {
      addToCartGTMPDP(
        cartItemGetters.getCartItemUnitPrice(cartItem),
        user?.userId,
        cartItem?.product?.productCode,
        cartItem?.product?.name.replace(/[^a-zA-Z0-9 -]/g, ''),
        '',
        cartItemGetters.getCartItemBrandName(cartItem),
        cartItemGetters.getCartItemVariantCode(cartItem),
        cartItemGetters.getCartItemUnitPrice(cartItem),
        cartItemGetters.getCartItemQuantity(cartItem)
      )
    } else {
      removeFromCartGTM(cartItem, user?.userId, '')
      previousQuantities.current[cartItemId] = quantity
    }
  }

  const handleCartItemDelete = (cartItemId: string, cartItem: CrCartItem) =>
    onCartItemDelete(cartItemId, cartItem)

  const handleCartItemActionSelection = () => onCartItemActionSelection()

  const handleSupportedFulfillmentOptions = (cartItem: CrCartItem): FulfillmentOption[] => {
    const location =
      cartItem?.fulfillmentLocationCode && cartItem?.fulfillmentMethod === FulfillmentOptions.PICKUP
        ? cartGetters.getCartItemFulfillmentLocation(cartItem, fulfillmentLocations)
        : purchaseLocation
    return cartGetters.getProductFulfillmentOptions(cartItem, location)
  }

  return (
    <TransitionGroup>
      {cartItems?.map((item: Maybe<CrCartItem> | Maybe<CrOrderItem>) => (
        <Collapse
          key={`${item?.id}`}
          sx={{
            '.MuiCollapse-wrapperInner': {
              width: '100%',
            },
          }}
        >
          <CartItem
            cartItem={item}
            key={item?.id}
            maxQuantity={undefined}
            status={status}
            mode={mode}
            isQuote={isQuote}
            onQuantityUpdate={handleQuantityUpdate}
            onCartItemDelete={handleCartItemDelete}
            onCartItemActionSelection={handleCartItemActionSelection}
            fulfillmentOptions={handleSupportedFulfillmentOptions(item as CrCartItem)}
            onFulfillmentOptionChange={onFulfillmentOptionChange}
            onProductPickupLocation={onProductPickupLocation}
          />
          <Box sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}>
            <FullWidthDivider />
          </Box>
        </Collapse>
      ))}
    </TransitionGroup>
  )
}

export default CartItemList
