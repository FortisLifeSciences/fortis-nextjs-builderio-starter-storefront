export type PdpBrandKey = 'arista' | 'bethyl' | 'default'

export type PdpSectionId =
  | 'description'
  | 'pairing'
  | 'specs'
  | 'production'
  | 'applications'
  | 'documents'
  | 'citations'
  | 'publicationCta'
  | 'related'
  | 'services'
  | 'resources'

export interface PdpBrandConfig {
  leftSections: PdpSectionId[]
  belowSections: PdpSectionId[]
  mobileBarVariant: 'sample' | 'sizePicker' | 'none'
  brandCardStars: boolean
  brandCardLogoVariant: 'fortisPlusBrand' | 'brandOnly' | 'none'
}

const DEFAULT_BELOW_SECTIONS: PdpSectionId[] = [
  'citations',
  'publicationCta',
  'related',
  'services',
  'resources',
]

export const PDP_BRAND_CONFIGS: Record<PdpBrandKey, PdpBrandConfig> = {
  arista: {
    leftSections: ['description', 'pairing', 'specs', 'documents'],
    belowSections: DEFAULT_BELOW_SECTIONS,
    mobileBarVariant: 'sample',
    brandCardStars: true,
    brandCardLogoVariant: 'fortisPlusBrand',
  },
  bethyl: {
    leftSections: ['description', 'specs', 'production', 'applications'],
    belowSections: DEFAULT_BELOW_SECTIONS,
    mobileBarVariant: 'sizePicker',
    brandCardStars: true,
    brandCardLogoVariant: 'brandOnly',
  },
  default: {
    leftSections: ['description', 'specs', 'applications', 'documents'],
    belowSections: DEFAULT_BELOW_SECTIONS,
    mobileBarVariant: 'none',
    brandCardStars: false,
    brandCardLogoVariant: 'none',
  },
}

export const resolveBrandKey = (brand?: string | null): PdpBrandKey => {
  const key = brand?.toLowerCase()
  if (key && key in PDP_BRAND_CONFIGS && key !== 'default') {
    return key as PdpBrandKey
  }
  return 'default'
}

export const getPdpBrandConfig = (brand?: string | null): PdpBrandConfig =>
  PDP_BRAND_CONFIGS[resolveBrandKey(brand)]

export const HERO_FACT_FQNS: string[] = [
  'tenant~target',
  'tenant~host',
  'tenant~clone',
  'tenant~iso-type',
  'tenant~verified-reactivity',
  'tenant~applications-variant',
  'tenant~applications',
  'tenant~clonality',
  'tenant~source-species',
  'tenant~antigen-species',
  'tenant~format',
  'tenant~conjugate-type-variant',
]

export const MAX_HERO_FACTS = 6
