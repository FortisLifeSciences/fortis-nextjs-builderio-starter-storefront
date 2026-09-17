import { renderHook } from '@testing-library/react'

import { usePdpViewModel } from './usePdpViewModel'
import type { ProductCustom } from '@/lib/types'

import type { ConfiguredProduct } from '@/lib/gql/types'

jest.mock('@/hooks', () => {
  const actual = jest.requireActual(
    '@/hooks/custom/useProductDetailTemplate/useProductDetailTemplate'
  )
  return {
    get useProductDetailTemplate() {
      return actual.useProductDetailTemplate
    },
    useGetPurchaseLocation: () => ({ data: undefined }),
    useAddCartItem: () => ({ addToCart: { isPending: false, mutateAsync: jest.fn() } }),
    useWishlist: () => ({
      addOrRemoveWishlistItem: jest.fn(),
      checkProductInWishlist: () => false,
      isWishlistLoading: false,
    }),
    useGetProductInventory: () => ({ data: undefined }),
    useGetProductPrice: () => ({ data: undefined }),
    useConfigureProduct: () => ({ configureProduct: { mutateAsync: jest.fn() } }),
  }
})

const buildProperty = (attributeFQN: string, value: any, stringValue?: string) => ({
  attributeFQN,
  attributeDetail: { name: attributeFQN },
  isHidden: false,
  values: [{ value, stringValue: stringValue ?? String(value) }],
})

const baseProduct = {
  productCode: 'A303-500A',
  content: { productName: 'Parent Antibody', productImages: [] },
  options: [],
  properties: [
    buildProperty('tenant~brand', 'Bethyl Laboratories', 'Bethyl Laboratories'),
    buildProperty('tenant~sku-status-text', 'Discontinued'),
  ],
} as unknown as ProductCustom

const activeVariant = {
  variationProductCode: 'A303-500A-T',
  properties: [
    buildProperty('tenant~sku-status-text', 'Active'),
    buildProperty('tenant~stock-behavior-option', 'AllowBackorder', 'AllowBackorder'),
    buildProperty(
      'tenant~variant-product-name',
      'Anti-ATF2 Antibody 500uL',
      'Anti-ATF2 Antibody 500uL'
    ),
    buildProperty('tenant~citation-count-variant', 42),
    buildProperty('tenant~citeab-product-code', 'CITEAB-42', 'CITEAB-42'),
  ],
} as unknown as ConfiguredProduct

const renderViewModel = (configuredVariant?: ConfiguredProduct | null) =>
  renderHook(() =>
    usePdpViewModel({
      product: baseProduct,
      productVariations: [],
      configuredVariant,
      citationApiKey: 'test-key',
    })
  )

describe('usePdpViewModel first-render (server) correctness', () => {
  it('derives Active sku status from the configured variant without an effect pass', () => {
    const { result } = renderViewModel(activeVariant)

    expect(result.current.skuStatusText).toBe('Active')
  })

  it('derives stock behaviour so the add-to-cart gate can open on first render', () => {
    const { result } = renderViewModel(activeVariant)

    const showAddToCart =
      result.current.skuStatusText === 'Active' &&
      result.current.stockBehaviour &&
      result.current.stockBehaviour !== 'DenyBackorder'

    expect(showAddToCart).toBe(true)
  })

  it('uses the variant product name as the hero title on first render', () => {
    const { result } = renderViewModel(activeVariant)

    expect(result.current.heroTitle).toBe('Anti-ATF2 Antibody 500uL')
  })

  it('derives the citation count from the configured variant', () => {
    const { result } = renderViewModel(activeVariant)

    expect(result.current.citationCountVariant).toBe(42)
  })

  it('passes the server-provided citation api key straight through', () => {
    const { result } = renderViewModel(activeVariant)

    expect(result.current.citationApiKey).toBe('test-key')
  })

  it('exposes a server-stable citations key instead of a render counter', () => {
    const { result } = renderViewModel(activeVariant)

    expect(result.current.keyVal).toBe('CITEAB-42')
  })

  it('merges variant properties over parent properties', () => {
    const { result } = renderViewModel(activeVariant)

    const merged = result.current.updatedProduct?.properties?.filter(
      (prop: any) => prop.attributeFQN === 'tenant~sku-status-text'
    )

    expect(merged).toHaveLength(1)
    expect(merged?.[0]?.values?.[0]?.value).toBe('Active')
  })

  it('does not leak a per-user minimum quantity into the first render', () => {
    const { result } = renderViewModel(activeVariant)

    expect(result.current.quantity).toBe(1)
  })

  describe('without a configured variant', () => {
    it('falls back to parent properties rather than throwing', () => {
      const { result } = renderViewModel(null)

      expect(result.current.skuStatusText).toBe('Discontinued')
      expect(result.current.heroTitle).toBe('Parent Antibody')
      expect(result.current.citationCountVariant).toBe(0)
    })
  })
})
