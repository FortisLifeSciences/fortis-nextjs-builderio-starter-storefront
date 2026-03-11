import React from 'react'

import { BreadCrumb } from '../types'
import { uiHelpers } from '@/lib/helpers'

import type { Product } from '@/lib/gql/types'

interface SchemaMarkupOptions {
  product: Product
  breadcrumbs?: BreadCrumb[]
  productVariations?: Product[]
  baseUrl?: string
  organizationConfig?: OrganizationConfig
  brandConfig?: BrandConfig
}

interface OrganizationConfig {
  name: string
  url: string
  logo: string
  sameAs?: string[]
  contactPoint?: Array<{
    telephone: string
    contactType: string
    areaServed: string
  }>
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
}

interface BrandConfig {
  name: string
  slogan?: string
  logo: string
  sameAs?: string[]
}

/**
 * Generates Organization schema
 */
function generateOrganizationSchema(
  config: OrganizationConfig,
  baseUrl: string
): Record<string, any> {
  const schema: Record<string, any> = {
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: config.name,
    url: config.url,
    logo: config.logo,
  }

  if (config.sameAs && config.sameAs.length > 0) {
    schema.sameAs = config.sameAs
  }

  if (config.contactPoint && config.contactPoint.length > 0) {
    schema.contactPoint = config.contactPoint.map((contact) => ({
      '@type': 'ContactPoint',
      telephone: contact.telephone,
      contactType: contact.contactType,
      areaServed: contact.areaServed,
    }))
  }

  if (config.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: config.address.streetAddress,
      addressLocality: config.address.addressLocality,
      addressRegion: config.address.addressRegion,
      postalCode: config.address.postalCode,
      addressCountry: config.address.addressCountry,
    }
  }

  return schema
}

/**
 * Generates Brand schema
 */
function generateBrandSchema(
  config: BrandConfig,
  baseUrl: string,
  brandSlug: string
): Record<string, any> {
  const schema: Record<string, any> = {
    '@type': 'Brand',
    '@id': `${baseUrl}#brand-${brandSlug}`,
    name: config.name,
    logo: config.logo,
    parentOrganization: {
      '@id': `${baseUrl}#organization`,
    },
  }

  if (config.slogan) {
    schema.slogan = config.slogan
  }

  if (config.sameAs && config.sameAs.length > 0) {
    schema.sameAs = config.sameAs
  }

  return schema
}

/**
 * Generates BreadcrumbList schema
 */
function generateBreadcrumbSchema(
  breadcrumbs: BreadCrumb[],
  baseUrl: string,
  productUrl: string
): Record<string, any> {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${productUrl}#breadcrumb`,
    itemListElement: breadcrumbs.map((crumb, index) => {
      const item: Record<string, any> = {
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.text,
      }

      // Add item URL for all breadcrumbs including the last one
      if (crumb.link) {
        item.item = baseUrl + crumb.link
      }

      return item
    }),
  }
}

// Attributes whose stringValue contains raw HTML — strip tags before use in schema
const HTML_ATTRIBUTES = new Set([
  'tenant~target-sentence',
  'tenant~application-text',
  'tenant~application-text-variant',
  'tenant~gene-aliases',
  'tenant~usage-instructions',
  'tenant~prodprocedures-1',
])

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract additional properties from product
 */
