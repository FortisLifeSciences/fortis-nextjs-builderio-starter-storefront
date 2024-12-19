/**
 * @module useCreateOrderAttribute
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { makeGraphQLClient } from '@/lib/gql/client'
import { createCheckoutAttributeMutation } from '@/lib/gql/mutations'
import { checkoutKeys } from '@/lib/react-query/queryKeys'

import { CrOrderAttributeInput } from '@/lib/gql/types'

export interface CreateOrderAttributeInput {
  orderId: string
  orderAttributeInput: [CrOrderAttributeInput]
}

const createOrderAttributes = async (params: CreateOrderAttributeInput) => {
  const client = makeGraphQLClient()

  const response = await client.request({
    document: createCheckoutAttributeMutation,
    variables: params,
  })

  return response
}

/**
 * [Mutation hook] useCreateOrderAttribute uses the graphQL mutation
 *
 * <b>useCreateOrderAttribute(orderId: String!): CrOrder</b>
 *
 * Description : Updates current order in checkout
 *
 * Parameters passed to function useCreateOrderAttribute(orderId: string) => expects orderId as string type
 *
 * On success, calls invalidateQueries on checkoutKeys and fetches the updated result.
 *
 * @returns 'response?.checkout', which contains updated shipping checkout information
 */

export const useCreateOrderAttribute = () => {
  const queryClient = useQueryClient()

  return {
    createOrderAttributes: useMutation({
      mutationFn: createOrderAttributes,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: checkoutKeys.all })
      },
    }),
  }
}
