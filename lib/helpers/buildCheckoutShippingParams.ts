import type { CrOrder, CrContact, CrFulfillmentInfoInput } from '@/lib/gql/types'

export interface ShippingParams {
  orderId: string
  fulfillmentInfoInput: CrFulfillmentInfoInput
}

export interface CheckoutShippingParams {
  checkout: CrOrder
  contact?: CrContact
  email?: string
  shippingMethodCode?: string
  shippingMethodName?: string
}

export const buildCheckoutShippingParams = (params: CheckoutShippingParams): ShippingParams => {
  const { checkout, contact, email, shippingMethodCode, shippingMethodName } = params

  return {
    orderId: checkout.id,

    fulfillmentInfoInput: {
      fulfillmentContact: {
        ...(contact ? contact : checkout.fulfillmentInfo?.fulfillmentContact),
        // Prefer an explicit `email` override, then `contact`'s own email, then the order's.
        email: (email && email !== '' ? email : contact?.email) || checkout.email,
      },

      // `undefined` means "this caller doesn't touch shipping method" (e.g. the contact-save
      // call) - fall back to whatever's already saved. An explicit '' means "clear it" (e.g.
      // switching to an account-shipping option before its account number is valid yet) and
      // must actually clear to null, not silently re-assert the previous method.
      shippingMethodCode:
        shippingMethodCode !== undefined
          ? shippingMethodCode || null
          : checkout.fulfillmentInfo?.shippingMethodCode || null,

      shippingMethodName:
        shippingMethodName !== undefined
          ? shippingMethodName || null
          : checkout.fulfillmentInfo?.shippingMethodName || null,
    } as CrFulfillmentInfoInput,
  } as ShippingParams
}
