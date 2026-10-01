import { NextApiRequest } from 'next'

import { getAdditionalHeader } from '../util'
import { fetcher } from '@/lib/api/util'
import { getProductPriceQuery } from '@/lib/gql/queries'

export default async function getProductPrice(
  productCode: string,
  useSubscriptionPricing = false,
  req?: NextApiRequest
) {
  const variables = {
    productCode,
    useSubscriptionPricing,
  }

  const headers = req ? getAdditionalHeader(req) : {}

  const response = await fetcher({ query: getProductPriceQuery, variables }, { headers })
  return response.data?.product
}
