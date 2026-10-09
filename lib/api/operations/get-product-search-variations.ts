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

const getBooleanPropertyValue = (
  properties: Property[] = [],
  attributeFQN: string
): boolean | undefined => {
  const property = properties.find(
    (prop) => prop?.attributeFQN?.toLowerCase() === attributeFQN.toLowerCase()
  )
  const rawValue = property?.values?.[0]?.value ?? property?.values?.[0]?.stringValue

  if (rawValue == null) return undefined
  if (typeof rawValue === 'boolean') return rawValue
  if (typeof rawValue === 'number') return rawValue === 1
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
        isNewVariant:
          getBooleanPropertyValue(product.properties, 'tenant~new-product-variant') ?? false,
      }
    })

    const missingNewVariantFlags = products.filter(
      (product) =>
        getBooleanPropertyValue(product.properties, 'tenant~new-product-variant') === undefined
    )
    const newVariantFlagLookups = await Promise.all(
      missingNewVariantFlags.map(async (product) => {
        try {
          const variationResponse = await fetcher(
            {
              query: getProductVariationQuery,
              variables: { productCode, variationProductCode: product.variationProductCode },
            },
            { headers }
          )
          const variationProduct = variationResponse.data?.product

          return variationProduct
            ? {
                variationProductCode: product.variationProductCode,
                isNewVariant:
                  getBooleanPropertyValue(
                    variationProduct.properties,
                    'tenant~new-product-variant'
                  ) ?? false,
              }
            : null
        } catch (error) {
          console.error(
            `Failed to load new-variant flag for ${product.variationProductCode}`,
            error
          )
          return null
        }
      })
    )

    for (const flag of newVariantFlagLookups) {
      if (!flag) continue
      const variant = result.find(
        (entry) => entry.variationProductCode === flag.variationProductCode
      )
      if (variant) variant.isNewVariant = flag.isNewVariant
    }

    // productSearch inventory is stale — always verify with live individual queries when stock <= 0.
    // Trust productSearch only when it explicitly shows stock > 0 (InStock is safe to use as-is).
    const inventoryFallbacks = result
      .filter((v) => {
        if (!v.inventoryInfo) return true
        const inv = v.inventoryInfo as any
        if (inv.onlineStockAvailable == null) return true
        return (inv.onlineStockAvailable ?? 0) <= 0
      })
      .map((v) =>
        fetcher(
          {
            query: getProductVariationQuery,
            variables: { productCode, variationProductCode: v.variationProductCode },
          },
          { headers }
        )
          .then((res) => ({
            variationProductCode: v.variationProductCode,
            inventoryInfo: res.data?.product?.inventoryInfo ?? null,
          }))
          .catch(() => null)
      )

    const inventoryResults = await Promise.all(inventoryFallbacks)
    for (const inv of inventoryResults) {
      if (!inv) continue
      const variant = result.find((v) => v.variationProductCode === inv.variationProductCode)
      if (variant && inv.inventoryInfo != null) variant.inventoryInfo = inv.inventoryInfo
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
          isNewVariant:
            getBooleanPropertyValue(variationProduct.properties, 'tenant~new-product-variant') ??
            false,
        })
      }
    }
  }
  console.log('In get product search variations', result)
  return result
}
