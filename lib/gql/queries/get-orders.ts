import { baseOrderFragment, orderItemFragment, orderPaymentFragment } from '../fragments/orders'

const getOrdersQuery = /* GraphQL */ `
  query getOrders($filter: String, $startIndex: Int, $pageSize: Int, $sortBy: String) {
    orders(filter: $filter, startIndex: $startIndex, pageSize: $pageSize, sortBy: $sortBy) {
      pageCount
      totalCount
      items {
        ...baseOrderFragment
        items {
          ...orderItemFragment
        }
        payments {
          ...orderPaymentFragment
        }
      }
    }
  }
  ${orderItemFragment}
  ${baseOrderFragment}
  ${orderPaymentFragment}
`

export default getOrdersQuery
