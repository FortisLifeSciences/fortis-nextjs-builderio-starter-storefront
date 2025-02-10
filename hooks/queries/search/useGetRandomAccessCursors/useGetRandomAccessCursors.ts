/**
 * @module useGetRandomAccessCursors
 */
import { fetcher } from '@/lib/api/util'
import { makeGraphQLClient } from '@/lib/gql/client'
import getRandomAccessCursorsQuery from '@/lib/gql/queries/get-random-access-cursors'

import type { ProductSearchRandomAccessCursor } from '@/lib/gql/types'

/**
 * @hidden
 */
export interface ProductSearchRandomAccessCursorResultType {
  data: ProductSearchRandomAccessCursor
  isLoading: boolean
  isSuccess: boolean
}

export const getRandomAccessCursorsResult: () => Promise<ProductSearchRandomAccessCursor> =
  async () => {
    const response = await fetcher(
      {
        query: getRandomAccessCursorsQuery,
        variables: {},
      },
      {}
    )
    return response.data.productSearchRandomAccessCursor as ProductSearchRandomAccessCursor
  }
