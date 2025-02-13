import { map, reduce } from 'lodash'

import * as gaEvents from './constants'
import {
  AddToCart,
  AddPaymentInfo,
  AddShippingInfo,
  BeginCheckout,
  Item,
  Items,
  Purchase,
  ViewItem,
  selectItem,
  viewItemList,
  Search,
  CheckoutFailure,
  AddShipMethod,
  addToWishlist,
  viewCart,
  removeFromCart,
} from './types'
import { PaymentType } from '@/lib/constants'
import { cartGetters, orderGetters, productGetters, wishlistGetters } from '@/lib/getters'
import { cartItemGetters } from '@/lib/getters/cartItemGetters'

import {
  CrCart,
  CrCartItem,
  CrOrder,
  CrOrderItem,
  CrProduct,
  CrWishlist,
  CrWishlistItem,
  Product,
} from '@/lib/gql/types'

//eslint-disable-next-line
const sendGTMEvent = (data: any) => {
  if (
    typeof window !== 'undefined' &&
    window.dataLayer &&
    process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production'
  ) {
    window.dataLayer.push(data)
  }
  if (
    typeof window !== 'undefined' &&
    !window.dataLayer &&
    process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production'
  ) {
    window.dataLayer = []
    window.dataLayer.push(data)
  }
}

const resetEcommerceDataLayer = () => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ ecommerce: null })
  }
}

// export const pageView = (url: string) => {
//   if (typeof window !== 'undefined' && window.dataLayer) {
//     window.dataLayer.push({
//       event: 'pageview',
//       page: {
//         url: url,
//         title: document.title || 'Untitled Page',
//       },
//     })
//   }
// }

// export const initializePageView = () => {
//   if (typeof window !== 'undefined') {
//     if (!window.dataLayer) {
//       window.dataLayer = []
//     }
//     window.dataLayer.push({
//       event: 'pageview',
//       page: {
//         url: window.location.pathname,
//         title: document.title || 'Untitled Page',
//       },
//     })
//   }
// }
export const plpClick = (
  userId: any,
  id: string,
  name: string,
  category: string | undefined,
  brand: string,
  list: any,
  position: any,
  prodUrl: any
) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: selectItem = {
    event: gaEvents.SELECT_ITEM,
    //userId: userId,
    ecommerce: {
      item_list_id: 'PLP',
      item_list_name: list,
      items: [
        {
          item_id: id,
          item_name: name.replace(/[^a-zA-Z0-9 -]/g, ''),
          currency: gaEvents.CURRENCY_CAD,
          item_category: category,
          item_brand: brand,
          item_list_id: 'PLP',
          item_list_name: list,
          index: position,
        },
      ],
    },
  }
  if (prodUrl !== '') {
    document.location = prodUrl
  }
  sendGTMEvent(data)
}

export const measureImpression = (
  id: string,
  userId: any,
  name: string,
  category: string,
  brand: string,
  list: any,
  position: any
) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: viewItemList = {
    event: gaEvents.VIEW_ITEM_LIST,
    //userId: userId,
    ecommerce: {
      item_list_id: 'PLP',
      item_list_name: list,
      items: [
        {
          item_id: id,
          item_name: name.replace(/[^a-zA-Z0-9 -]/g, ''),
          currency: gaEvents.CURRENCY_CAD,
          item_category: category,
          item_brand: brand,
          item_list_id: 'PLP',
          item_list_name: list,
          index: position,
        },
      ],
    },
  }
  sendGTMEvent(data)
}

export const addToCartGTMPDP = (
  totalPrice: number,
  userId: any,
  id: string,
  name: string,
  category: string,
  brand: string,
  variant: string,
  price: number,
  quantity: number
) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: AddToCart = {
    event: gaEvents.ADD_TO_CART,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: totalPrice,
      items: [
        {
          item_id: id,
          item_name: name.replace(/[^a-zA-Z0-9 -]/g, ''),
          currency: 'USD',
          item_category: category,
          item_brand: brand,
          item_variant: variant,
          price: price,
          quantity: quantity,
        },
      ],
    },
  }

  sendGTMEvent(data)
}

export const addToCartGTM = (userId: any, value: number, products: Items) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: AddToCart = {
    event: gaEvents.ADD_TO_CART,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: value,
      items: products,
    },
  }

  sendGTMEvent(data)
}

export const viewItemGTM = (
  id: string,
  userId: any,
  name: string,
  category: string,
  brand: string,
  price: number
) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: ViewItem = {
    event: gaEvents.VIEW_ITEM,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: price,
      items: [
        {
          item_id: id,
          item_name: name.replace(/[^a-zA-Z0-9 -]/g, ''),
          currency: gaEvents.CURRENCY_CAD,
          item_category: category,
          item_brand: brand,
          item_list_id: 'PDP',
          item_list_name: 'Product Detail Page',
        },
      ],
    },
  }

  sendGTMEvent(data)
}

export const searchGTM = (query: any) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: Search = {
    event: gaEvents.SEARCH,
    search_term: query,
  }

  sendGTMEvent(data)
}

export const emtpyCartGTM = async (cart: CrCart, userId: any) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: removeFromCart = {
    event: gaEvents.REMOVE_FROM_CART,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: cartGetters.getCartTotal(cart),
      items: mapCartItemsToGAEvent(cartGetters.getCartItems(cart).filter((item) => item !== null)),
    },
  }

  sendGTMEvent(data)
}

export const removeFromCartGTM = (cartItem: any, userId: any, cart: any) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: removeFromCart = {
    event: gaEvents.REMOVE_FROM_CART,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: cartItemGetters.getCartItemUnitPrice(cartItem),
      items: [mapCartItemForGAEvent(cartItem)],
    },
  }

  sendGTMEvent(data)
}

