export type PdpBrandKey = 'arista' | 'bethyl' | 'abcore' | 'default'

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

export interface PdpHeroFactConfig {
  fqns: string[]
  label?: string
}

export interface PdpBrandConfig {
  leftSections: PdpSectionId[]
  belowSections: PdpSectionId[]
  mobileBarVariant: 'sample' | 'sizePicker' | 'none'
  brandCardStars: boolean
  brandCardLogoVariant: 'fortisPlusBrand' | 'brandOnly' | 'none'
  heroFacts: PdpHeroFactConfig[]
  specLabelOverrides: Record<string, string>
  productionHeading: string
  documentsLinkWithCode: boolean
  relatedCardVariant: 'plain' | 'branded'
}

const DEFAULT_BELOW_SECTIONS: PdpSectionId[] = [
  'citations',
  'publicationCta',
  'related',
  'services',
  'resources',
]

const APPLICATION_FACT: PdpHeroFactConfig = {
  fqns: ['tenant~applications-variant', 'tenant~applications'],
  label: 'Application',
}

const SHARED_SPEC_LABELS: Record<string, string> = {
  'tenant~verified-reactivity': 'Reactivity',
  'tenant~gene-aliases': 'Alternate Names',
  'tenant~storage-variant': 'Storage Conditions',
}

const DEFAULT_HERO_FACTS: PdpHeroFactConfig[] = [
  { fqns: ['tenant~target'] },
  { fqns: ['tenant~host'] },
  { fqns: ['tenant~clone'] },
  { fqns: ['tenant~verified-reactivity'], label: 'Reactivity' },
  APPLICATION_FACT,
  { fqns: ['tenant~iso-type'] },
  { fqns: ['tenant~clonality'] },
  { fqns: ['tenant~source-species'] },
  { fqns: ['tenant~antigen-species'] },
  { fqns: ['tenant~format'] },
  { fqns: ['tenant~conjugate-type-variant'] },
]

export const PDP_BRAND_CONFIGS: Record<PdpBrandKey, PdpBrandConfig> = {
  arista: {
    leftSections: ['description', 'pairing', 'specs', 'documents'],
    belowSections: DEFAULT_BELOW_SECTIONS,
    mobileBarVariant: 'sample',
    brandCardStars: true,
    brandCardLogoVariant: 'fortisPlusBrand',
    heroFacts: [
      { fqns: ['tenant~target'] },
      { fqns: ['tenant~host'] },
      { fqns: ['tenant~clone', 'tenant~clonality'] },
      { fqns: ['tenant~iso-type'] },
      APPLICATION_FACT,
    ],
    specLabelOverrides: {
      ...SHARED_SPEC_LABELS,
      'tenant~verified-reactivity': 'Species Reactivity',
      'tenant~storage-variant': 'Storage',
      'tenant~applications-variant': 'Application',
      'tenant~applications': 'Application',
    },
    productionHeading: 'Production',
    documentsLinkWithCode: false,
    relatedCardVariant: 'plain',
  },
  bethyl: {
    leftSections: ['description', 'specs', 'production', 'applications', 'documents'],
    belowSections: DEFAULT_BELOW_SECTIONS,
    mobileBarVariant: 'sizePicker',
    brandCardStars: true,
    brandCardLogoVariant: 'brandOnly',
    heroFacts: [
      { fqns: ['tenant~target'] },
      { fqns: ['tenant~host'] },
      { fqns: ['tenant~clone', 'tenant~clonality'] },
      { fqns: ['tenant~verified-reactivity'], label: 'Reactivity' },
      APPLICATION_FACT,
    ],
    specLabelOverrides: SHARED_SPEC_LABELS,
    productionHeading: 'Production & Epitope',
    documentsLinkWithCode: true,
    relatedCardVariant: 'branded',
  },
  abcore: {
    leftSections: ['description', 'specs', 'production', 'applications', 'documents'],
    belowSections: DEFAULT_BELOW_SECTIONS,
    mobileBarVariant: 'none',
    brandCardStars: true,
    brandCardLogoVariant: 'brandOnly',
    heroFacts: [
      { fqns: ['tenant~target'] },
      APPLICATION_FACT,
      { fqns: ['tenant~library-type'], label: 'Library Type' },
      { fqns: ['tenant~library-diversity'], label: 'Library Diversity' },
      { fqns: ['tenant~format'], label: 'Display' },
    ],
    specLabelOverrides: {
      ...SHARED_SPEC_LABELS,
      'tenant~host': 'Source',
      'tenant~contents': 'Buffer',
      'tenant~format': 'Display',
    },
    productionHeading: 'Production',
    documentsLinkWithCode: true,
    relatedCardVariant: 'branded',
  },
  default: {
    leftSections: ['description', 'specs', 'production', 'applications', 'documents'],
    belowSections: DEFAULT_BELOW_SECTIONS,
    mobileBarVariant: 'none',
    brandCardStars: false,
    brandCardLogoVariant: 'none',
    heroFacts: DEFAULT_HERO_FACTS,
    specLabelOverrides: SHARED_SPEC_LABELS,
    productionHeading: 'Production',
    documentsLinkWithCode: false,
    relatedCardVariant: 'branded',
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

export const MAX_HERO_FACTS = 6
