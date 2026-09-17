import { applyVariationData, resolveDefaultOptionValue } from './resolveDefaultVariant'
import { ProductCustomMock } from '@/__mocks__/stories/ProductCustomMock'
import { productGetters } from '@/lib/getters'
import type { ProductCustom } from '@/lib/types'

const cloneProduct = (): ProductCustom => JSON.parse(JSON.stringify(ProductCustomMock))

const buildVariations = (entries: { value: any; childPriority?: number; code: string }[]) =>
  entries.map((entry) => ({
    productCode: entry.code,
    variationProductCode: entry.code,
    childPriority: entry.childPriority,
    price: { price: 10 },
    option: [{ attributeFQN: 'tenant~length-cm', value: entry.value }],
  })) as any

const legacyResolve = (
  product: ProductCustom,
  productVariations: any,
  sliceValue?: string,
  selectedUrlVariant?: string
) => {
  const productOptions = productGetters.getProductDetails(product)?.productOptions
  const optionData = applyVariationData(productOptions, productVariations)

  let selectedValue = sliceValue ? sliceValue : optionData?.selectOptions?.[0]?.values?.[0]?.value
  const selectedValueFromUrl = selectedUrlVariant
    ? optionData?.selectOptions?.[0]?.values?.find(
        (value: any) => value.variationProductCode === selectedUrlVariant
      )?.value
    : null
  selectedValue = selectedValueFromUrl ? selectedValueFromUrl : selectedValue

  return selectedValue
}

describe('resolveDefaultVariant', () => {
  describe('option classification', () => {
    it('picks the first list option that is neither color nor size', () => {
      const result = resolveDefaultOptionValue({ product: cloneProduct() })

      expect(result?.attributeFQN).toBe('tenant~length-cm')
    })

    it('returns null when the product has no options', () => {
      const product = cloneProduct()
      product.options = []

      expect(resolveDefaultOptionValue({ product })).toBeNull()
    })

    it('returns null when no product is given', () => {
      expect(resolveDefaultOptionValue({ product: null })).toBeNull()
    })
  })

  describe('childPriority ordering', () => {
    it('selects the lowest childPriority value, not the declaration order', () => {
      const variations = buildVariations([
        { value: 150, childPriority: 3, code: 'MS-LEN-150' },
        { value: 154, childPriority: 1, code: 'MS-LEN-154' },
        { value: 156, childPriority: 2, code: 'MS-LEN-156' },
      ])

      const result = resolveDefaultOptionValue({
        product: cloneProduct(),
        productVariations: variations,
      })

      expect(result?.value).toBe(154)
    })

    it('sorts values with an undefined childPriority last', () => {
      const variations = buildVariations([
        { value: 156, childPriority: 5, code: 'MS-LEN-156' },
        { value: 154, code: 'MS-LEN-154' },
      ])

      const productOptions = productGetters.getProductDetails(cloneProduct())?.productOptions
      const sorted = applyVariationData(productOptions, variations)
      const values = sorted?.selectOptions?.[0]?.values?.map((value: any) => value.value)

      expect(values?.[0]).toBe(156)
      expect(values?.slice(1)).toEqual([150, 154])
    })

    it('falls back to the first declared value when there are no variations', () => {
      const result = resolveDefaultOptionValue({
        product: cloneProduct(),
        productVariations: [],
      })

      expect(result?.value).toBe(150)
    })
  })

  describe('overrides', () => {
    it('prefers sliceValue over the childPriority winner', () => {
      const variations = buildVariations([
        { value: 150, childPriority: 3, code: 'MS-LEN-150' },
        { value: 154, childPriority: 1, code: 'MS-LEN-154' },
      ])

      const result = resolveDefaultOptionValue({
        product: cloneProduct(),
        productVariations: variations,
        sliceValue: '156',
      })

      expect(result?.value).toBe('156')
    })

    it('prefers a matching selectedUrlVariant over sliceValue', () => {
      const variations = buildVariations([
        { value: 150, childPriority: 1, code: 'MS-LEN-150' },
        { value: 156, childPriority: 2, code: 'MS-LEN-156' },
      ])

      const result = resolveDefaultOptionValue({
        product: cloneProduct(),
        productVariations: variations,
        sliceValue: '150',
        selectedUrlVariant: 'MS-LEN-156',
      })

      expect(result?.value).toBe(156)
    })

    it('ignores a selectedUrlVariant that matches no variation', () => {
      const variations = buildVariations([{ value: 150, childPriority: 1, code: 'MS-LEN-150' }])

      const result = resolveDefaultOptionValue({
        product: cloneProduct(),
        productVariations: variations,
        selectedUrlVariant: 'DOES-NOT-EXIST',
      })

      expect(result?.value).toBe(150)
    })
  })

  describe('parity with the previous inline selection logic', () => {
    const cases = [
      {
        name: 'no variations',
        variations: [] as any,
        sliceValue: undefined,
        selectedUrlVariant: undefined,
      },
      {
        name: 'ordered variations',
        variations: buildVariations([
          { value: 150, childPriority: 3, code: 'MS-LEN-150' },
          { value: 154, childPriority: 1, code: 'MS-LEN-154' },
          { value: 156, childPriority: 2, code: 'MS-LEN-156' },
        ]),
        sliceValue: undefined,
        selectedUrlVariant: undefined,
      },
      {
        name: 'partial childPriority',
        variations: buildVariations([
          { value: 156, childPriority: 5, code: 'MS-LEN-156' },
          { value: 154, code: 'MS-LEN-154' },
        ]),
        sliceValue: undefined,
        selectedUrlVariant: undefined,
      },
      {
        name: 'sliceValue override',
        variations: buildVariations([{ value: 150, childPriority: 1, code: 'MS-LEN-150' }]),
        sliceValue: '154',
        selectedUrlVariant: undefined,
      },
      {
        name: 'url variant override',
        variations: buildVariations([
          { value: 150, childPriority: 1, code: 'MS-LEN-150' },
          { value: 156, childPriority: 2, code: 'MS-LEN-156' },
        ]),
        sliceValue: '150',
        selectedUrlVariant: 'MS-LEN-156',
      },
    ]

    cases.forEach((testCase) => {
      it(`matches the legacy result for: ${testCase.name}`, () => {
        const expected = legacyResolve(
          cloneProduct(),
          testCase.variations,
          testCase.sliceValue,
          testCase.selectedUrlVariant
        )

        const actual = resolveDefaultOptionValue({
          product: cloneProduct(),
          productVariations: testCase.variations,
          sliceValue: testCase.sliceValue,
          selectedUrlVariant: testCase.selectedUrlVariant,
        })

        expect(actual?.value).toEqual(expected)
      })
    })
  })
})
