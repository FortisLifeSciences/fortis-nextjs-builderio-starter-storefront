import getConfig from 'next/config'

import { CrCartItem, type CrOrderItem } from '@/lib/gql/types'

const { publicRuntimeConfig } = getConfig()

const getCartItemProductCode = (cartItem: CrCartItem | CrOrderItem): string => {
  const productCode = cartItem.product?.productCode || ''

  if (productCode && productCode !== '') {
    return productCode
  }

  return cartItem.product?.variationProductCode || ''
}

const getCartItemVariantCode = (cartItem: CrCartItem | CrOrderItem): string => {
  return cartItem.product?.variationProductCode || 'NA'
}

const getCartItemProductName = (cartItem: CrCartItem | CrOrderItem): string =>
  cartItem.product?.name || ''

const getCartItemDiscountTotal = (cartItem: CrCartItem | CrOrderItem): number =>
  cartItem.discountTotal || 0

const getCartItemLineId = (cartItem: CrCartItem | CrOrderItem): string =>
  (cartItem.id as string) || ''

const getCartItemBrand = (cartItem: CrCartItem | CrOrderItem): string => {
  const brandAttr = cartItem.product?.properties?.find(
    (property) => property?.attributeFQN === 'tenant~brand'
  )?.values

  if (brandAttr && brandAttr.length > 0) {
    return brandAttr?.[0]?.value
  }

  return 'N/A'
}

const getCartItemBrandName = (cartItem: CrCartItem | CrOrderItem): string => {
  const brandAttr = cartItem.product?.properties?.find(
    (property) => property?.attributeFQN === 'tenant~brand'
  )?.values

  if (brandAttr && brandAttr.length > 0) {
    return brandAttr?.[0]?.stringValue || 'N/A'
  }

  return 'N/A'
}

const getCartItemQuantity = (cartItem: CrCartItem | CrOrderItem): number => cartItem?.quantity || 0

const getCartItemUnitPrice = (cartItem: CrCartItem | CrOrderItem): number => {
  const salePrice = cartItem?.product?.price?.salePrice

  if (salePrice) {
    return salePrice
  }

  return cartItem?.product?.price?.price || 0
}

const getCartItemLocationId = (cartItem: CrCartItem | CrOrderItem): string => {
  return cartItem.fulfillmentLocationCode || ''
}

export const cartItemGetters = {
  getCartItemProductCode,
  getCartItemVariantCode,
  getCartItemProductName,
  getCartItemDiscountTotal,
  getCartItemLineId,
  getCartItemBrand,
  getCartItemQuantity,
  getCartItemUnitPrice,
  getCartItemLocationId,
  getCartItemBrandName,
}
