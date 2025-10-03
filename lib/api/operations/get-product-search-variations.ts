import { NextApiRequest } from 'next'

import { getAdditionalHeader } from '../util'
import { fetcher } from '@/lib/api/util'
import { getProductSearchVariationsQuery, getProductVariationQuery } from '@/lib/gql/queries'

import { FilteredProduct, Price, Value } from '@/lib/gql/types'

interface Product {
  variationProductCode: string
  options: Option[]
  price: Price
  properties: Property[]
}

interface Option {
  values: Value[]
}

interface Property {
  attributeFQN: string
  values: PropertyValue[]
}

interface PropertyValue {
  value: string | number
}

export default async function getProductSearchVariations(
  productCode: string,
  variantCodes?: any[],
  req?: NextApiRequest
) {
  const variables = {
    filter: `productCode eq ${productCode}`,
  }

  const headers = req ? getAdditionalHeader(req) : {}

  const response = await fetcher({ query: getProductSearchVariationsQuery, variables }, { headers })

  const products: Product[] = response.data?.products?.items || []

  // Transform and filter the product items as required
  let result: FilteredProduct[]

  if (variantCodes && products.length === variantCodes.length) {
    // Existing flow
    result = products.map((product) => {
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
  } else {
    console.log('Entered else statement')
    result = []

    for (const variant of variantCodes || []) {
      const variationVariables = {
        productCode: productCode,
        variationProductCode: variant.productCode,
      }

      console.log('This is variant level variant variable', variationVariables)

      const variationResponse = await fetcher(
        { query: getProductVariationQuery, variables: variationVariables },
        { headers }
      )
      console.log('This is variant level response', variationResponse)

      const variationProduct: Product = variationResponse.data?.product
      console.log('This is variationProduct', variationProduct)
      if (variationProduct) {
        const selectedValues =
          variationProduct.options
            ?.flatMap((option) => option.values || [])
            ?.filter((value) => value.isSelected) || []

        // Find the property where attributeFQN is tenant~child-priority
        const childPriorityProperty = variationProduct.properties.find(
          (prop) => prop.attributeFQN === 'tenant~child-priority'
        )

        result.push({
          variationProductCode: variationProduct.variationProductCode,
          option: selectedValues,
          price: variationProduct.price,
          childPriority: childPriorityProperty
            ? Number(childPriorityProperty.values[0].value)
            : null,
        })
      }
    }
  }
  console.log('In get product search variations', result)
  return result
}
