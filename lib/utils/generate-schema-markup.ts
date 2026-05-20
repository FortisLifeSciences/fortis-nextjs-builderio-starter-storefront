import React from 'react'

import { BreadCrumb } from '../types'
import { uiHelpers } from '@/lib/helpers'

import type { FilteredProduct, Product } from '@/lib/gql/types'

interface SchemaMarkupOptions {
  product: Product
  breadcrumbs?: BreadCrumb[]
  productVariations?: FilteredProduct[]
  baseUrl?: string
  organizationConfig?: OrganizationConfig
  websiteConfig?: WebSiteConfig
  brandConfig?: BrandConfig
}

interface OrganizationConfig {
  id?: string // custom @id, e.g. "https://fortislife.com/#organization"
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

interface WebSiteConfig {
  name: string
  url: string
}

interface BrandConfig {
  id?: string // custom @id, e.g. "https://www.fortislife.com/#brand-bethyl-laboratories"
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
  const organizationId = config.id || `${baseUrl}/#organization`

  const schema: Record<string, any> = {
    '@type': 'Organization',
    '@id': organizationId,
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
 * Generates WebSite schema
 */
function generateWebSiteSchema(config: WebSiteConfig, organizationId: string): Record<string, any> {
  return {
    '@type': 'WebSite',
    '@id': `${config.url.replace(/\/$/, '')}/#website`,
    name: config.name,
    url: config.url,
    publisher: {
      '@id': organizationId,
    },
  }
}

/**
 * Generates Brand schema
 */
function generateBrandSchema(
  config: BrandConfig,
  baseUrl: string,
  brandSlug: string,
  organizationId: string
): Record<string, any> {
  const schema: Record<string, any> = {
    '@type': 'Brand',
    '@id': config.id || `${baseUrl}/#brand-${brandSlug}`,
    name: config.name,
  }

  if (config.slogan) {
    schema.slogan = config.slogan
  }

  schema.logo = config.logo

  if (config.sameAs && config.sameAs.length > 0) {
    schema.sameAs = config.sameAs
  }

  schema.owner = { '@id': organizationId }

  return schema
}

/**
 * Generates WebPage schema
 */
function generateWebPageSchema(
  productUrl: string,
  productName: string,
  websiteId: string
): Record<string, any> {
  return {
    '@type': 'WebPage',
    '@id': `${productUrl}#webpage`,
    url: productUrl,
    name: productName,
    isPartOf: {
      '@id': websiteId,
    },
    breadcrumb: {
      '@id': `${productUrl}#breadcrumb`,
    },
    mainEntity: {
      '@id': `${productUrl}#product`,
    },
  }
}

/**
 * Generates BreadcrumbList schema
 */
function generateBreadcrumbSchema(
  breadcrumbs: BreadCrumb[],
  baseUrl: string,
  productUrl: string,
  productName: string
): Record<string, any> {
  // Check if the last breadcrumb already points to the product page
  const lastCrumb = breadcrumbs[breadcrumbs.length - 1]
  const lastCrumbUrl = lastCrumb?.link ? baseUrl + lastCrumb.link : ''
  const productAlreadyPresent = lastCrumbUrl === productUrl

  const allCrumbs = productAlreadyPresent
    ? breadcrumbs
    : [...breadcrumbs, { text: productName, link: productUrl.replace(baseUrl, '') }]

  return {
    '@type': 'BreadcrumbList',
    '@id': `${productUrl}#breadcrumb`,
    itemListElement: allCrumbs.map((crumb, index) => {
      const item: Record<string, any> = {
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.text,
      }

      if (crumb.link) {
        item.item = crumb.link.startsWith('http') ? crumb.link : baseUrl + crumb.link
      }

      return item
    }),
  }
}

function toSchemaAvailability(inventoryInfo?: {
  onlineStockAvailable?: number | null
  outOfStockBehavior?: string | null
}): string {
  if (!inventoryInfo) return 'https://schema.org/InStock'
  if ((inventoryInfo.onlineStockAvailable ?? 0) > 0) return 'https://schema.org/InStock'
  if (inventoryInfo.outOfStockBehavior === 'AllowBackOrder') return 'https://schema.org/BackOrder'
  return 'https://schema.org/OutOfStock'
}

function generateOfferSchema(
  offerName: string,
  sku: string,
  url: string,
  price: number | null | undefined,
  inventoryInfo:
    | { onlineStockAvailable?: number | null; outOfStockBehavior?: string | null }
    | undefined,
  organizationId: string
): Record<string, any> {
  const offer: Record<string, any> = { '@type': 'Offer' }

  if (offerName) offer.name = offerName
  offer.sku = sku
  offer.mpn = sku
  offer.url = url
  offer.priceCurrency = 'USD'
  if (price != null) offer.price = price.toFixed(2)
  offer.availability = toSchemaAvailability(inventoryInfo)
  offer.itemCondition = 'https://schema.org/NewCondition'
  offer.seller = { '@id': organizationId }
  offer.eligibleRegion = [{ '@type': 'Country', name: 'US' }]

  return offer
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
    'product-type': 'Product Type',
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

      // Only include attributes explicitly listed in the propertyMap (whitelist)
      if (!propertyMap[attributeName]) {
        return
      }

      const displayName = propertyMap[attributeName]

      const propValue = prop?.values?.[0]
      let value: string | undefined =
        typeof propValue === 'object' && propValue !== null && 'stringValue' in propValue
          ? propValue.stringValue
          : typeof propValue === 'string'
          ? propValue
          : undefined

      if (!value) return

      // Strip HTML for known HTML attributes
      if (HTML_ATTRIBUTES.has(prop?.attributeFQN)) {
        value = stripHtml(value)
      }

      // If the value is a JSON array string (e.g. Dilution Range), flatten to readable text
      if (value.trimStart().startsWith('[')) {
        try {
          const parsed = JSON.parse(value)
          if (Array.isArray(parsed)) {
            value = parsed
              .map((entry: Record<string, string>) =>
                Object.entries(entry)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ')
              )
              .join('; ')
          }
        } catch {
          // leave value as-is if parsing fails
        }
      }

      // Skip blank or obviously invalid values
      if (!value || value === '0') return

      additionalProperties.push({
        '@type': 'PropertyValue',
        name: displayName,
        value,
      })
    })
  }