function extractAdditionalProperties(product: Product): Array<Record<string, any>> {
  const additionalProperties: Array<Record<string, any>> = []

  // Map of attribute FQN suffixes (after tenant~) to display names
  const propertyMap: Record<string, string> = {
    // Core product specs
    target: 'Target',
    'target-sentence': 'Target Description',
    'verified-reactivity': 'Verified Reactivity',
    'source-species': 'Source Species',
    'antigen-species': 'Antigen Species',
    host: 'Host',
    clonality: 'Clonality',
    clone: 'Clone',
    'iso-type': 'Isotype',
    'epitope-tag': 'Epitope Tag',
    immunogen: 'Immunogen',
    format: 'Format',
    'conjugate-type-variant': 'Conjugate',
    'purity-variant': 'Purity',
    buffer: 'Buffer',
    'storage-buffer': 'Storage Buffer',
    'storage-variant': 'Storage',
    'storage-handling': 'Storage Handling',
    'shelf-life-variant': 'Shelf Life',
    'physical-state': 'Physical State',
    'stock-concentration': 'Stock Concentration',
    contents: 'Contents',
    'contents-variant': 'Contents',
    'country-of-origin': 'Country of Origin',
    // Applications & assay
    'applications-variant': 'Applications',
    'application-text': 'Application Details',
    'application-text-variant': 'Application Details',
    'application-dilution-range': 'Dilution Range',
    'assay-range': 'Assay Range',
    'assay-type': 'Assay Type',
    'detection-method': 'Detection Method',
    'sample-type': 'Sample Type',
    ph: 'pH',
    'usage-instructions': 'Usage Instructions',
    'prodprocedures-1': 'Product Procedures',
    // Gene / bioinformatics
    'gene-id': 'Gene ID',
    symbol: 'Gene Symbol',
    'gene-name': 'Gene Name',
    'gene-aliases': 'Gene Aliases',
    'uniprot-id': 'UniProt ID',
    'protein-name': 'Protein Name',
    // Other identifiers
    'plp-catalog-number': 'Catalog Number',
    'citeab-product-code': 'CiteAb Product Code',
    'current-lot-variant': 'Current Lot',
    // Manufacturing / certifications
    mfgcertification: 'Manufacturing Certification',
    mfgavailability: 'Manufacturing Availability',
    // Specificity (kept for backwards compatibility)
    specificity: 'Specificity',
  }

  // UI-only, internal, or CMS-specific attributes that should not appear in schema
  const excludedAttributes = new Set([
    // Brand / relations (handled separately)
    'tenant~brand',
    'tenant~related-products',
    // UI flags and config
    'tenant~new-product',
    'tenant~ous-show-distributors-button',
    'tenant~ous-show-prices',
    'tenant~show-prices',
    'tenant~sku-status-text',
    'tenant~custom-cta-label',
    'tenant~custom-cta-target',
    'tenant~stock-behavior-option',
    'tenant~minimum-stock',
    'tenant~availability-message',
    'tenant~child-priority',
    'tenant~resourcetype',
    'tenant~validation-text',
    'tenant~citation-count-variant',
    'tenant~variant-product-name',
    'tenant~description-variant',
    'tenant~trial-size-available',
    // Internal/CMS document ID fields (not human-readable values)
    'tenant~image-links',
    'tenant~sds-links',
    'tenant~spec-sheet-links',
    // Redundant / internal display fields
    'tenant~productnameshort',
    'tenant~physical-state-text',
    'tenant~applications', // superseded by applications-variant
  ])

  if (product?.properties) {
    product.properties.forEach((prop: any) => {
      if (excludedAttributes.has(prop?.attributeFQN)) {
        return
      }

      const attributeName = prop?.attributeFQN?.split('~')[1] || prop?.attributeFQN
      const displayName = propertyMap[attributeName] || attributeName

      const propValue = prop?.values?.[0]
      const value =
        typeof propValue === 'object' && propValue !== null && 'stringValue' in propValue
          ? propValue.stringValue
          : typeof propValue === 'string'
          ? propValue
          : undefined

      if (value) {
        additionalProperties.push({
          '@type': 'PropertyValue',
          name: displayName,
          value: HTML_ATTRIBUTES.has(prop?.attributeFQN) ? stripHtml(value) : value,
        })
      }
    })
  }

  return additionalProperties
}

/**
 * Generates Product schema with variants
 */
