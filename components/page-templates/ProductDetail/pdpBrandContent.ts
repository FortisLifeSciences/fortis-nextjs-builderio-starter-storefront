import type { PdpBrandKey } from './pdpBrandConfig'

export type PdpSupportIcon = 'truck' | 'chat' | 'globe'

export interface PdpSupportRow {
  id: string
  title: string
  subtitle: string
  href?: string
  icon: PdpSupportIcon
}

export interface PdpBrandCardContent {
  stars: boolean
  logos: string[]
  benefits: string[]
  href?: string
}

export interface PdpServiceCard {
  id: string
  title: string
  copy: string
  ctaLabel: string
  href: string
  art?: string
}

export interface PdpResourceCard {
  id: string
  title: string
  ctaLabel: string
  href: string
  icon: string
}

export interface PdpPublicationCta {
  title: string
  copy: string
  ctaLabel: string
  href: string
}

export interface PdpSecondaryCta {
  label: string
  href: string
  variant: 'filled' | 'outline'
}

export interface PdpBrandContent {
  supportRows: PdpSupportRow[]
  brandCard?: PdpBrandCardContent
  services: PdpServiceCard[]
  resources: PdpResourceCard[]
  publicationCta?: PdpPublicationCta
  secondaryCtas: PdpSecondaryCta[]
  relatedCtaLabel: string
}

const SHARED_PUBLICATION_CTA: PdpPublicationCta = {
  title: 'Using this product in your research?',
  copy: 'Published applications help other scientists evaluate reagents and accelerate assay development.',
  ctaLabel: 'Upload Your Publication',
  href: '/contact-us',
}

const CONTACT_ROWS: PdpSupportRow[] = [
  {
    id: 'representative',
    title: 'Contact a Fortis Representative',
    subtitle: 'For Orders in the US',
    href: 'https://www.fortislife.com/#distributors',
    icon: 'chat',
  },
  {
    id: 'distributor',
    title: 'Find a Distributor',
    subtitle: 'Local ordering worldwide',
    href: 'https://www.fortislife.com/distributors',
    icon: 'globe',
  },
]

const technicalSupportRow = (subtitle: string): PdpSupportRow => ({
  id: 'technical',
  title: 'Technical Support',
  subtitle,
  href: '/contact-us',
  icon: 'chat',
})

const ANTIBODY_SUPPORT_ROWS: PdpSupportRow[] = [
  {
    id: 'bulk',
    title: 'Bulk & Custom Option',
    subtitle: 'Bulk and custom supply options',
    href: '/bulk-custom-oem',
    icon: 'truck',
  },
  ...CONTACT_ROWS,
  technicalSupportRow('50+ years of antibody expertise'),
]

const ANTIBODY_SERVICES: PdpServiceCard[] = [
  {
    id: 'antibody-conjugation',
    title: 'Antibody Conjugation',
    copy: 'Antibody and conjugate formats developed together, built to your specification.',
    ctaLabel: 'Request Customization',
    href: '/antibody-conjugation-services',
    art: '/pdp/services/bethyl-1.png',
  },
  {
    id: 'monoclonal-discovery',
    title: 'Custom Monoclonal Antibody Discovery Services',
    copy: 'Full custom monoclonal development, from immunization through validation.',
    ctaLabel: 'Explore Monoclonal Development',
    href: '/custom-monoclonal-antibodies',
    art: '/pdp/services/bethyl-2.png',
  },
  {
    id: 'vhh-discovery',
    title: 'VHH Discovery',
    copy: "Single-domain antibodies for structurally difficult targets a conventional monoclonal can't reach.",
    ctaLabel: 'Explore VHH Discovery',
    href: '/vhh-discovery',
    art: '/pdp/services/bethyl-3.png',
  },
]

const ANTIBODY_RESOURCES: PdpResourceCard[] = [
  {
    id: 'western-blot-protocol',
    title: 'Standard Western Blot Protocol',
    ctaLabel: 'Read the Protocol',
    href: '/protocols',
    icon: '/pdp/resources/file-check-02.svg',
  },
  {
    id: 'ip-protocol',
    title: 'Immunoprecipitation Protocol',
    ctaLabel: 'Read the Protocol',
    href: '/protocols',
    icon: '/pdp/resources/file-05.svg',
  },
  {
    id: 'simple-western',
    title: 'Simple Western™ Resources',
    ctaLabel: 'Explore Simple Western™',
    href: '/resources',
    icon: '/pdp/resources/file-multiple.svg',
  },
]

