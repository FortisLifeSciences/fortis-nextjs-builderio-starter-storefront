/**
 * @module useUpdateOrderAttributes
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { makeGraphQLClient } from '@/lib/gql/client'
import { updateCheckoutAttributesMutation } from '@/lib/gql/mutations'
import { checkoutKeys } from '@/lib/react-query/queryKeys'

import { CrOrderAttributeInput } from '@/lib/gql/types'

export interface UpdateOrderAttributeInput {
  orderId: string
  removeMissing?: boolean
  orderAttributeInput: [CrOrderAttributeInput]
}

const updateOrderAttributes = async (params: UpdateOrderAttributeInput) => {
  const client = makeGraphQLClient()

  const response = await client.request({
    document: updateCheckoutAttributesMutation,
    variables: params,
  })

  return response
}

/**
 * [Mutation hook] useUpdateOrderAttributes uses the graphQL mutation
 *
 * <b>useUpdateOrderAttributes(orderId: String!): CrOrder</b>
 *
 * Description : Updates current order in checkout
 *
 * Parameters passed to function useUpdateOrderAttributes(orderId: string) => expects orderId as string type
 *
 * On success, calls invalidateQueries on checkoutKeys and fetches the updated result.
 *
 * @returns 'response?.checkout', which contains updated shipping checkout information
 */

export const useUpdateOrderAttributes = () => {
  const queryClient = useQueryClient()

  return {
    updateOrderAttributes: useMutation({
      mutationFn: updateOrderAttributes,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: checkoutKeys.all })
      },
    }),
  }
}
