import { NextApiRequest } from 'next'

import { getAdditionalHeader } from '../util'
import { fetcher } from '@/lib/api/util'
import { getProductSearchVariationsQuery, getProductVariationQuery } from '@/lib/gql/queries'

import { FilteredProduct, Price, Value } from '@/lib/gql/types'

export type FilteredVariationProduct = FilteredProduct & {
  isNewVariant: boolean
}
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
  value?: string | number | boolean
  stringValue?: string
}
const getBooleanPropertyValue = (properties: Property[] = [], attributeFQN: string): boolean => {
  const property = properties.find((prop) => prop?.attributeFQN === attributeFQN)
  const rawValue = property?.values?.[0]?.value ?? property?.values?.[0]?.stringValue

  if (typeof rawValue === 'boolean') {
    return rawValue
  }

  if (typeof rawValue === 'number') {
    return rawValue === 1
  }

  if (typeof rawValue === 'string') {
    return ['true', 'yes', '1'].includes(rawValue.trim().toLowerCase())
  }

  return false
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
  let result: FilteredVariationProduct[]

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
        inventoryInfo: (product as any).inventoryInfo ?? null,

        isNewVariant: getBooleanPropertyValue(product.properties, 'tenant~new-product-variant'),
      }
    })

    // productSearch inventory is stale — always verify with live individual queries when stock <= 0.
    // Trust productSearch only when it explicitly shows stock > 0 (InStock is safe to use as-is).

    for (const variant of result) {
      try {
        const variationResponse = await fetcher(
          {
            query: getProductVariationQuery,
            variables: {
              productCode,
              variationProductCode: variant.variationProductCode,
            },
          },
          { headers }
        )

        const variationProduct = variationResponse.data?.product

        const isNewVariant = getBooleanPropertyValue(
          variationProduct?.properties ?? [],
          'tenant~new-product-variant'
        )

        const newVariantProperty = variationProduct?.properties?.find(
          (prop: any) => prop?.attributeFQN?.toLowerCase() === 'tenant~new-product-variant'
        )

        if (variationProduct) {
          variant.inventoryInfo = variationProduct.inventoryInfo ?? variant.inventoryInfo

          variant.isNewVariant = isNewVariant
        }
      } catch (error) {
        console.error('Error fetching variant:', variant.variationProductCode, error)
      }
    }
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
          inventoryInfo: (variationProduct as any).inventoryInfo ?? null,

          isNewVariant: getBooleanPropertyValue(
            variationProduct.properties,
            'tenant~new-product-variant'
          ),
        })
      }
    }
  }
  console.log('In get product search variations', result)
  return result
}
