export type SpecRenderKind = 'text' | 'html' | 'link'

export interface SpecRowConfig {
  fqn: string
  labelOverride?: string
  render?: SpecRenderKind
  href?: (value: string) => string
}

export interface SpecGroupConfig {
  id: string
  label?: string
  rows: SpecRowConfig[]
}

const ncbiGeneUrl = (value: string) =>
  `https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(value)}`

const uniprotUrl = (value: string) => `https://www.uniprot.org/uniprot/${encodeURIComponent(value)}`

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
      { fqn: 'tenant~target' },
      { fqn: 'tenant~target-sentence', render: 'html' },
      { fqn: 'tenant~target-specificity' },
      { fqn: 'tenant~antigen-species' },
      { fqn: 'tenant~gene-id', render: 'link', href: ncbiGeneUrl },
      { fqn: 'tenant~symbol' },
      { fqn: 'tenant~gene-name' },
      { fqn: 'tenant~uniprot-id', render: 'link', href: uniprotUrl },
      { fqn: 'tenant~protein-name' },
      { fqn: 'tenant~gene-aliases', render: 'html' },
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
      { fqn: 'tenant~physical-state' },
      { fqn: 'tenant~shelf-life-variant' },
      { fqn: 'tenant~contents-variant' },
      { fqn: 'tenant~contents' },
      { fqn: 'tenant~usage-instructions', render: 'html' },
      { fqn: 'tenant~prodprocedures-1', render: 'html' },
      { fqn: 'tenant~country-of-origin' },
      { fqn: 'tenant~use-statement' },
    ],
  },
]