function generateProductSchema(
  product: Product,
  productVariations: Product[] | undefined,
  baseUrl: string,
  brandSlug: string
): Record<string, any> {
  const { getProductLink } = uiHelpers()
  const productUrl = baseUrl + getProductLink(product.productCode ?? undefined)

  const schema: Record<string, any> = {
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product?.content?.productName || '',
    description:
      product?.content?.productShortDescription || product?.content?.metaTagDescription || '',
    url: productUrl,
    sku: product?.productCode,
    mpn: product?.productCode,
    brand: {
      '@id': `${baseUrl}#brand-${brandSlug}`,
    },
    manufacturer: {
      '@id': `${baseUrl}#organization`,
    },
  }

  // Add additional properties
  const additionalProps = extractAdditionalProperties(product)
  if (additionalProps.length > 0) {
    schema.additionalProperty = additionalProps
  }

  // Add product images — ensure absolute URLs (CDN may return protocol-relative //cdn...)
  const images =
    product?.content?.productImages
      ?.filter((img: any) => img?.imageUrl)
      .map((img: any) => {
        const url: string = img.imageUrl
        return url.startsWith('//') ? `https:${url}` : url
      }) || []

  if (images.length > 0) {
    schema.image = images
  }

  // Required by Google for Product rich results eligibility.
  // No public list price — priceSpecification signals pricing exists without committing to a value.
  schema.offers = {
    '@type': 'Offer',
    url: productUrl,
    availability: 'https://schema.org/InStock',
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'USD',
    },
  }

  // Add variants if available
  if (productVariations && productVariations.length > 0) {
    schema.hasVariant = productVariations.map((variant) => {
      const variantUrl = `${productUrl}?selected=${variant.variationProductCode}`

      return {
        '@type': 'Product',
        '@id': `${variantUrl}#variant`,
        name: `${product?.content?.productName} — ${variant.variationProductCode}`,
        sku: variant.variationProductCode,
        mpn: variant.variationProductCode,
        url: variantUrl,
        brand: {
          '@id': `${baseUrl}#brand-${brandSlug}`,
        },
        manufacturer: {
          '@id': `${baseUrl}#organization`,
        },
        isVariantOf: {
          '@id': `${productUrl}#product`,
        },
      }
    })
  }

  return schema
}

/**
 * Main function to generate all schema markups for a product page in @graph format
 */
export function generateSchemaMarkups(options: SchemaMarkupOptions): string {
  const {
    product,
    breadcrumbs,
    productVariations,
    baseUrl = '',
    organizationConfig,
    brandConfig,
  } = options

  if (!product) return ''

  const { getProductLink } = uiHelpers()
  const productUrl = baseUrl + getProductLink(product.productCode ?? undefined)

  // Extract brand information from product
  const brandProperty = product?.properties?.find((prop: any) =>
    prop?.attributeFQN?.toLowerCase().includes('brand')
  )
  const brandValue = brandProperty?.values?.[0]
  const brandName =
    typeof brandValue === 'object' && brandValue !== null && 'stringValue' in brandValue
      ? brandValue.stringValue
      : typeof brandValue === 'string'
      ? brandValue
      : 'Default Brand'

  // Create brand slug for IDs (lowercase, hyphenated)
  const brandSlug = brandName?.toLowerCase().replace(/\s+/g, '-')

  const graph: Array<Record<string, any>> = []

  // Add Organization schema
  if (organizationConfig) {
    graph.push(generateOrganizationSchema(organizationConfig, baseUrl))
  }

  // Add Brand schema
  if (brandConfig) {
    graph.push(generateBrandSchema(brandConfig, baseUrl, brandSlug as string))
  }

  // Add BreadcrumbList schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    graph.push(generateBreadcrumbSchema(breadcrumbs, baseUrl, productUrl))
  }

  // Add Product schema
  graph.push(generateProductSchema(product, productVariations, baseUrl, brandSlug as string))

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': graph,
  }

  return JSON.stringify(schemaData, null, 2)
}

/**
 * Helper function to render schema markup in a Next.js Head component
 */
export function renderSchemaMarkup(schemaJson: string): JSX.Element {
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: schemaJson },
    key: 'product-schema',
  })
}
