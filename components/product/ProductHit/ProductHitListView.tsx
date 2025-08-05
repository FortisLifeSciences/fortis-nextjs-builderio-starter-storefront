import React, { useState, PropsWithChildren, useEffect, useRef, MouseEvent } from 'react'

import { ArrowForwardIos } from '@mui/icons-material'
import {
  Grid,
  MenuItem,
  Box,
  Button,
  Typography,
  Breadcrumbs,
  Stack,
  useMediaQuery,
  Card,
  CardMedia,
  IconButton,
} from '@mui/material'
import Link from 'next/link'
import aa from 'search-insights'

import { KiboImage, Price } from '@/components/common'
import { ProductCardStyles } from '@/components/product/ProductCardListView/ProductCardListView.styles'
import { getAnalyticsConsentFromLocalStorage } from '@/lib/getAnalyticsConsent'
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

const plpIconStyles = {
  flexDirectionRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  plpIconCss: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '10px',
    justifyContent: 'center',
  },
  plpIconText: {
    display: 'inline-block',
    textAlign: 'center',
    color: 'primary.main',
    fontFamily: 'Poppins',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '22px',
  },
}

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
  applications: any
  product_name_variant: any
  brand: any
  slice_product: any
  parent_id: any
  product_images: any
  brand_code: any
  new_product: string
  plp_catalog_number: any
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

type ProductHitListViewProps = {
  hit: Product
  algoliaIndex?: string
  position?: number
  dataInsideMethod?: string
  queryId?: string
}

