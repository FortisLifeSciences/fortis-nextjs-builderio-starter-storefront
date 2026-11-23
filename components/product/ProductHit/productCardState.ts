export type ProductCardRecord = {
  sku?: string
  parent_id?: string
  brand_code?: string
  slice_product?: boolean
  current_price?: number | string | null
  'SKU STATUS'?: string
  'CUSTOM CTA SHOW PRICES'?: string | number | boolean
  'OUS SHOW PRICES'?: string | number | boolean
  'OUS Show Distributors Button'?: string | number | boolean
  'CUSTOM CTA LABEL'?: string
  'CUSTOM CTA TARGET'?: string
  'STOCK BEHAVIOUR'?: string
  'MINIMUM STOCK'?: string | number
  'MINIMUM PURCHASE QUANTITY'?: string | number
  VARIANT?: string | ParsedVariant | null
  'VARIANT COUNT'?: string | number
}

export type ParsedVariant = {
  fqn?: string
  value?: string
  label?: string
}

export type ProductCardButton =
  | { kind: 'addToCart'; stockCheck: boolean; minimumStock: number }
  | { kind: 'chooseSize'; href: string; stockCheck: boolean; minimumStock: number }
  | { kind: 'customCta'; label: string; href: string }
  | { kind: 'distributors'; href: string }
  | { kind: 'pdpLink'; href: string }
  | { kind: 'none' }

export type ProductCardState = {
  priceVisible: boolean
  price: number | null
  sizeLabel: string | null
  sizeCount: number | null
  note: 'nonDistributor' | null
  button: ProductCardButton
  addToCart: {
    productCode: string
    variationProductCode: string
    options: { attributeFQN: string; value: string }[]
    quantity: number
  } | null
}

export type ProductCardContext = {
  countryCode?: string | null
  isMounted: boolean
  productHref: string
}

export const DISTRIBUTORS_HREF = '/distributors'

const isTruthyFlag = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === '1' || normalized === 'true'
  }
  return false
}

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(typeof value === 'string' ? value.trim() : value)
  return Number.isFinite(parsed) ? parsed : null
}

export const parseVariant = (raw: unknown): ParsedVariant | null => {
  if (!raw) return null
  if (typeof raw === 'object') return raw as ParsedVariant
  if (typeof raw !== 'string') return null
  const normalized = raw.replace(/[“”„‟″]/g, '"').trim()
  if (!normalized) return null
  try {
    const parsed = JSON.parse(normalized)
    return parsed && typeof parsed === 'object' ? (parsed as ParsedVariant) : null
  } catch {
    return null
  }
}

export const isUsVisitor = ({ countryCode, isMounted }: Omit<ProductCardContext, 'productHref'>) =>
  !isMounted || !countryCode || countryCode.trim() === '' || countryCode === 'US'

export const hasCardData = (record: ProductCardRecord): boolean =>
  typeof record?.['SKU STATUS'] === 'string' && record['SKU STATUS'].trim() !== ''

export const getProductCardState = (
  record: ProductCardRecord,
  context: ProductCardContext
): ProductCardState | null => {
  if (!hasCardData(record)) return null

  const status = String(record['SKU STATUS']).trim()
  const isActive = status.toLowerCase() === 'active'
  const isCustomCta = status.toLowerCase() === 'customcta'
  const usVisitor = isUsVisitor(context)
  const sliced = Boolean(record.slice_product)
  const sku = record.sku ?? ''

  const priceVisible = usVisitor
    ? isCustomCta
      ? isTruthyFlag(record['CUSTOM CTA SHOW PRICES'])
      : true
    : isTruthyFlag(record['OUS SHOW PRICES'])

  const variant = parseVariant(record.VARIANT)
  const variantLabel = variant?.label || variant?.value || null
  const sizeLabel = record.brand_code?.toLowerCase() === 'arista' ? sku || null : variantLabel

  const variantCount = toNumber(record['VARIANT COUNT'])
  const multiSize = !sliced && variantCount !== null && variantCount > 1

  const customCtaHref = `${record['CUSTOM CTA TARGET'] ?? ''}${sku}`
  const customCtaLabel = (record['CUSTOM CTA LABEL'] ?? '').trim()
  const customCtaButton: ProductCardButton =
    customCtaLabel && record['CUSTOM CTA TARGET']
      ? { kind: 'customCta', label: customCtaLabel, href: customCtaHref }
      : { kind: 'pdpLink', href: context.productHref }

  const stockBehaviour = (record['STOCK BEHAVIOUR'] ?? '').trim().toLowerCase()
  const minimumStock = toNumber(record['MINIMUM STOCK']) ?? 0
  const quantity = Math.max(1, toNumber(record['MINIMUM PURCHASE QUANTITY']) ?? 1)

  const canAddToCart = Boolean(record.parent_id && sku && variant?.fqn && variant?.value)

  let button: ProductCardButton
  let note: ProductCardState['note'] = null

  if (usVisitor) {
    if (isCustomCta) {
      button = customCtaButton
    } else if (isActive && multiSize) {
      button = {
        kind: 'chooseSize',
        href: context.productHref,
        stockCheck: stockBehaviour !== 'acceptbackorder',
        minimumStock,
      }
    } else if (isActive && canAddToCart && stockBehaviour === 'acceptbackorder') {
      button = { kind: 'addToCart', stockCheck: false, minimumStock }
    } else if (isActive && canAddToCart && stockBehaviour === 'denybackorder') {
      button = { kind: 'addToCart', stockCheck: true, minimumStock }
    } else {
      button = { kind: 'pdpLink', href: context.productHref }
    }
  } else if (isTruthyFlag(record['OUS Show Distributors Button'])) {
    button = { kind: 'distributors', href: DISTRIBUTORS_HREF }
  } else if (isCustomCta) {
    button = customCtaButton
  } else {
    note = 'nonDistributor'
    button = { kind: 'none' }
  }

  const addToCart =
    button.kind === 'addToCart' && variant?.fqn && variant?.value
      ? {
          productCode: record.parent_id ?? '',
          variationProductCode: sku,
          options: [{ attributeFQN: variant.fqn, value: variant.value }],
          quantity,
        }
      : null

  return {
    priceVisible,
    price: priceVisible ? toNumber(record.current_price) : null,
    sizeLabel: multiSize ? null : sizeLabel,
    sizeCount: multiSize ? variantCount : null,
    note,
    button,
    addToCart,
  }
}
