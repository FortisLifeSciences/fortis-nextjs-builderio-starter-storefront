export type FacetLabelMapping = {
  facetValue: string
  label: string
}

export const facetLabelMapping: FacetLabelMapping[] = [
  {
    facetValue: 'brand',
    label: 'Brand',
  },
  {
    facetValue: 'reactivity',
    label: 'Reactivity',
  },
  {
    facetValue: 'applications',
    label: 'Applications',
  },
  {
    facetValue: 'product_type',
    label: 'Product Type',
  },
  {
    facetValue: 'formulation',
    label: 'Formulation',
  },
  {
    facetValue: 'platforms',
    label: 'Platforms',
  },
  {
    facetValue: 'conjugate',
    label: 'Conjugate',
  },
  {
    facetValue: 'assay_range',
    label: 'Assay Range',
  },
  {
    facetValue: 'sample_type',
    label: 'Sample Type',
  },
  {
    facetValue: 'detection_method',
    label: 'Detection Method',
  },
  {
    facetValue: 'host',
    label: 'Host',
  },
  {
    facetValue: 'format',
    label: 'Format',
  },
  {
    facetValue: 'immunogen',
    label: 'Immunogen',
  },
  {
    facetValue: 'clonality',
    label: 'Clonality',
  },
  {
    facetValue: 'data.resourceCategory',
    label: 'Resource Category',
  },
  {
    facetValue: 'data.resourceType',
    label: 'Resource Type',
  },
]

export const getFacetLabel = (facetValue: string): string => {
  const mapping = facetLabelMapping.find((item) => item.facetValue === facetValue)
  return mapping ? mapping.label : facetValue
}
