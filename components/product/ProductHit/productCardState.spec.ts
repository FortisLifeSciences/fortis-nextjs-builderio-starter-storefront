import {
  getProductCardState,
  isUsVisitor,
  parseVariant,
  type ProductCardRecord,
} from './productCardState'

const curly = (fqn: string, value: string) =>
  `{ “fqn”: “${fqn}”, “value”: “${value}”, “label”: “${value}” }  `

const bethylA80104P: ProductCardRecord = {
  sku: 'A80-104P',
  parent_id: 'BETHYL-A80-104',
  brand_code: 'bethyl',
  slice_product: true,
  current_price: 166,
  'SKU STATUS': 'Active',
  'STOCK BEHAVIOUR': 'AcceptBackorder',
  'MINIMUM STOCK': '3',
  'MINIMUM PURCHASE QUANTITY': '1',
  'OUS SHOW PRICES': '0',
  'OUS Show Distributors Button': '1',
  VARIANT: curly('tenant~web-quantity', 'HRP (1 mg)'),
  'VARIANT COUNT': '10',
}

const bethylA80104AP: ProductCardRecord = {
  sku: 'A80-104AP',
  parent_id: 'BETHYL-A80-104',
  brand_code: 'bethyl',
  slice_product: true,
  current_price: 277,
  'SKU STATUS': 'Active',
  'STOCK BEHAVIOUR': 'DenyBackorder',
  'MINIMUM PURCHASE QUANTITY': '1',
  'OUS SHOW PRICES': '0',
  'OUS Show Distributors Button': '1',
  VARIANT: curly('tenant~web-quantity', 'Alkaline Phosphatase (1 mg)'),
}

const bethylA90116B: ProductCardRecord = {
  sku: 'A90-116B',
  parent_id: 'BETHYL-A90-116',
  brand_code: 'bethyl',
  slice_product: true,
  current_price: 150,
  'SKU STATUS': 'Active',
  'STOCK BEHAVIOUR': 'AcceptBackorder',
  'MINIMUM PURCHASE QUANTITY': '1',
  VARIANT: curly('tenant~web-quantity', 'Biotin (0.1 mg)'),
}

const bethylA700282647: ProductCardRecord = {
  sku: 'A700-282-647',
  parent_id: 'BETHYL-A700-282-647',
  brand_code: 'bethyl',
  slice_product: false,
  current_price: 525,
  'SKU STATUS': 'Active',
  'STOCK BEHAVIOUR': 'AcceptBackorder',
  'MINIMUM PURCHASE QUANTITY': '1',
  'OUS SHOW PRICES': '0',
  'OUS Show Distributors Button': '1',
  VARIANT: curly('tenant~web-quantity', '100 µl'),
}

const abcoreL770200: ProductCardRecord = {
  sku: 'L770-200',
  parent_id: 'AbNano-Anti-NK-Cell-VHH',
  brand_code: 'abcore',
  slice_product: false,
  current_price: 12000,
  'SKU STATUS': 'CustomCTA',
  'CUSTOM CTA LABEL': 'Request Quote',
  'CUSTOM CTA TARGET': '/vhh-libraries-quote?Catalog_Number=',
  'CUSTOM CTA SHOW PRICES': '0',
  'STOCK BEHAVIOUR': 'DenyBackorder',
  'MINIMUM PURCHASE QUANTITY': '1',
  'OUS SHOW PRICES': '0',
  'OUS Show Distributors Button': '0',
  VARIANT: curly('tenant~web-quantity', 'Single Vial'),
}

const legacyA80108A: ProductCardRecord = {
  sku: 'A80-108A',
  parent_id: 'BETHYL-A80-108',
  brand_code: 'bethyl',
  slice_product: true,
  current_price: 200,
}

const aristaCGTSH0702: ProductCardRecord = {
  sku: 'CGTSH-0702',
  parent_id: 'ARISTA-TSH-07',
  brand_code: 'arista',
  slice_product: false,
  current_price: 33,
  'SKU STATUS': 'CustomCTA',
  'CUSTOM CTA LABEL': 'Request Quote',
  'CUSTOM CTA TARGET': '/lfa-antibody-antigen-request?Catalog_Number=',
  'CUSTOM CTA SHOW PRICES': '0',
  'OUS SHOW PRICES': '0',
  'OUS Show Distributors Button': '0',
  VARIANT: curly('tenant~web-quantity', 'Variant 4'),
}

