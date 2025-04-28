export type FacetLabelMapping = {
  facetValue: string
  label: string
}

export const facetLabelMapping: FacetLabelMapping[] = [
  {
    facetValue: 'applications',
    label: 'Application',
  },
  {
    facetValue: 'brand',
    label: 'Brand',
  },
  {
    facetValue: 'clonality',
    label: 'Clonality',
  },
  {
    facetValue: 'conjugate',
    label: 'Conjugate',
  },
  {
    facetValue: 'format',
    label: 'Format',
  },
  {
    facetValue: 'formulation',
    label: 'Formulation',
  },
  {
    facetValue: 'host',
    label: 'Host',
  },
  {
    facetValue: 'immunogen',
    label: 'Immunogen',
  },
  {
    facetValue: 'platform',
    label: 'Platform',
  },
  {
    facetValue: 'product_type',
    label: 'Product Type',
  },
  {
    facetValue: 'reactivity',
    label: 'Reactivity',
  },
  {
    facetValue: 'target',
    label: 'Target',
  },
  {
    facetValue: 'reactivity',
    label: 'Reactivity',
  },
  {
    facetValue: 'related_gene_info.research_areas_facet',
    label: 'Research Area',
  },
  {
    facetValue: 'data.researchAreas',
    label: 'Research Area',
  },
  {
    facetValue: 'data.resourceCategory',
    label: 'Resource Category',
  },
  {
    facetValue: 'data.resourceType',
    label: 'Research Type',
  },
]

export const getFacetLabel = (facetValue: string): string => {
  const mapping = facetLabelMapping.find((item) => item.facetValue === facetValue)
  return mapping ? mapping.label : facetValue
}
