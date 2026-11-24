import { useQuery } from '@tanstack/react-query'

import { makeGraphQLClient } from '@/lib/gql/client'

export type ProductSize = {
  variationProductCode: string
  label: string
  price: number | null
  options: { attributeFQN: string; value: string }[]
}

type SizeSearchItem = {
  variationProductCode?: string
  options?: {
    attributeFQN?: string
    values?: { value?: unknown; stringValue?: string | null; isSelected?: boolean }[]
  }[]
  price?: { price?: number | null; salePrice?: number | null }
  properties?: { attributeFQN?: string; values?: { value?: unknown }[] }[]
}

const productVariationCodesQuery = /* GraphQL */ `
  query ProductVariationCodes($productCode: String!) {
    product(productCode: $productCode) {
      variations {
        productCode
      }
    }
  }
`

const variationFields = `
  variationProductCode
  options {
    attributeFQN
    values {
      value
      stringValue
      isSelected
    }
  }
  price {
    price
    salePrice
  }
  properties {
    attributeFQN
    values {
      value
    }
  }
`

const buildVariationsQuery = (count: number) => {
  const indexes = Array.from({ length: count }, (_, index) => index)
  const params = indexes.map((index) => `$v${index}: String!`).join(', ')
  const fields = indexes
    .map(
      (index) =>
        `v${index}: product(productCode: $productCode, variationProductCode: $v${index}) {${variationFields}}`
    )
    .join('\n')
  return `query ProductSizes($productCode: String!, ${params}) {\n${fields}\n}`
}

const childPriority = (item: SizeSearchItem): number => {
  const raw = item.properties?.find((prop) => prop.attributeFQN === 'tenant~child-priority')
    ?.values?.[0]?.value
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

export const toProductSizes = (items: SizeSearchItem[], useSkuAsLabel = false): ProductSize[] =>
  items
    .filter((item) => item.variationProductCode)
    .map((item) => {
      const selected = (item.options ?? []).flatMap((option) =>
        (option.values ?? [])
          .filter((value) => value.isSelected)
          .map((value) => ({
            attributeFQN: option.attributeFQN ?? '',
            value: String(value.value ?? ''),
            label: value.stringValue || String(value.value ?? ''),
          }))
      )
      const price = item.price?.salePrice ?? item.price?.price ?? null
      return {
        size: {
          variationProductCode: item.variationProductCode as string,
          label: useSkuAsLabel
            ? (item.variationProductCode as string)
            : selected.map((value) => value.label).join(' / ') ||
              (item.variationProductCode as string),
          price: typeof price === 'number' ? price : null,
          options: selected
            .filter((value) => value.attributeFQN && value.value)
            .map(({ attributeFQN, value }) => ({ attributeFQN, value })),
        },
        priority: childPriority(item),
      }
    })
    .sort((a, b) => a.priority - b.priority || (b.size.price ?? 0) - (a.size.price ?? 0))
    .map(({ size }) => size)

const fetchProductSizes = async (productCode: string, useSkuAsLabel: boolean) => {
  const client = makeGraphQLClient()
  const codesResponse: { product?: { variations?: { productCode?: string }[] | null } } =
    await client.request({ document: productVariationCodesQuery, variables: { productCode } })
  const codes = Array.from(
    new Set(
      (codesResponse?.product?.variations ?? [])
        .map((variation) => variation?.productCode)
        .filter((code): code is string => Boolean(code))
    )
  )
  if (!codes.length) return []

  const variables = codes.reduce<Record<string, string>>(
    (acc, code, index) => ({ ...acc, [`v${index}`]: code }),
    { productCode }
  )
  const response: Record<string, SizeSearchItem | null> = await client.request({
    document: buildVariationsQuery(codes.length),
    variables,
  })
  return toProductSizes(
    codes
      .map((_, index) => response?.[`v${index}`])
      .filter((item): item is SizeSearchItem => !!item),
    useSkuAsLabel
  )
}

export const useProductSizes = (productCode: string, enabled: boolean, useSkuAsLabel = false) =>
  useQuery({
    queryKey: ['product-card-sizes', productCode, useSkuAsLabel],
    queryFn: () => fetchProductSizes(productCode, useSkuAsLabel),
    enabled: enabled && Boolean(productCode),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