export const viewCartGTM = async (cart: CrCart, userId: any) => {
  //eslint-disable-next-line
  //console.log('viewcart')
  resetEcommerceDataLayer()
  const data: viewCart = {
    event: gaEvents.VIEW_CART,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: cart?.total || 0,
      items: mapCartItemsToGAEvent(cartGetters.getCartItems(cart).filter((item) => item !== null)),
    },
  }

  sendGTMEvent(data)
}

export const addToWishlistGTM = (items: any, userId: any) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: addToWishlist = {
    event: gaEvents.ADD_TO_WISHLIST,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: 0,
      items: [],
    },
  }

  sendGTMEvent(data)
}

export const beginCheckoutGTM = (cart: CrCart, userId: any) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: BeginCheckout = {
    event: gaEvents.BEGIN_CHECKOUT,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: cartGetters.getCartTotal(cart),
      items: mapCartItemsToGAEvent(cartGetters.getCartItems(cart).filter((item) => item !== null)),
    },
  }

  sendGTMEvent(data)
}

export const addShippingInfoGTM = (order: CrOrder, userId: any) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: AddShippingInfo = {
    event: gaEvents.ADD_SHIPPING_INFO,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: orderGetters.getTotal(order),
      ship_to: orderGetters.getShippingAddress(order).postalOrZipCode,
      items: mapCartItemsToGAEvent(
        orderGetters.getAllOrderItems(order).filter((item) => item !== null)
      ),
    },
  }

  sendGTMEvent(data)
}

export const addShipMethodGTM = (order: CrOrder, userId: any) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: AddShipMethod = {
    event: gaEvents.ADD_SHIP_METHOD,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: orderGetters.getTotal(order),
      ship_method: orderGetters.getShippingMethodName(order),
      items: mapCartItemsToGAEvent(
        orderGetters.getAllOrderItems(order).filter((item) => item !== null)
      ),
    },
  }

  sendGTMEvent(data)
}

export const addPaymentInfoGTM = (order: CrOrder, paymentType: PaymentType, userId: any) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: AddPaymentInfo = {
    event: gaEvents.ADD_PAYMENT_INFO,
    //userId: userId,
    ecommerce: {
      currency: gaEvents.CURRENCY_CAD,
      value: orderGetters.getTotal(order),
      payment_type: paymentType,
      items: mapCartItemsToGAEvent(
        orderGetters.getAllOrderItems(order).filter((item) => item !== null)
      ),
    },
  }

  sendGTMEvent(data)
}

export const checkoutFailure = (order: CrOrder, userId: any, errMsg: string, errorCat: any) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: CheckoutFailure = {
    event: gaEvents.CHECKOUTFAILURE,
    //userId: userId,
    orderNumber: orderGetters.getOrderNumber(order),
    errorDescription: errMsg,
    errorCategory: errorCat,
  }

  sendGTMEvent(data)
}

export const purchaseGTM = (order: CrOrder, userId: any, affiliation: any) => {
  //eslint-disable-next-line
  resetEcommerceDataLayer()
  const data: Purchase = {
    event: gaEvents.PURCHASE,
    //userId: userId,
    ecommerce: {
      transaction_id: orderGetters.getOrderNumber(order),
      affiliation: affiliation,
      value: orderGetters.getTotal(order),
      tax: orderGetters.getTaxTotal(order).toString(),
      shipping: orderGetters.getShippingTotal(order),
      currency: gaEvents.CURRENCY_CAD,
      items: mapCartItemsToGAEvent(
        orderGetters.getAllOrderItems(order).filter((item) => item !== null)
      ),
    },
  }

  sendGTMEvent(data)
}

export const mapWishListItemsToGAEvent = (wishlistItems: Array<CrWishlistItem>): Items =>
  map(wishlistItems, mapWishListItemForGAEvent)

export const mapWishListItemForGAEvent = (wishlistItem: CrWishlistItem): Item => {
  return {
    item_id: wishlistItem?.product?.productCode || '',
    item_name: 'wishlistItem?.product?.',
    currency: gaEvents.CURRENCY_CAD,
    item_category: '',
    item_brand: 'cartItemGetters.getCartItemBrand(wishlistItem)',
    item_variant: 'cartItemGetters.getCartItemVariantCode(wishlistItem)',
    price: 0,
    quantity: 0,
  }
}

export const mapCartItemsToGAEvent = (cartItems: Array<any>): Items =>
  map(cartItems, mapCartItemForGAEvent)

export const mapCartItemForGAEvent = (cartItem: any): Item => {
  //console.log('cartItem',cartItem)

  return {
    item_id: cartItemGetters.getCartItemProductCode(cartItem),
    item_name: cartItemGetters.getCartItemProductName(cartItem).replace(/[^a-zA-Z0-9 -]/g, ''),
    currency: gaEvents.CURRENCY_CAD,
    item_category: cartItem?.product?.categories?.[0]?.content?.name || '',
    item_brand: cartItemGetters.getCartItemBrandName(cartItem),
    item_variant: cartItemGetters.getCartItemVariantCode(cartItem),
    price: cartItemGetters.getCartItemUnitPrice(cartItem),
    quantity: cartItemGetters.getCartItemQuantity(cartItem),
  }
}

export const getValueOfItemList = (items: Items) => {
  return reduce(
    items,
    (value, item) => {
      if (item.price && item.quantity) {
        const valueOfItem = item.price * item.quantity
        return value + valueOfItem
      }

      return value
    },
    0
  )
}
