import { CrContact, CrAddress, CrOrderItem, Maybe } from '../gql/types'

interface ContactDetails {
  firstName: string
  lastNameOrSurname: string
}

export interface ShippingDetails extends ContactDetails {
  detailType?: string
  shippingPhoneHome: string
  shippingPhoneMobile: string
  shippingPhoneWork: string
  companyOrOrganization?: string
  shippingAddress: CrAddress
  shippingMethod?: any
}

export interface BillingDetails extends ContactDetails {
  detailType?: string
  billingPhoneHome?: string
  billingPhoneMobile?: string
  billingPhoneWork?: string
  billingCompanyOrOrganization?: string
  billingAddress: CrAddress
  payment?: any
  companyOrOrganization?: string
}

export interface OrderSummary {
  shippingTotal: number
  subTotal: number
  taxTotal: number
  total: number
  totalCollected: number
  discountedSubtotal: number
}
export interface PaymentMethod {
  cardType: string
  cardNumberPartOrMask: string
  expiry: string
}
export interface CheckoutDetails {
  shipItems: Maybe<CrOrderItem>[]
  pickupItems: Maybe<CrOrderItem>[]
  digitalItems: Maybe<CrOrderItem>[]
  orderSummary: OrderSummary
  personalDetails: CrContact
  shippingDetails: ShippingDetails
  billingDetails: BillingDetails
  paymentMethods: PaymentMethod[]
  purchaseOrderPaymentMethods?: any[]
  shippingMethod: string
}
