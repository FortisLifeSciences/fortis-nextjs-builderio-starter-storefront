import getProduct from './get-product'
import { fetcher } from '@/lib/api/util'

const getBrandPrefix = (productCode?: string) => {
  const separatorIndex = productCode?.indexOf('-') ?? -1
  return separatorIndex > 0 ? productCode!.slice(0, separatorIndex + 1) : ''
}

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

export default async function getProductByAnyCode(code: string, sourceProductCode?: string) {
  const trimmedCode = code?.trim()
  if (!trimmedCode) return null

  const product = await getProduct(trimmedCode)
  if (product) return product

  const brandPrefix = getBrandPrefix(sourceProductCode)
  if (brandPrefix && !trimmedCode.toUpperCase().startsWith(brandPrefix.toUpperCase())) {
    const prefixed = await getProduct(`${brandPrefix}${trimmedCode}`)
    if (prefixed) return prefixed
  }

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
