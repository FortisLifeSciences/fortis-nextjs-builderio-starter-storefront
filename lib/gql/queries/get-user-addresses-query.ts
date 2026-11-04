import { userContactFields } from '../fragments'

const getUserAddressesQuery = /* GraphQL */ `
  query getUserAddresses($accountId: Int!, $userId: String, $startIndex: Int, $pageSize: Int) {
    customerAccountContacts(
      accountId: $accountId
      userId: $userId
      startIndex: $startIndex
      pageSize: $pageSize
    ) {
      pageCount
      totalCount
      startIndex
      pageSize
      items {
        ...userContactFields
      }
    }
  }

  ${userContactFields}
`

export default getUserAddressesQuery
