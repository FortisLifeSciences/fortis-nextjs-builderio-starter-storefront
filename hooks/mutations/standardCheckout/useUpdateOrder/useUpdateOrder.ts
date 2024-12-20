/**
 * @module useUpdateOrder
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { makeGraphQLClient } from '@/lib/gql/client'
import { updateOrderMutation } from '@/lib/gql/mutations'

import { checkoutKeys } from '@/lib/react-query/queryKeys'

import type { CrOrder } from '@/lib/gql/types'

const updateOrder = async (checkout: CrOrder) => {
  const orderUpdatePayload = {
    orderId: checkout.id as string,
    orderInput: checkout,
  }

  const client = makeGraphQLClient()

  const response = await client.request({
    document: updateOrderMutation,
    variables: orderUpdatePayload,
  })

  return response?.updateOrder
}

/**
 * [Mutation hook] useUpdateOrder uses the graphQL mutation
 *
 * <b>updateOrderAction(orderId: orderId, updateMode: updateMode, version: version, orderInput: orderInput ): Order</b>
 *
 * Description : Update order
 *
 * Parameters passed to function updateOrder(checkout: Order) => expects object of type 'Order'
 *
 * On success, calls invalidateQueries on checkoutKeys and fetches the updated result
 *
 */
export const useUpdateOrder = () => {
  const queryClient = useQueryClient()

  return {
    updateOrder: useMutation({
      mutationFn: updateOrder,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: checkoutKeys.all })
      },
    }),
  }
}
