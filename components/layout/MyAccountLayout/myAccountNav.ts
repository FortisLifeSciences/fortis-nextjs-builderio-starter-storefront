import type { ComponentType, SVGProps } from 'react'

import ListAltOutlined from '@mui/icons-material/ListAltOutlined'

import AccountInformationIcon from '@/assets/icons/myAccountInformation.svg'
import OrderHistoryIcon from '@/assets/icons/myAccountOrderHistory.svg'
import PaymentIcon from '@/assets/icons/myAccountPayment.svg'
import ReorderIcon from '@/assets/icons/myAccountReorder.svg'
import ShippingAddressIcon from '@/assets/icons/myAccountShippingAddress.svg'
import ShippingPreferenceIcon from '@/assets/icons/myAccountShippingPreference.svg'
import { AccountType } from '@/lib/constants'

export type MyAccountNavIcon = ComponentType<SVGProps<SVGSVGElement>>

export interface MyAccountNavItem {
  id: string
  translationKey: string
  href: string
  icon: MyAccountNavIcon
  b2bOnly?: boolean
}

export interface MyAccountNavGroup {
  id: string
  translationKey: string
  items: MyAccountNavItem[]
}

export const myAccountNavGroups: MyAccountNavGroup[] = [
  {
    id: 'account-settings',
    translationKey: 'account-settings',
    items: [
      {
        id: 'account-information',
        translationKey: 'account-information',
        href: '/my-account/account-information',
        icon: AccountInformationIcon,
      },
      {
        id: 'shipping-address',
        translationKey: 'shipping-address',
        href: '/my-account/shipping-address',
        icon: ShippingAddressIcon,
      },
      {
        id: 'shipping-preference',
        translationKey: 'shipping-preference',
        href: '/my-account/shipping-preference',
        icon: ShippingPreferenceIcon,
        b2bOnly: true,
      },
      {
        id: 'payment',
        translationKey: 'payment',
        href: '/my-account/payment',
        icon: PaymentIcon,
      },
    ],
  },
  {
    id: 'orders',
    translationKey: 'orders',
    items: [
      {
        id: 'order-history',
        translationKey: 'order-history',
        href: '/my-account/order-history',
        icon: OrderHistoryIcon,
      },
      {
        id: 'reorder',
        translationKey: 'quick-order',
        href: '/my-account/reorder',
        icon: ReorderIcon,
      },
      {
        id: 'lists',
        translationKey: 'lists',
        href: '/my-account/b2b/lists',
        icon: ListAltOutlined as unknown as MyAccountNavIcon,
        b2bOnly: true,
      },
    ],
  },
]

export const isB2BAccount = (accountType?: string | null) =>
  accountType?.toLowerCase() === AccountType.B2B.toLowerCase()

export const getMyAccountNavGroups = (accountType?: string | null): MyAccountNavGroup[] => {
  const isB2B = isB2BAccount(accountType)

  return myAccountNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.b2bOnly || isB2B),
    }))
    .filter((group) => group.items.length > 0)
}
