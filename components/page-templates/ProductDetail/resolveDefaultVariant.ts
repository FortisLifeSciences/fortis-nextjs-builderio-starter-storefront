import { productGetters } from '@/lib/getters'
import type { ProductCustom } from '@/lib/types'

import type { FilteredProduct, Product } from '@/lib/gql/types'

interface VariationData {
  childPriority?: number
  price?: any
  variationProductCode?: string
}

export interface DefaultOptionSelection {
  attributeFQN: string
  value: any
  isEnabled: boolean
}

export const buildVariationMap = (
  productVariations?: Product[] | FilteredProduct[] | null
): Map<any, VariationData> => {
  const variationMap = new Map<any, VariationData>()
  productVariations?.forEach((variation: any) => {
    if (variation?.option && variation.option.length > 0) {
      const variationValue = variation.option[0]?.value
      variationMap.set(variationValue, {
        childPriority: variation.childPriority,
        price: variation.price,
        variationProductCode: variation.variationProductCode,
      })
    }
  })
  return variationMap
}

export const applyVariationData = (
  options: any,
  productVariations?: Product[] | FilteredProduct[] | null
) => {
  const variationMap = buildVariationMap(productVariations)

  options?.selectOptions?.forEach((selectOption: { values: any[] }) => {
    selectOption?.values?.forEach((optionValue) => {
      if (optionValue && variationMap.has(optionValue.value)) {
        const variationData = variationMap.get(optionValue.value)

        if (variationData) {
          optionValue.childPriority = variationData.childPriority
          optionValue.price = { ...variationData.price }
          optionValue.variationProductCode = variationData.variationProductCode
        }
      }
    })

    selectOption?.values?.sort((a, b) => {
      if (a?.childPriority === undefined && b?.childPriority === undefined) return 0
      if (a?.childPriority === undefined) return 1
      if (b?.childPriority === undefined) return -1
      return a?.childPriority - b?.childPriority
    })
  })

  return options
}

export const resolveDefaultOptionValue = (params: {
  product?: ProductCustom | null
  productVariations?: Product[] | FilteredProduct[] | null
  sliceValue?: string | null
  selectedUrlVariant?: string | null
}): DefaultOptionSelection | null => {
  const { product, productVariations, sliceValue, selectedUrlVariant } = params

  if (!product) return null

  const productOptions = productGetters.getProductDetails(product)?.productOptions
  const optionData = applyVariationData(productOptions, productVariations)

  const firstSelectOption = optionData?.selectOptions?.[0]
  if (!firstSelectOption?.attributeFQN) return null

  let selectedValue = sliceValue ? sliceValue : firstSelectOption?.values?.[0]?.value

  const selectedValueFromUrl = selectedUrlVariant
    ? firstSelectOption?.values?.find(
        (value: any) => value.variationProductCode === selectedUrlVariant
      )?.value
    : null

  selectedValue = selectedValueFromUrl ? selectedValueFromUrl : selectedValue

  if (selectedValue === undefined || selectedValue === null) return null

  return {
    attributeFQN: firstSelectOption.attributeFQN as string,
    value: selectedValue,
    isEnabled: firstSelectOption?.values?.find((value: any) => value?.value === selectedValue)
      ?.isEnabled as boolean,
  }
}
