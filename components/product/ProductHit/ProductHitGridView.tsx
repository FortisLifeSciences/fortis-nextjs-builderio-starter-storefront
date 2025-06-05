import React, { useState, PropsWithChildren, useEffect, useRef, MouseEvent } from 'react'

import { ArrowForwardIos } from '@mui/icons-material'
import Add from '@mui/icons-material/Add'
import Apps from '@mui/icons-material/Apps'
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRounded from '@mui/icons-material/FavoriteRounded'
import ReorderRounded from '@mui/icons-material/ReorderRounded'
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
import getConfig from 'next/config'
import Link from 'next/link'
import router, { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { KiboImage, Price } from '@/components/common'
import { PLPStyles } from '@/components/page-templates/ProductListingTemplate/ProductListingTemplate.styles'
import { ProductCardStyles } from '@/components/product/ProductCard/ProductCard.styles'
import { useAuthContext } from '@/context/AuthContext'
import { plpClick } from '@/lib/utils/google-tag-manager'
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

const ProductHitGridView = ({ hit }: { hit: Product }): JSX.Element => {
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
    newProduct = hit.new_product

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

  return (
    <>
      <Box sx={ProductCardStyles.main} data-id={hit.plp_catalog_number}>
        <Link
          href={hit.product_url}
          passHref
          data-testid="product-card-link"
          aria-label={title ? `View details for ${title}` : 'Product details'}
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
              <Box flexDirection="column" m={1} className="product-info">
                <Typography
                  variant="body1"
                  gutterBottom
                  color="text.primary"
                  sx={ProductCardStyles.brandLabel}
                >
                  {brandLabel}
                </Typography>
                <Typography
                  variant="body2"
                  gutterBottom
                  fontWeight={500}
                  className="productNameStyle"
                  sx={{ ...ProductCardStyles.productNameStyle, marginBottom: '25px' }}
                  tabIndex={0}
                >
                  {sliceValue ? variantProductName : title}
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  color="text.primary"
                  sx={ProductCardStyles.brandLabel}
                >
                  {uniqueVal}
                </Typography>
              </Box>
              <IconButton
                component="span"
                sx={{ ...ProductCardStyles.iconButton }}
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

export default ProductHitGridView
