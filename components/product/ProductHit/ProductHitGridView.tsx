import React from 'react'

import { ArrowForwardIos } from '@mui/icons-material'
import { Box, Button, Typography, Card, CardMedia } from '@mui/material'
import Link from 'next/link'

import { KiboImage } from '@/components/common'
import { ProductHitGridViewStyles as ProductCardStyles } from '@/components/product/ProductHit/ProductHitGridView.styles'
import abcore from '@/public/Brand_Logo/abcore-logo.png'
import arista from '@/public/Brand_Logo/arista-logo.png'
import bethyl from '@/public/Brand_Logo/bethyl-logo.png'
import empirical from '@/public/Brand_Logo/empirical-logo.png'
import fortis from '@/public/Brand_Logo/fortis-logo.png'
import ipoc from '@/public/Brand_Logo/ipoc-logo.png'
import nanocomposix from '@/public/Brand_Logo/nanocomposix-logo.png'
import vector from '@/public/Brand_Logo/vector-logo.png'
import abcoreLogo from '@/public/BrandLogos/abcore_logo.png'
import aristaLogo from '@/public/BrandLogos/arista_logo.png'
import bethylLogo from '@/public/BrandLogos/bethyl_logo.png'
import empiricalLogo from '@/public/BrandLogos/empirical_logo.png'
import nanocomposixLogo from '@/public/BrandLogos/nanocomposix_logo.png'
import vectorLogo from '@/public/BrandLogos/vector_logo.png'
import DefaultImage from '@/public/noImage.png'

type Product = {
  __position: any
  __queryID: any
  formulation: any
  plp_citation_count: any
  validation_text: any
  trial_size_available: any
  format: any
  reactivity: any
  host: any
  conjugate: any
  applications: any
  product_name_variant: any
  brand: any
  slice_product: any
  parent_id: string
  product_images: any
  brand_code: string
  new_product: string
  plp_catalog_number: string
  product_url: string
  objectID: string
  product_name: string
  sku: string
}

const brandImages: Record<string, string> = {
  arista: arista.src,
  bethyl: bethyl.src,
  abcore: abcore.src,
  empirical: empirical.src,
  nanocomposix: nanocomposix.src,
  vector: vector.src,
  ipoc: ipoc.src,
  fortis: fortis.src,
}

const pdpBrandLogos: Record<string, string> = {
  arista: aristaLogo.src,
  bethyl: bethylLogo.src,
  abcore: abcoreLogo.src,
  empirical: empiricalLogo.src,
  nanocomposix: nanocomposixLogo.src,
  vector: vectorLogo.src,
  ipoc: ipoc.src,
  fortis: fortis.src,
}

type ProductHitGridViewProps = {
  hit: Product
  algoliaIndex?: string
  position?: number
  dataInsideMethod?: string
  queryId?: string
}

