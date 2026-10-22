import { useQuery } from '@tanstack/react-query'

import { makeGraphQLClient } from '@/lib/gql/client'
import { getVariationPricesQuery } from '@/lib/gql/queries'
import { productKeys } from '@/lib/react-query/queryKeys'

import type { Price } from '@/lib/gql/types'

export type VariationPrices = Record<string, Price>

const fetchVariationPrices = async (
  productCode: string,
  variationProductCodes: string[]
): Promise<VariationPrices> => {
  const client = makeGraphQLClient()
  const variables = variationProductCodes.reduce<Record<string, string>>(
    (acc, code, index) => ({ ...acc, [`v${index}`]: code }),
    { productCode }
  )
  const response = await client.request({
    document: getVariationPricesQuery(variationProductCodes.length),
    variables,
  })

  return Object.values(response ?? {}).reduce<VariationPrices>((acc, variation: any) => {
    if (variation?.variationProductCode && variation?.price) {
      acc[variation.variationProductCode] = variation.price
    }
    return acc
  }, {})
}

export const useGetVariationPrices = (productCode: string, variationProductCodes: string[]) => {
  const { data, isSuccess } = useQuery({
    queryKey: productKeys.variationPrices(productCode, variationProductCodes),
    queryFn: () => fetchVariationPrices(productCode, variationProductCodes),
    enabled: !!productCode && variationProductCodes.length > 0,
    refetchOnWindowFocus: true,
  })

  return { data, isSuccess }
}