export const PDP_BRAND_CONTENT: Record<PdpBrandKey, PdpBrandContent> = {
  arista: {
    supportRows: [...CONTACT_ROWS, technicalSupportRow('30+ years of lateral flow experience')],
    brandCard: {
      stars: true,
      logos: [],
      benefits: [
        'Flexible product configurations, and scalable supply.',
        'Purpose-designated for capture, detection, or both in rapid-test development.',
        'Bulk quantities, custom formulations and gold conjugation option are available to support your projects needs.',
      ],
    },
    publicationCta: SHARED_PUBLICATION_CTA,
    secondaryCtas: [
      { label: 'Request a Sample', href: '/contact-us', variant: 'filled' },
      { label: 'Order in Bulk', href: '/bulk-custom-oem', variant: 'outline' },
    ],
    relatedCtaLabel: 'View Product',
    services: [
      {
        id: 'different-format',
        title: 'Need a different format?',
        copy: 'Custom purification, concentration or buffer formulation, built to your specifications.',
        ctaLabel: 'Request Customization',
        href: '/contact-us',
        art: '/pdp/services/arista-1.png',
      },
      {
        id: 'lfa-development',
        title: 'Need LFA development support?',
        copy: 'Process development, manufacturing from feasibility through commercial production',
        ctaLabel: 'Request Customization',
        href: '/contact-us',
        art: '/pdp/services/arista-2.png',
      },
      {
        id: 'gold-nanoparticle',
        title: 'Need a custom gold nanoparticle?',
        copy: 'Need custom Gold nanoparticles? Various sizes, shapes, surface modifications, and custom options.',
        ctaLabel: 'Request Customization',
        href: '/contact-us',
        art: '/pdp/services/arista-3.png',
      },
    ],
    resources: [
      {
        id: 'fertility-webinar',
        title: 'Reagent Selection For Fertility Rapid Tests',
        ctaLabel: 'Watch the Webinar',
        href: '/resources',
        icon: '/pdp/resources/video-on.svg',
      },
      {
        id: 'matched-pairs',
        title: 'Matched Pairs For Rapid Test Development',
        ctaLabel: 'Read the White Paper',
        href: '/resources',
        icon: '/pdp/resources/file-02.svg',
      },
      {
        id: 'control-line-systems',
        title: 'Control Line Systems for Lateral Flow Assays',
        ctaLabel: 'Read the Article',
        href: '/resources',
        icon: '/pdp/resources/file-05.svg',
      },
    ],
  },
  bethyl: {
    supportRows: [
      { ...ANTIBODY_SUPPORT_ROWS[0], title: 'Bulk & Custom Quantities' },
      ...ANTIBODY_SUPPORT_ROWS.slice(1),
    ],
    brandCard: {
      stars: true,
      logos: [],
      benefits: [
        '50+ years of proven expertise',
        'Farm-to-Bench™ production',
        'Custom development, conjugation, and assay services',
      ],
      href: 'https://www.fortislife.com/bethyl-laboratories',
    },
    publicationCta: SHARED_PUBLICATION_CTA,
    secondaryCtas: [{ label: 'Bulk Request', href: '/bulk-custom-oem', variant: 'outline' }],
    relatedCtaLabel: 'See Product Details',
    services: ANTIBODY_SERVICES,
    resources: ANTIBODY_RESOURCES,
  },
  abcore: {
    supportRows: ANTIBODY_SUPPORT_ROWS,
    brandCard: {
      stars: true,
      logos: [],
      benefits: [
        'Immune-Derived Natural VHH Libraries',
        'NGS-Characterized Diversity',
        'VHH Discovery Services',
      ],
    },
    publicationCta: SHARED_PUBLICATION_CTA,
    secondaryCtas: [{ label: 'Bulk Request', href: '/bulk-custom-oem', variant: 'outline' }],
    relatedCtaLabel: 'See Product Details',
    services: ANTIBODY_SERVICES,
    resources: ANTIBODY_RESOURCES,
  },
  default: {
    supportRows: [...CONTACT_ROWS, technicalSupportRow('50+ years of antibody expertise')],
    publicationCta: SHARED_PUBLICATION_CTA,
    secondaryCtas: [],
    relatedCtaLabel: 'See Product Details',
    services: [],
    resources: [],
  },
}

export const getPdpBrandContent = (brandKey: PdpBrandKey): PdpBrandContent =>
  PDP_BRAND_CONTENT[brandKey] ?? PDP_BRAND_CONTENT.default