const empiricalRQOSMM600: ProductCardRecord = {
  sku: 'RQOS-MM-600',
  parent_id: 'EMPIRICAL-RQOS',
  brand_code: 'empirical',
  slice_product: false,
  current_price: 843.21,
  'SKU STATUS': 'CustomCTA',
  'CUSTOM CTA LABEL': 'Buy Product',
  'CUSTOM CTA TARGET': '/catalog-molecular-reagent-quote?Catalog_Number=',
  'CUSTOM CTA SHOW PRICES': '1',
  'OUS SHOW PRICES': '1',
  'OUS Show Distributors Button': '0',
  VARIANT: curly('tenant~web-quantity', '600 Reactions'),
}

const bethylA110239D5: ProductCardRecord = {
  sku: 'A110-239D5',
  parent_id: 'BETHYL-A110-239',
  brand_code: 'bethyl',
  slice_product: true,
  current_price: 221,
  'SKU STATUS': 'Active',
  'STOCK BEHAVIOUR': 'DenyBackorder',
  'MINIMUM STOCK': '3',
  'MINIMUM PURCHASE QUANTITY': '1',
  VARIANT: curly('tenant~web-quantity', 'DyLight® 650 (0.5 mg)'),
  'VARIANT COUNT': '3',
}

const productHref = '/products/some-category/some-product/PARENT'
const us = { countryCode: 'US', isMounted: true, productHref }
const de = { countryCode: 'DE', isMounted: true, productHref }

describe('parseVariant', () => {
  it('parses the curly-quote string Algolia sends today', () => {
    expect(parseVariant(curly('tenant~web-quantity', 'HRP (1 mg)'))).toEqual({
      fqn: 'tenant~web-quantity',
      value: 'HRP (1 mg)',
      label: 'HRP (1 mg)',
    })
  })

  it('parses valid JSON', () => {
    expect(parseVariant('{"fqn":"tenant~web-quantity","value":"100 µl","label":"100 µl"}')).toEqual(
      { fqn: 'tenant~web-quantity', value: '100 µl', label: '100 µl' }
    )
  })

  it('accepts an object as is', () => {
    const value = { fqn: 'tenant~web-quantity', value: '1 mg', label: '1 mg' }
    expect(parseVariant(value)).toBe(value)
  })

  it.each([undefined, null, '', '   ', 'not json', '{ broken', 42])(
    'returns null for %p',
    (raw) => {
      expect(parseVariant(raw)).toBeNull()
    }
  )
})

describe('isUsVisitor', () => {
  it.each([
    [{ countryCode: 'US', isMounted: true }, true],
    [{ countryCode: '', isMounted: true }, true],
    [{ countryCode: '  ', isMounted: true }, true],
    [{ countryCode: undefined, isMounted: true }, true],
    [{ countryCode: 'DE', isMounted: false }, true],
    [{ countryCode: 'DE', isMounted: true }, false],
  ])('%p -> %p', (ctx, expected) => {
    expect(isUsVisitor(ctx)).toBe(expected)
  })
})

