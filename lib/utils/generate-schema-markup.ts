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

/**
 * Extract additional properties from product
 */
function extractAdditionalProperties(product: Product): Array<Record<string, any>> {
  const additionalProperties: Array<Record<string, any>> = []

  // Map of common property names to display names
  const propertyMap: Record<string, string> = {
    target: 'Target',
    specificity: 'Specificity',
    'host-species': 'Host Species',
    clonality: 'Clonality',
    clone: 'Clone',
    isotype: 'Isotype',
    applications: 'Applications',
    format: 'Format',
    conjugate: 'Conjugate',
    purification: 'Purification',
    buffer: 'Buffer',
    'storage-conditions': 'Storage Conditions',
    immunogen: 'Immunogen',
    'physical-state': 'Physical State',
  }

  if (product?.properties) {
    product.properties.forEach((prop: any) => {
      // Skip brand and related-products as they're handled separately
      if (
        prop?.attributeFQN?.includes('brand') ||
        prop?.attributeFQN?.includes('related-products')
      ) {
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
          value: value,
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

  // Add product images
  const images =
    product?.content?.productImages
      ?.filter((img: any) => img?.imageUrl)
      .map((img: any) => img.imageUrl) || []

  if (images.length > 0) {
    schema.image = images
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
