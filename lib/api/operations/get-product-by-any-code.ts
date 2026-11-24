import getProduct from './get-product'
import { fetcher } from '@/lib/api/util'

const variationCodeSearchQuery = /* GraphQL */ `
  query variationCodeSearch($query: String, $pageSize: Int) {
    productSearch(query: $query, pageSize: $pageSize) {
      items {
        productCode
        variationProductCode
      }
    }
  }
`

export default async function getProductByAnyCode(code: string) {
  const trimmedCode = code?.trim()
  if (!trimmedCode) return null

  const product = await getProduct(trimmedCode)
  if (product) return product

  const response = await fetcher(
    { query: variationCodeSearchQuery, variables: { query: trimmedCode, pageSize: 50 } },
    {}
  )
  const items = response?.data?.productSearch?.items || []
  const match = items.find(
    (item: any) => item?.variationProductCode?.toLowerCase() === trimmedCode.toLowerCase()
  )

  return match?.productCode ? getProduct(match.productCode) : null
}
