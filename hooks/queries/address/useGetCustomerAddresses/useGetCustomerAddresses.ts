/**
 * @module useGetCustomerAddresses
 */
import { useQuery } from '@tanstack/react-query'
import getConfig from 'next/config'

import { makeGraphQLClient } from '@/lib/gql/client'
import { getUserAddressesQuery } from '@/lib/gql/queries'
import { customerAccountContactsKeys } from '@/lib/react-query/queryKeys'

import type { CustomerContactCollection } from '@/lib/gql/types'

/**
 * @hidden
 */
export interface UseCustomerContactsResponse {
  data: CustomerContactCollection
  isLoading: boolean
  isSuccess: boolean
}

const { publicRuntimeConfig } = getConfig()
const customerAddressesPageSize = publicRuntimeConfig.customerAddressesPageSize

const loadCustomerAccountContacts = async (accountId: number, userId?: string) => {
  const client = makeGraphQLClient()

  const response = await client.request({
    document: getUserAddressesQuery,
    variables: { accountId, userId, pageSize: customerAddressesPageSize },
  })

  return response?.customerAccountContacts
}

/**
 * [Query hook] useGetCustomerAddresses uses the graphQL query
 *
 * <b>customerAccountContacts(accountId: Int!,startIndex: Int,pageSize: Int): CustomerContactCollection</b>
 *
 * Description : Fetches saved addresses for a particular user
 *
 * Parameters passed to function loadCustomerAccountContacts(accountId: number) => expects accountId.
 *
 * On success, returns the saved addresses with 'refetchOnWindowFocus' set to false for this react query
 *
 * @param accountId stores the user id of the user whose saved address details needed to be fetched
 *
 * @returns 'response?.customerAccountContacts' which contains all the saved addresses details for the requested user based on accountId
 */

export const useGetCustomerAddresses = (
  accountId: number,
  userId?: string
): UseCustomerContactsResponse => {
  const {
    data = [],
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: customerAccountContactsKeys.addressById(accountId, userId),
    queryFn: () => loadCustomerAccountContacts(accountId, userId),
    refetchOnWindowFocus: false,
    enabled: !!accountId && !!userId,
  })

  return { data, isLoading, isSuccess }
}