  return additionalProperties
}

/**
 * Generates Product schema with variants and offers
 */
function generateProductSchema(
  product: Product,
  productVariations: FilteredProduct[] | undefined,
  baseUrl: string,
  brandId: string,
  organizationId: string
): Record<string, any> {
  const { getProductSeoLink } = uiHelpers()
  const productUrl = baseUrl + getProductSeoLink(product)

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
      '@id': brandId,
    },
    manufacturer: {
      '@id': organizationId,
    },
    mainEntityOfPage: {
      '@id': `${productUrl}#webpage`,
    },
  }

  // Add product images — ensure absolute URLs (CDN may return protocol-relative //cdn...)
  schema.image =
    product?.content?.productImages
      ?.filter((img: any) => img?.imageUrl)
      .map((img: any) => {
        const url: string = img.imageUrl
        return url.startsWith('//') ? `https:${url}` : url
      }) || []

  // Build offers — one per sellable variation
  const offers: Array<Record<string, any>> = []

  if (productVariations && productVariations.length > 0) {
    for (const variant of productVariations) {
      const variantCode = (variant as any).variationProductCode
      if (!variantCode) continue

      const variantLabel: string =
        ((variant as any).option as any[])?.find((v: any) => v.isSelected !== false)?.stringValue ??
        ''

      offers.push(
        generateOfferSchema(
          variantLabel,
          variantCode,
          `${productUrl}?selected=${variantCode}`,
          (variant as any).price?.price,
          (variant as any).inventoryInfo,
          organizationId
        )
      )
    }
  }

  if (offers.length > 0) {
    schema.offers = offers
  }

  // Add variants as isSimilarTo — only include variants that have their own canonical
  // SEO URL (not a ?selected= query-param URL and not identical to the current page URL).
  if (productVariations && productVariations.length > 0) {
    const similarProducts = productVariations.reduce<Array<Record<string, any>>>((acc, variant) => {
      const variantSeoPath = getProductSeoLink(variant as any)
      // Skip variants that resolve to a ?selected= URL or have no distinct path
      if (!variantSeoPath || variantSeoPath.includes('?selected=')) return acc

      const variantUrl = baseUrl + variantSeoPath
      // Skip if the variant URL is the same as the current product page
      if (variantUrl === productUrl) return acc

      const variantCode = variant?.variationProductCode
      const variantName = (variant as any)?.content?.productName || ''

      // Skip if there's no meaningful name, SKU, or the URL doesn't include a product code
      // (guards against variants that resolved to a bare /products/ base path)
      if (!variantName || !variantCode || !variantUrl.includes(variantCode)) return acc

      acc.push({
        '@type': 'Product',
        name: variantName,
        url: variantUrl,
        sku: variantCode,
        mpn: variantCode,
      })
      return acc
    }, [])

    if (similarProducts.length > 0) {
      schema.isSimilarTo = similarProducts
    }
  }

  const additionalProps = extractAdditionalProperties(product)
  if (additionalProps.length > 0) {
    schema.additionalProperty = additionalProps
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
    websiteConfig,
    brandConfig,
  } = options

  if (!product) return ''

  const { getProductSeoLink } = uiHelpers()
  const productUrl = baseUrl + getProductSeoLink(product)

  // Resolve stable @ids used as cross-references throughout the graph
  const organizationId = organizationConfig?.id || `${baseUrl}/#organization`

  // Extract brand slug from product properties as fallback for @id
  const brandProperty = product?.properties?.find(
    (prop: any) => prop?.attributeFQN?.toLowerCase() === 'tenant~brand'
  )
  const brandValue = brandProperty?.values?.[0]
  const brandName =
    typeof brandValue === 'object' && brandValue !== null && 'stringValue' in brandValue
      ? brandValue.stringValue
      : typeof brandValue === 'string'
      ? brandValue
      : 'default'
  const brandSlug = brandName?.toLowerCase().replace(/\s+/g, '-') ?? 'default'
  const brandId = brandConfig?.id || `${baseUrl}/#brand-${brandSlug}`

  const graph: Array<Record<string, any>> = []

  // 1. Organization
  if (organizationConfig) {
    graph.push(generateOrganizationSchema(organizationConfig, baseUrl))
  }

  // 2. WebSite
  if (websiteConfig) {
    graph.push(generateWebSiteSchema(websiteConfig, organizationId))
  }

  // 3. Brand
  if (brandConfig) {
    graph.push(generateBrandSchema(brandConfig, baseUrl, brandSlug, organizationId))
  }

  // 4. BreadcrumbList
  if (breadcrumbs && breadcrumbs.length > 0) {
    graph.push(
      generateBreadcrumbSchema(
        breadcrumbs,
        baseUrl,
        productUrl,
        product?.content?.productName || ''
      )
    )
  }

  // 5. WebPage
  const websiteId = websiteConfig
    ? `${websiteConfig.url.replace(/\/$/, '')}/#website`
    : `${baseUrl}/#website`
  graph.push(generateWebPageSchema(productUrl, product?.content?.productName || '', websiteId))

  // 6. Product
  graph.push(generateProductSchema(product, productVariations, baseUrl, brandId, organizationId))

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
