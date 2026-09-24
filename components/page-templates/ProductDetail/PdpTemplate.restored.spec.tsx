import { render, screen } from '@testing-library/react'

import PdpTemplate from './PdpTemplate'
import type { ProductCustom } from '@/lib/types'

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

jest.mock('@/context', () => ({
  useAuthContext: () => ({ isAuthenticated: false, user: undefined }),
  useModalContext: () => ({ showModal: jest.fn(), closeModal: jest.fn() }),
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

jest.mock('./CitationWidget', () => () => null)
jest.mock('./PdpGallery', () => () => null)
jest.mock('./ProductInventoryMessages', () => () => null)

jest.mock('@/components/layout/Algolia/AlgoliaAutocomplete', () => () => null)

const buildProperty = (attributeFQN: string, value: any, stringValue?: string) => ({
  attributeFQN,
  attributeDetail: { name: attributeFQN },
  isHidden: false,
  values: [{ value, stringValue: stringValue ?? String(value) }],
})

const buildOption = (attributeFQN: string, inputType: string, values: any[]) => ({
  attributeFQN,
  attributeDetail: { name: attributeFQN, inputType },
  values,
})

const renderPdp = (overrides: Partial<Record<string, any>> = {}) => {
  const product = {
    productCode: 'A303-500A',
    content: { productName: 'Parent Antibody', productImages: [] },
    options: overrides.options ?? [],
    properties: [
      buildProperty('tenant~brand', 'Bethyl Laboratories', 'Bethyl Laboratories'),
      buildProperty('tenant~variant-product-name', 'Anti-ATF2 Antibody', 'Anti-ATF2 Antibody'),
      ...(overrides.properties ?? []),
    ],
  } as unknown as ProductCustom

  return render(<PdpTemplate product={product} productVariations={[]} />)
}

describe('PdpTemplate restored elements', () => {
  describe('manufacturing marks', () => {
    it('shows the ISO13485 mark using the PIM label rather than the raw code', () => {
      renderPdp({
        properties: [buildProperty('tenant~mfgcertification', 'ISO13485', 'ISO 13485 Certified')],
      })

      expect(screen.getByText('ISO 13485 Certified')).toBeInTheDocument()
      expect(screen.queryByText('ISO13485')).not.toBeInTheDocument()
    })

    it('shows the GMP Ready mark', () => {
      renderPdp({
        properties: [buildProperty('tenant~mfgavailability', 'gmp_ready', 'GMP Ready')],
      })

      expect(screen.getByText('GMP Ready')).toBeInTheDocument()
    })

    it('shows the Lyo-Ready mark', () => {
      renderPdp({
        properties: [buildProperty('tenant~mfgavailability', 'lyo_ready', 'Lyo-Ready')],
      })

      expect(screen.getByText('Lyo-Ready')).toBeInTheDocument()
    })

    it('does not show a mark when the attribute value does not match', () => {
      renderPdp({
        properties: [buildProperty('tenant~mfgavailability', 'something_else', 'Something Else')],
      })

      expect(screen.queryByText('Something Else')).not.toBeInTheDocument()
    })

    it('omits the marks entirely when the product has neither attribute', () => {
      renderPdp()

      expect(screen.queryByText(/GMP Ready|Lyo-Ready|ISO/)).not.toBeInTheDocument()
    })
  })

  describe('new product flag', () => {
    it('shows the flag when tenant~new-product is set', () => {
      renderPdp({ properties: [buildProperty('tenant~new-product', 'true')] })

      expect(screen.getByText('new')).toBeInTheDocument()
    })

    it('hides the flag when the attribute is absent', () => {
      renderPdp()

      expect(screen.queryByText('new')).not.toBeInTheDocument()
    })
  })

  describe('option selectors beyond the primary variant picker', () => {
    it('renders a text box option so a configurable sku stays buyable', () => {
      renderPdp({
        options: [buildOption('tenant~engraving', 'TextBox', [{ value: '', stringValue: '' }])],
      })

      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
    })

    it('renders a yes/no option as a checkbox', () => {
      renderPdp({
        options: [buildOption('tenant~gift-wrap', 'YesNo', [{ value: false }])],
      })

      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
    })

    it('renders a second list option group, not just the first', () => {
      renderPdp({
        options: [
          buildOption('tenant~size-variant', 'List', [
            { value: '100ug', stringValue: '100ug', isEnabled: true },
          ]),
          buildOption('tenant~format-variant', 'List', [
            { value: 'Lyophilized', stringValue: 'Lyophilized', isEnabled: true },
          ]),
        ],
      })

      expect(screen.getAllByText('100ug').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Lyophilized').length).toBeGreaterThan(0)
    })
  })
})
