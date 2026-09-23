import type { PdpBrandKey } from './pdpBrandConfig'

export type SpecRenderKind = 'text' | 'html' | 'link' | 'list'

export interface SpecRowConfig {
  fqn: string
  labelOverride?: string
  render?: SpecRenderKind
  href?: (value: string) => string
  external?: boolean
  separator?: string
}

export interface SpecGroupConfig {
  id: string
  label?: string
  rows: SpecRowConfig[]
}

const ncbiGeneUrl = (value: string) =>
  `https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(value)}`

const uniprotUrl = (value: string) => `https://www.uniprot.org/uniprot/${encodeURIComponent(value)}`

const siteSearchUrl = (value: string) => `/search?query=${encodeURIComponent(value)}`

export const DEFAULT_SPEC_GROUPS: SpecGroupConfig[] = [
  {
    id: 'identity',
    rows: [
      { fqn: 'tenant~clonality' },
      { fqn: 'tenant~clone' },
      { fqn: 'tenant~host' },
      { fqn: 'tenant~immunogen' },
      { fqn: 'tenant~iso-type' },
      { fqn: 'tenant~verified-reactivity' },
      { fqn: 'tenant~source-species' },
      { fqn: 'tenant~cross-reactivity', render: 'html' },
      { fqn: 'tenant~format' },
      { fqn: 'tenant~epitope-tag' },
      { fqn: 'tenant~conjugate-type-variant' },
      { fqn: 'tenant~conjugate-type' },
      { fqn: 'tenant~purification' },
      { fqn: 'tenant~purity-variant' },
      { fqn: 'tenant~purity' },
      { fqn: 'tenant~stock-concentration' },
    ],
  },
  {
    id: 'target',
    label: 'Target Identity',
    rows: [
      { fqn: 'tenant~target', render: 'link', href: siteSearchUrl },
      { fqn: 'tenant~target-specificity' },
      { fqn: 'tenant~antigen-species' },
      { fqn: 'tenant~gene-id', render: 'link', href: ncbiGeneUrl, external: true },
      { fqn: 'tenant~symbol' },
      { fqn: 'tenant~gene-name' },
      { fqn: 'tenant~uniprot-id', render: 'link', href: uniprotUrl, external: true },
      { fqn: 'tenant~protein-name' },
      { fqn: 'tenant~gene-aliases', render: 'list', separator: ';' },
    ],
  },
  {
    id: 'productInfo',
    label: 'Product Information',
    rows: [
      { fqn: 'tenant~assay-role' },
      { fqn: 'tenant~applications-variant' },
      { fqn: 'tenant~applications' },
      { fqn: 'tenant~assay-type' },
      { fqn: 'tenant~assay-range' },
      { fqn: 'tenant~sample-type' },
      { fqn: 'tenant~detection-method' },
      { fqn: 'tenant~buffer' },
      { fqn: 'tenant~storage-buffer' },
      { fqn: 'tenant~preservative' },
      { fqn: 'tenant~ph' },
      { fqn: 'tenant~storage-variant' },
      { fqn: 'tenant~storage-handling' },
      { fqn: 'tenant~physical-state-text' },
      { fqn: 'tenant~physical-state' },
      { fqn: 'tenant~shelf-life-variant' },
      { fqn: 'tenant~contents-variant' },
      { fqn: 'tenant~contents' },
      { fqn: 'tenant~usage-instructions', render: 'html' },
      { fqn: 'tenant~country-of-origin' },
      { fqn: 'tenant~use-statement' },
    ],
  },
]

export const ABCORE_SPEC_GROUPS: SpecGroupConfig[] = [
  {
    id: 'library',
    label: 'Library Information',
    rows: [
      { fqn: 'tenant~host' },
      { fqn: 'tenant~immunogen' },
      { fqn: 'tenant~cdr3-length', labelOverride: 'CDR3 Length' },
      { fqn: 'tenant~transformants', labelOverride: 'Transformants' },
      { fqn: 'tenant~ngs-reads', labelOverride: 'NGS Reads' },
      { fqn: 'tenant~in-frame-sequences', labelOverride: 'In-Frame Sequences' },
    ],
  },
  {
    id: 'productInfo',
    label: 'Product Information',
    rows: [
      { fqn: 'tenant~volume', labelOverride: 'Volume' },
      { fqn: 'tenant~stock-concentration' },
      { fqn: 'tenant~buffer' },
      { fqn: 'tenant~contents-variant' },
      { fqn: 'tenant~contents' },
      { fqn: 'tenant~iso-type' },
      { fqn: 'tenant~physical-state-text' },
      { fqn: 'tenant~physical-state' },
      { fqn: 'tenant~storage-variant' },
      { fqn: 'tenant~shelf-life-variant' },
      { fqn: 'tenant~country-of-origin' },
      { fqn: 'tenant~use-statement' },
    ],
  },
  {
    id: 'panning',
    label: 'Panning Information',
    rows: [
      { fqn: 'tenant~recommended-input', labelOverride: 'Recommended Input' },
      { fqn: 'tenant~format' },
      { fqn: 'tenant~selection-method', labelOverride: 'Selection Method' },
    ],
  },
  {
    id: 'characterization',
    label: 'Characterization',
    rows: [
      { fqn: 'tenant~v-gene-representation', labelOverride: 'V-Gene Representation' },
      { fqn: 'tenant~cluster-density-frequency', labelOverride: 'Cluster Density + Frequency' },
      { fqn: 'tenant~cdr-composition', labelOverride: 'CDR Composition' },
    ],
  },
]

export const getSpecGroups = (brandKey: PdpBrandKey): SpecGroupConfig[] =>
  brandKey === 'abcore' ? ABCORE_SPEC_GROUPS : DEFAULT_SPEC_GROUPS
