import { useQueryClient } from '@tanstack/react-query'

import { cartKeys } from '@/lib/react-query/queryKeys'

import type { CrCart } from '@/lib/gql/types'

export const useRefetchCart = () => {
  const queryClient = useQueryClient()

  const refetchCart = async () => {
    try {
      await queryClient.refetchQueries({
        queryKey: cartKeys.all,
        exact: true,
      })
      // Access the latest cached data
      const cachedData = queryClient.getQueryData<CrCart>(cartKeys.all)
      return cachedData
    } catch (err) {
      console.error('Error during refetch:', err)
      throw err
    }
  }

  return { refetchCart }
}