const ProductHitListView = ({
  hit,
  position,
  algoliaIndex,
  queryId,
  dataInsideMethod,
}: ProductHitListViewProps): JSX.Element => {
  const imageHeight = 180
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
    format = hit?.format,
    reactivity = hit?.reactivity,
    host = hit?.host,
    trialSizeAvailable = hit?.trial_size_available,
    validated = hit?.validation_text,
    formulation = hit?.formulation,
    citation = hit?.plp_citation_count,
    newProduct = hit.new_product
  position = hit.__position

  const firstImage = hit?.product_images?.[0]
    ? `https://cdn-tp1.mozu.com/31165-m1/cms/files/${kiboImagesData[0]}`
    : pdpBrandLogos[brand]

  let truncatedTitle = title && title.length > 30 ? `${title.substring(0, 30)}` : title
  const uniqueVal = `${
    sliceValue
      ? variationProductCode
      : ProductCatalogNumber !== undefined
      ? ProductCatalogNumber
      : brandLabel
  }`
  truncatedTitle = truncatedTitle + `${uniqueVal}`

  return (
    <>
      <Box
        sx={{ ...ProductCardStyles.main, marginBottom: '20px' }}
        data-id={hit.plp_catalog_number}
        className="product-card"
        data-index={algoliaIndex || 'products'} // <-- Add index as a data attribute if needed
      >
        <Link
          href={hit.product_url}
          passHref
          data-testid="product-card-link"
          aria-label={title ? `View details for ${title}` : 'Product details'}
          data-insights-object-id={hit.objectID}
          data-insights-position={position !== undefined ? position : '1'}
          data-insights-query-id={queryId || hit.__queryID}
          data-insights-index={algoliaIndex || 'products'}
          data-insights-method={dataInsideMethod || 'clickedObjectIDs'}
          className="product-card"
        >
          <Box>
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
                  height: {
                    xs: imageHeight,
                    // sm: 'auto',
                  },
                }}
              >
                <KiboImage
                  src={firstImage || placeholderImageUrl}
                  alt={truncatedTitle || 'no-image-alt'}
                  objectFit={firstImage ? 'contain' : 'none'}
                  data-testid="product-image"
                />
              </CardMedia>
              <Box flexDirection="column" m={1} width="75%" className="product-info">
                <Box display="flex" alignItems="start" width="100%">
                  <Typography
                    variant="body2"
                    gutterBottom
                    fontWeight={500}
                    sx={{ ...ProductCardStyles.productTitle }}
                    tabIndex={0}
                  >
                    {sliceValue ? variantProductName : title}
                  </Typography>
                  {typeof brand === 'string' && brandImages[brand.toLowerCase()] && (
                    <Box sx={ProductCardStyles.brandLogoContainer}>
                      <Box
                        component="img"
                        src={brandImages[brand.toLowerCase()]}
                        alt={`${brand}-logo`}
                        sx={ProductCardStyles.brandLogoImage}
                        data-testid="brand-logo"
                      />
                    </Box>
                  )}
                </Box>
                <Box sx={ProductCardStyles.brandStyle}>
                  <Typography gutterBottom color="text.primary" sx={ProductCardStyles.brandLable}>
                    {brandLabel}
                  </Typography>
                  {(sliceValue ? variationProductCode : ProductCatalogNumber) && (
                    <Typography color="text.primary" sx={ProductCardStyles.catalogNum}>
                      {`Catalog # ${sliceValue ? variationProductCode : ProductCatalogNumber}`}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Grid container spacing={2} sx={{ marginBottom: '10px' }}>
                    {validated ? (
                      <Grid item md={3} sm={3} tabIndex={0}>
                        <Box sx={plpIconStyles.flexDirectionRow}>
                          <Box sx={plpIconStyles.plpIconCss}>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '16px', color: '#348345' }}
                            >
                              verified
                            </span>
                          </Box>
                          <Box sx={{ ...plpIconStyles.plpIconText, color: '#348345' }}>
                            Validated
                          </Box>
                        </Box>
                      </Grid>
                    ) : null}
                    {trialSizeAvailable ? (
                      <Grid item md={3} sm={3} tabIndex={0}>
                        <Box sx={plpIconStyles.flexDirectionRow}>
                          <Box sx={plpIconStyles.flexDirectionRow}>
                            <Box sx={plpIconStyles.plpIconCss}>
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '16px', color: '#1468C8' }}
                              >
                                labs
                              </span>
                            </Box>
                            <Box sx={{ ...plpIconStyles.plpIconText, color: '#1468C8' }}>
                              Trial Size Available
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ) : null}
                    {formulation ? (
                      <Grid item md={3} sm={3} tabIndex={0}>
                        <Box sx={plpIconStyles.flexDirectionRow}>
                          <Box sx={plpIconStyles.flexDirectionRow}>
                            <Box sx={plpIconStyles.plpIconCss}>
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '16px', color: '#9E6C00' }}
                              >
                                block
                              </span>
                            </Box>
                            <Box sx={{ ...plpIconStyles.plpIconText, color: '#9E6C00' }}>
                              {formulation}
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ) : null}
                    {citation ? (
                      <Grid item md={3} sm={3}>
                        <Box sx={plpIconStyles.flexDirectionRow}>
                          <Box sx={plpIconStyles.plpIconCss}>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '16px', color: 'primary.main' }}
                            >
                              note_stack
                            </span>
                          </Box>
                          <Box sx={{ ...plpIconStyles.plpIconText, color: 'primary.main' }}>
                            Citations ({citation})
                          </Box>
                        </Box>
                      </Grid>
                    ) : null}
                  </Grid>
                </Box>
                <Box>
                  {reactivity ? (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          fontSize: '14px',
                          fontFamily: 'Poppins',
                          color: '#333',
                          fontStyle: 'normal',
                          fontWeight: '500',
                          lineHeight: '22px',
                          width: '25%',
                          wordWrap: 'break-word',
                          textAlign: 'left',
                        }}
                      >
                        Reactivity:
                      </Box>
                      <Box
                        sx={{
                          fontSize: '14px',
                          fontFamily: 'Poppins',
                          color: '#333',
                          fontStyle: 'normal',
                          fontWeight: '400',
                          lineHeight: '22px',
                          width: 'calc(75% - 50px)',
                          wordWrap: 'break-word',
                          textAlign: 'left',
                        }}
                      >
                        {reactivity.join(', ')}
                      </Box>
                    </Box>
                  ) : null}
                  {applications ? (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          fontSize: '14px',
                          fontFamily: 'Poppins',
                          color: '#333',
                          fontStyle: 'normal',
                          fontWeight: '500',
                          lineHeight: '22px',
                          width: '25%',
                          wordWrap: 'break-word',
                          textAlign: 'left',
                        }}
                      >
                        Applications:
                      </Box>
                      <Box
                        sx={{
                          fontSize: '14px',
                          fontFamily: 'Poppins',
                          color: '#333',
                          fontStyle: 'normal',
                          fontWeight: '400',
                          lineHeight: '22px',
                          width: 'calc(75% - 50px)',
                          wordWrap: 'break-word',
                          textAlign: 'left',
                        }}
                      >
                        {applications.join(', ')}
                      </Box>
                    </Box>
                  ) : null}
                  {format ? (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          fontSize: '14px',
                          fontFamily: 'Poppins',
                          color: '#333',
                          fontStyle: 'normal',
                          fontWeight: '500',
                          lineHeight: '22px',
                          width: '25%',
                          wordWrap: 'break-word',
                          textAlign: 'left',
                        }}
                      >
                        Format:
                      </Box>
                      <Box
                        sx={{
                          fontSize: '14px',
                          fontFamily: 'Poppins',
                          color: '#333',
                          fontStyle: 'normal',
                          fontWeight: '400',
                          lineHeight: '22px',
                          width: 'calc(75% - 50px)',
                          wordWrap: 'break-word',
                          textAlign: 'left',
                        }}
                      >
                        {format}
                      </Box>
                    </Box>
                  ) : null}
                  {host ? (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          fontSize: '14px',
                          fontFamily: 'Poppins',
                          color: '#333',
                          fontStyle: 'normal',
                          fontWeight: '500',
                          lineHeight: '22px',
                          width: '25%',
                          wordWrap: 'break-word',
                          textAlign: 'left',
                        }}
                      >
                        Host:
                      </Box>
                      <Box
                        sx={{
                          fontSize: '14px',
                          fontFamily: 'Poppins',
                          color: '#333',
                          fontStyle: 'normal',
                          fontWeight: '400',
                          lineHeight: '22px',
                          width: 'calc(75% - 50px)',
                          wordWrap: 'break-word',
                          textAlign: 'left',
                        }}
                      >
                        {host}
                      </Box>
                    </Box>
                  ) : null}
                </Box>
              </Box>
              <IconButton
                component="span"
                sx={{ ...ProductCardStyles.listIconButton }}
                title="View product details"
                aria-label="View product details"
              >
                <ArrowForwardIos sx={{ color: 'white' }} />
              </IconButton>
            </Card>
          </Box>
        </Link>
      </Box>
    </>
  )
}

export default ProductHitListView
