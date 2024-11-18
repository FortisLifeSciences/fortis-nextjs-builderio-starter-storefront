import { NextApiRequest } from 'next'

import { getAdditionalHeader } from '../util'
import { fetcher } from '@/lib/api/util'
import { getProductSearchVariationsQuery } from '@/lib/gql/queries'

interface Product {
  variationProductCode: string
  options: Option[]
  price: Price
  properties: Property[]
}

interface Option {
  values: Value[]
}

interface Value {
  value: string
  stringValue: string
  isSelected: boolean
}

interface Price {
  price: number
}

interface Property {
  attributeFQN: string
  values: PropertyValue[]
}

interface PropertyValue {
  value: string | number
}

interface FilteredProduct {
  variationProductCode: string
  option: Value[]
  price: Price
  childPriority: number | null
}

export default async function getProductSearchVariations(
  productCode: string,
  req?: NextApiRequest
) {
  const variables = {
    filter: `productCode eq ${productCode}`,
  }

  const headers = req ? getAdditionalHeader(req) : {}

  const response = await fetcher({ query: getProductSearchVariationsQuery, variables }, { headers })

  const products: Product[] = response.data?.products?.items || []

  // Transform and filter the product items as required
  const result: FilteredProduct[] = products.map((product) => {
    // Flatten and filter options to only include values with isSelected: true
    // const selectedValues = product.options
    //   .flatMap((option) => option.values)
    //   .filter((value) => value.isSelected)

    const selectedValues =
      product.options
        ?.flatMap((option) => option.values || [])
        ?.filter((value) => value.isSelected) || []

    // Find the property where attributeFQN is tenant~child-priority
    const childPriorityProperty = product.properties.find(
      (prop) => prop.attributeFQN === 'tenant~child-priority'
    )

    return {
      variationProductCode: product.variationProductCode,
      option: selectedValues,
      price: product.price,
      childPriority: childPriorityProperty ? Number(childPriorityProperty.values[0].value) : null,
    }
  })

  return result
}
