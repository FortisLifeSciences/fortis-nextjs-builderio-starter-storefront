/**
 * @module useDeleteWishlist
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { wishlistKeys } from '@/lib/react-query/queryKeys'

const deleteWishlist = async (wishlistId: string): Promise<boolean> => {
  const response = await fetch(`/api/wishlist/delete-wishlist?wishlistId=${wishlistId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData?.message || 'Failed to delete wishlist')
  }

  const data = await response.json()

  return data?.success
}

/**
 * [Mutation hook] useDeleteWishlistMutation uses the Kibo REST API
 *
 * <b>deleteWishlist(wishlistId: string): Wishlist</b>
 *
 * Description : Deletes the wishlist
 *
 * Parameters passed to function deleteWishlist(wishlistId: string) => expects to delete the wishlist
 *
 * @returns true if wishlist deleted
 */

export const useDeleteWishlist = () => {
  const queryClient = useQueryClient()

  return {
    deleteWishlist: useMutation({
      mutationFn: (wishlistId: string) => deleteWishlist(wishlistId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
    }),
  }
}
