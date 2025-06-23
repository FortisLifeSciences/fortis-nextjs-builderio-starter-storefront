export const cartItemDetails = /* GraphQL */ `
  fragment cartItemDetails on CrCartItem {
    id
    fulfillmentMethod
    subscription {
      frequency {
        unit
        value
      }
    }
    purchaseLocation
    fulfillmentLocationCode
    productDiscounts {
      discountQuantity
      productQuantity
      impactPerUnit
      impact
      excluded
      discount {
        id
        name
        hasMultipleTargetProducts
      }
    }
    discountTotal
    discountedTotal
    subtotal
    total
    product {
      productCode
      variationProductCode
      fulfillmentTypesSupported
      name
      description
      imageUrl
      options {
        attributeFQN
        name
        value
      }
      properties {
        attributeFQN
        name
        values {
          value
          stringValue
        }
      }
      sku
      price {
        price
        salePrice
      }
      categories {
        id
      }
    }
    quantity
  }
`

export const cartDetails = /* GraphQL */ `
  ${cartItemDetails}

  fragment cartDetails on CrCart {
    id
    invalidCoupons {
      couponCode
      reason
    }
    couponCodes
    orderDiscounts {
      impact
      discount {
        id
        name
      }
      couponCode
    }
    discountThresholdMessages {
      message
      showInCart
      showOnCheckout
      requiresCouponCode
      discountId
    }
    total
    subtotal
    discountedSubtotal
    shippingTotal
    taxTotal
    items {
      ...cartItemDetails
    }
  }
`