describe('getProductCardState', () => {
  it('returns null when the record has no SKU STATUS', () => {
    expect(getProductCardState(legacyA80108A, us)).toBeNull()
  })

  it('sliced Active AcceptBackorder: price, variant label, add to cart without stock check', () => {
    expect(getProductCardState(bethylA80104P, us)).toEqual({
      priceVisible: true,
      price: 166,
      sizeLabel: 'HRP (1 mg)',
      sizeCount: null,
      note: null,
      button: { kind: 'addToCart', stockCheck: false, minimumStock: 3 },
      addToCart: {
        productCode: 'BETHYL-A80-104',
        variationProductCode: 'A80-104P',
        options: [{ attributeFQN: 'tenant~web-quantity', value: 'HRP (1 mg)' }],
        quantity: 1,
      },
    })
  })

  it('DenyBackorder without MINIMUM STOCK: stock check with a minimum of 0', () => {
    const state = getProductCardState(bethylA80104AP, us)
    expect(state?.button).toEqual({ kind: 'addToCart', stockCheck: true, minimumStock: 0 })
    expect(state?.sizeLabel).toBe('Alkaline Phosphatase (1 mg)')
  })

  it('DenyBackorder with MINIMUM STOCK 3 on a sliced record: stock check with a minimum of 3', () => {
    const state = getProductCardState(bethylA110239D5, us)
    expect(state?.button).toEqual({ kind: 'addToCart', stockCheck: true, minimumStock: 3 })
    expect(state?.price).toBe(221)
  })

  it('missing VARIANT COUNT still adds to cart', () => {
    expect(getProductCardState(bethylA90116B, us)?.button.kind).toBe('addToCart')
  })

  it('unsliced single product: add to cart with its size label', () => {
    const state = getProductCardState(bethylA700282647, us)
    expect(state?.button.kind).toBe('addToCart')
    expect(state?.sizeLabel).toBe('100 µl')
    expect(state?.price).toBe(525)
  })

  it('unsliced with several sizes: choose a size with the record stock rules', () => {
    const state = getProductCardState({ ...bethylA110239D5, slice_product: false }, us)
    expect(state?.button).toMatchObject({ kind: 'chooseSize', href: productHref })
    expect(state?.sizeCount).toBe(3)
    expect(state?.sizeLabel).toBeNull()
    expect(state?.addToCart).toBeNull()
  })

  it('CustomCTA with prices hidden: never exposes the price', () => {
    const state = getProductCardState(abcoreL770200, us)
    expect(state?.priceVisible).toBe(false)
    expect(state?.price).toBeNull()
    expect(state?.button).toEqual({
      kind: 'customCta',
      label: 'Request Quote',
      href: '/vhh-libraries-quote?Catalog_Number=L770-200',
    })
    expect(state?.addToCart).toBeNull()
  })

  it('CustomCTA with prices shown', () => {
    const state = getProductCardState(empiricalRQOSMM600, us)
    expect(state?.priceVisible).toBe(true)
    expect(state?.price).toBe(843.21)
    expect(state?.sizeLabel).toBe('600 Reactions')
    expect(state?.button).toEqual({
      kind: 'customCta',
      label: 'Buy Product',
      href: '/catalog-molecular-reagent-quote?Catalog_Number=RQOS-MM-600',
    })
  })

  it('Arista: shows the SKU instead of the placeholder variant', () => {
    const state = getProductCardState(aristaCGTSH0702, us)
    expect(state?.sizeLabel).toBe('CGTSH-0702')
    expect(state?.priceVisible).toBe(false)
    expect(state?.button).toEqual({
      kind: 'customCta',
      label: 'Request Quote',
      href: '/lfa-antibody-antigen-request?Catalog_Number=CGTSH-0702',
    })
  })

  it.each(['On Hold', 'Discontinued', 'anything'])('status %p links to the PDP', (status) => {
    const state = getProductCardState({ ...bethylA80104P, 'SKU STATUS': status }, us)
    expect(state?.button).toEqual({ kind: 'pdpLink', href: productHref })
    expect(state?.addToCart).toBeNull()
  })

  it('Active without a parseable VARIANT links to the PDP', () => {
    const state = getProductCardState({ ...bethylA80104P, VARIANT: 'garbage' }, us)
    expect(state?.button).toEqual({ kind: 'pdpLink', href: productHref })
    expect(state?.sizeLabel).toBeNull()
  })

  it('CustomCTA without a label or target links to the PDP', () => {
    const state = getProductCardState({ ...abcoreL770200, 'CUSTOM CTA LABEL': '' }, us)
    expect(state?.button).toEqual({ kind: 'pdpLink', href: productHref })
  })

  it('MINIMUM PURCHASE QUANTITY sets the quantity', () => {
    const state = getProductCardState({ ...bethylA80104P, 'MINIMUM PURCHASE QUANTITY': '5' }, us)
    expect(state?.addToCart?.quantity).toBe(5)
  })

  it('treats the visitor as US before mount', () => {
    const state = getProductCardState(bethylA80104P, { ...de, isMounted: false })
    expect(state?.priceVisible).toBe(true)
    expect(state?.button.kind).toBe('addToCart')
  })

  describe('non-US visitor', () => {
    it('Bethyl: distributors button and hidden price', () => {
      const state = getProductCardState(bethylA80104P, de)
      expect(state?.priceVisible).toBe(false)
      expect(state?.price).toBeNull()
      expect(state?.button).toEqual({ kind: 'distributors', href: '/distributors' })
      expect(state?.note).toBeNull()
      expect(state?.addToCart).toBeNull()
    })

    it('CustomCTA without distributors: custom CTA, price per OUS SHOW PRICES', () => {
      const hidden = getProductCardState(abcoreL770200, de)
      expect(hidden?.priceVisible).toBe(false)
      expect(hidden?.button.kind).toBe('customCta')

      const shown = getProductCardState(empiricalRQOSMM600, de)
      expect(shown?.priceVisible).toBe(true)
      expect(shown?.price).toBe(843.21)
      expect(shown?.button.kind).toBe('customCta')
    })

    it('Active without distributors: note and no button', () => {
      const state = getProductCardState(
        { ...bethylA80104P, 'OUS Show Distributors Button': '0' },
        de
      )
      expect(state?.note).toBe('nonDistributor')
      expect(state?.button).toEqual({ kind: 'none' })
    })
  })
})
