import * as gaConstants from '@/lib/utils/google-tag-manager/constants'

export type DataLayerEvent =
  | ViewItem
  | AddToCart
  | BeginCheckout
  | AddShippingInfo
  | AddPaymentInfo
  | Purchase
  | CustomEvent

export interface CustomEvent {
  event: string
  [key: string]: any
}

export interface AddToCart {
  event: typeof gaConstants.ADD_TO_CART
  userId: any
  value: {
    currency: typeof gaConstants.CURRENCY_CAD
    value: number
    items: Items
  }
}

export interface removeFromCart {
  event: typeof gaConstants.REMOVE_FROM_CART
  userId: any
  value: {
    currency: typeof gaConstants.CURRENCY_CAD
    value: number
    items: Items
  }
}

export interface viewCart {
  event: typeof gaConstants.VIEW_CART
  userId: any
  value: {
    currency: typeof gaConstants.CURRENCY_CAD
    value: number
    items: Items
  }
}

export interface addToWishlist {
  event: typeof gaConstants.ADD_TO_WISHLIST
  userId: any
  value: {
    currency: typeof gaConstants.CURRENCY_CAD
    value: number
    items: Items
  }
}

export interface selectItem {
  event: typeof gaConstants.SELECT_ITEM
  userId: any
  value: {
    item_list_id: string
    item_list_name: string
    items: Items
  }
}

export interface viewItemList {
  event: typeof gaConstants.VIEW_ITEM_LIST
  userId: any
  value: {
    item_list_id: string
    item_list_name: string
    items: Items
  }
}

export interface ViewItem {
  event: typeof gaConstants.VIEW_ITEM
  userId: any
  value: {
    currency: typeof gaConstants.CURRENCY_CAD
    value: number
    items: Items
  }
}

export interface Search {
  event: typeof gaConstants.SEARCH
  search_term: any
}

export interface BeginCheckout {
  event: typeof gaConstants.BEGIN_CHECKOUT
  userId: any
  value: {
    currency: typeof gaConstants.CURRENCY_CAD
    value: number
    coupon?: string
    items: Items
  }
}

export interface AddShippingInfo {
  event: typeof gaConstants.ADD_SHIPPING_INFO
  userId: any
  value: {
    currency: typeof gaConstants.CURRENCY_CAD
    value: number
    ship_to: string
    shipping_tier?: string
    items: Items
  }
}

export interface AddShipMethod {
  event: typeof gaConstants.ADD_SHIP_METHOD
  userId: any
  value: {
    currency: typeof gaConstants.CURRENCY_CAD
    value: number
    ship_method: string
    items: Items
  }
}

export interface AddPaymentInfo {
  event: typeof gaConstants.ADD_PAYMENT_INFO
  userId: any
  value: {
    currency: typeof gaConstants.CURRENCY_CAD
    value: number
    payment_type?: string
    items: Items
  }
}

export interface CheckoutFailure {
  event: typeof gaConstants.CHECKOUTFAILURE
  userId: any
  orderNumber: any
  errorDescription: string
  errorCategory: any
}

export interface Purchase {
  event: typeof gaConstants.PURCHASE
  userId: any
  value: {
    transaction_id: any
    affiliation: any
    value: number
    tax?: string
    shipping?: number
    currency: typeof gaConstants.CURRENCY_CAD
    items: Items
  }
}

export type Items = Array<Item>

export interface Item {
  item_id: string
  item_name: string
  item_list_id?: string | undefined
  affiliation?: string | undefined
  coupon?: string | undefined
  discount?: number | undefined
  index?: number | undefined
  item_brand?: string | undefined
  item_category?: string | undefined
  item_category2?: string | undefined
  item_category3?: string | undefined
  item_category4?: string | undefined
  item_category5?: string | undefined
  item_list_name?: string | undefined
  item_variant?: string | undefined
  location_id?: string | undefined
  price?: number | undefined
  quantity?: number | undefined
  currency: string
}
