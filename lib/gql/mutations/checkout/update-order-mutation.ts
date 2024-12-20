import {
  baseCheckoutFragment,
  checkoutLineItemFragment,
  checkoutPaymentFragment,
  fullfillmentInfoFragment,
} from '../../fragments'

const updateOrderMutation = /* GraphQL */ `
  mutation updateOrder($orderId: String!, $orderInput: CrOrderInput) {
    updateOrder(orderId: $orderId, orderInput: $orderInput) {
      ...baseCheckoutFragment
      shopperNotes {
        comments
      }
      items {
        ...checkoutLineItemFragment
      }
      fulfillmentInfo {
        ...fullfillmentInfoFragment
      }
      payments {
        ...checkoutPaymentFragment
      }
    }
  }

  ${baseCheckoutFragment}
  ${checkoutLineItemFragment}
  ${fullfillmentInfoFragment}
  ${checkoutPaymentFragment}
`

export default updateOrderMutation
