import { useQuery } from '@tanstack/react-query'

import { makeGraphQLClient } from '@/lib/gql/client'
import { getCustomerAccountContactQuery } from '@/lib/gql/queries'
import { customerAccountContactsKeys } from '@/lib/react-query/queryKeys'

import type { CustomerContact } from '@/lib/gql/types'

const loadCustomerAccountContact = async (accountId: number, contactId: number) => {
  const client = makeGraphQLClient()
  const response = await client.request({
    document: getCustomerAccountContactQuery,
    variables: { accountId, contactId },
  })

  return response?.customerAccountContact
}

export const useGetCustomerAccountContact = (accountId: number, contactId?: number) => {
  const query = useQuery<CustomerContact | undefined>({
    queryKey: customerAccountContactsKeys.contactById(accountId, contactId),
    queryFn: () => {
      if (contactId === undefined) {
        throw new Error('contactId is required to fetch a customer contact')
      }
      return loadCustomerAccountContact(accountId, contactId)
    },
    enabled: Boolean(accountId && contactId !== undefined),
    refetchOnWindowFocus: false,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
  }
}
