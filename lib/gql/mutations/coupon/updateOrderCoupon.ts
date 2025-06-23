import {
  baseCheckoutFragment,
  checkoutLineItemFragment,
  fullfillmentInfoFragment,
  checkoutPaymentFragment,
} from '@/lib/gql/fragments'

const updateOrderCouponMutation = /* GraphQL */ `
  mutation updateOrderCoupon($orderId: String!, $couponCode: String!) {
    updateOrderCoupon(orderId: $orderId, couponCode: $couponCode) {
      ...baseCheckoutFragment
      couponCodes
      items {
        ...checkoutLineItemFragment
      }
      fulfillmentInfo {
        ...fullfillmentInfoFragment
      }
      payments {
        ...checkoutPaymentFragment
      }
      discountThresholdMessages {
        message
        showInCart
        showOnCheckout
        requiresCouponCode
        discountId
      }
    }
  }
  ${baseCheckoutFragment}
  ${checkoutLineItemFragment}
  ${fullfillmentInfoFragment}
  ${checkoutPaymentFragment}
`

export default updateOrderCouponMutation