const ProductHitGridView = ({
  hit,
  position,
  algoliaIndex,
  queryId,
  dataInsideMethod,
}: ProductHitGridViewProps): JSX.Element => {
  const imageHeight = 247.5
  const placeholderImageUrl = DefaultImage,
    kiboImagesData = hit?.product_images,
    variationProductCode = hit?.sku,
    productCode = hit?.parent_id,
    title = hit?.product_name,
    variantProductName = hit?.product_name_variant,
    sliceValue = hit?.slice_product,
    ProductCatalogNumber = hit?.plp_catalog_number,
    brandLabel = hit?.brand,
    brand = hit?.brand_code,
    applications = hit?.applications,
    host = hit?.host,
    conjugate = hit?.conjugate,
    trialSizeAvailable = hit?.trial_size_available,
    validated = hit?.validation_text,
    formulation = hit?.formulation,
    citation = hit?.plp_citation_count,
    newProduct = hit.new_product
  position = position ?? hit.__position

  const tags = [
    Array.isArray(applications) ? applications.join(', ') : applications,
    host,
    conjugate,
  ].filter(Boolean)

  const firstImage = hit?.product_images?.[0]
    ? `https://cdn-tp1.mozu.com/31165-m1/cms/files/${kiboImagesData[0]}`
    : pdpBrandLogos[brand.toLowerCase()]

  let truncatedTitle = title && title.length > 30 ? `${title.substring(0, 30)}` : title
  const uniqueVal = `${
    sliceValue
      ? variationProductCode
      : ProductCatalogNumber !== undefined
      ? ProductCatalogNumber
      : brandLabel
  }`
  truncatedTitle = truncatedTitle + `${uniqueVal}`

  // Ensure Next.js <Link> gets a relative path — absolute URLs trigger a full page reload
  const productHref = (() => {
    const formatProductUrl = hit?.product_url.includes('libraries')
      ? hit?.product_url.toLowerCase()
      : hit?.product_url
    const url = formatProductUrl || '#'
    if (!url.startsWith('http')) return url
    try {
      return new URL(url).pathname + new URL(url).search + new URL(url).hash
    } catch {
      return url
    }
  })()

  return (
    <>
      <Box
        sx={ProductCardStyles.main}
        data-id={hit.plp_catalog_number}
        className="product-card"
        data-index={algoliaIndex || 'products'}
      >
        <Link
          href={`/product/${productCode}`}
          as={productHref}
          passHref
          data-testid="product-card-link"
          aria-label={title ? `View details for ${title}` : 'Product details'}
          data-insights-object-id={hit.objectID}
          data-insights-position={position !== undefined ? position : '1'}
          data-insights-query-id={queryId || hit.__queryID}
          data-insights-index={algoliaIndex || 'products'}
          data-insights-method={
            dataInsideMethod ||
            (queryId || hit.__queryID ? 'clickedObjectIDsAfterSearch' : 'clickedObjectIDs')
          }
          className={
            dataInsideMethod === 'clickedObjectIDsAfterSearch'
              ? 'product-card-search'
              : 'product-card'
          }
        >
          <Box sx={{ height: '100%' }}>
            <Card sx={ProductCardStyles.cardRoot} data-testid="product-card">
              <Box>
                {newProduct ? (
                  <Box
                    sx={{
                      width: 80,
                      height: 41,
                      top: '0px',
                      position: 'absolute',
                      left: '0px',
                      zIndex: 2,
                    }}
                    style={{
                      backgroundImage: `url('/NewTag.svg')`,
                    }}
                  />
                ) : null}
              </Box>
              <CardMedia
                className="product-image"
                sx={{
                  ...ProductCardStyles.cardMedia,
                  height: imageHeight,
                }}
              >
                <KiboImage
                  src={firstImage || placeholderImageUrl}
                  alt={truncatedTitle || 'no-image-alt'}
                  objectFit={firstImage ? 'contain' : 'none'}
                  data-testid="product-image"
                />
              </CardMedia>
              <Box sx={ProductCardStyles.cardContent} className="product-info">
                {brandLabel && (
                  <Typography component="span" sx={ProductCardStyles.brandLabel}>
                    {brandLabel}
                  </Typography>
                )}
                <Typography
                  component="p"
                  className="productNameStyle"
                  sx={{ ...ProductCardStyles.productNameStyle, marginTop: '4px' }}
                  tabIndex={0}
                >
                  {sliceValue ? variantProductName : title}
                </Typography>
                {(sliceValue ? variationProductCode : ProductCatalogNumber) && (
                  <Typography component="span" sx={ProductCardStyles.catalogNum}>
                    {sliceValue ? variationProductCode : ProductCatalogNumber}
                  </Typography>
                )}
                {tags.length > 0 && (
                  <Box sx={ProductCardStyles.tagsRow}>
                    {tags.map((tag, idx) => (
                      <Box key={idx} component="span" sx={ProductCardStyles.tagPill}>
                        {tag}
                      </Box>
                    ))}
                  </Box>
                )}
                {(validated || trialSizeAvailable || citation || formulation) && (
                  <Box sx={ProductCardStyles.badgeRow}>
                    {validated && (
                      <Box sx={ProductCardStyles.badgeItem}>
                        <Typography
                          component="span"
                          sx={{ ...ProductCardStyles.badgeText, color: '#348345' }}
                        >
                          Validated
                        </Typography>
                      </Box>
                    )}
                    {trialSizeAvailable && (
                      <Box sx={ProductCardStyles.badgeItem}>
                        <Typography
                          component="span"
                          sx={{ ...ProductCardStyles.badgeText, color: '#1468C8' }}
                        >
                          Trial Size Available
                        </Typography>
                      </Box>
                    )}
                    {formulation && (
                      <Box sx={ProductCardStyles.badgeItem}>
                        <Typography
                          component="span"
                          sx={{ ...ProductCardStyles.badgeText, color: '#9E6C00' }}
                        >
                          {formulation}
                        </Typography>
                      </Box>
                    )}
                    {citation && (
                      <Box sx={ProductCardStyles.badgeItem}>
                        <Typography
                          component="span"
                          sx={{ ...ProductCardStyles.badgeText, color: '#30299A' }}
                        >
                          Citations ({citation})
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                <Box sx={ProductCardStyles.ctaButton}>
                  <Button
                    component="span"
                    endIcon={<ArrowForwardIos sx={{ fontSize: '12px !important' }} />}
                    title="View product details"
                    aria-label="View product details"
                  >
                    View Details
                  </Button>
                </Box>
              </Box>
            </Card>
          </Box>
        </Link>
      </Box>
    </>
  )
}

export default ProductHitGridView
