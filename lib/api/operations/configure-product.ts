import { fetcher } from '@/lib/api/util'
import configureProductMutation from '@/lib/gql/mutations/product/configureProductMutation'

export default async function configureProduct(
  productCode: string,
  options: Array<{ attributeFQN: string; value?: any }>
) {
  const variables = {
    productCode,
    selectedOptions: { options },
  }
  const response = await fetcher({ query: configureProductMutation, variables }, {})
  return response.data?.configureProduct
}
