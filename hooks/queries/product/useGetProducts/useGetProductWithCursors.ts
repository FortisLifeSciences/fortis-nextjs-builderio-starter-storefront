/**
+ * @module useGetProducts
+ */

import { fetcher } from '@/lib/api/util'
import { searchProductsQuery } from '@/lib/gql/queries'

import type { Product, ProductSearchResult } from '@/lib/gql/types'

export const fetchProductSearchWithCursorMarks: (
  cursorMark: string
) => Promise<Array<Product>> = async (cursorMark: string) => {
  const productSearchInput = {
    cursorMarks: cursorMark,
    pageSize: 2000,
  }
  const response = await fetcher(
    {
      query: searchProductsQuery,
      variables: productSearchInput,
    },
    {}
  )
  return response.data.products.items
}
