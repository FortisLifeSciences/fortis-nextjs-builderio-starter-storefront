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

import { KiboImage, Price } from '@/components/common'
import resourceTypeArr from '@/components/common/ResourceTypeArr'
import { ProductCardStyles } from '@/components/product/ProductCardListView/ProductCardListView.styles'
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

type Resources = {
  data: any
}

const styles = {
  shortDesc: {
    fontSize: '14px',
    fontWeight: 300,
    fontFamily: 'poppins',
    lineHeight: 'normal',
    color: '#333',
  },
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

const ProductHitListView = ({ hit }: { hit: Resources }): JSX.Element => {
  console.log('hit.data', hit)
  const imageHeight = 180
  const placeholderImageUrl = DefaultImage,
    //   kiboImagesData = hit?.product_images,
    //   variationProductCode = hit?.sku,
    //   productCode = hit?.parent_id,
    title = hit?.data?.title,
    resourceType = hit?.data?.resourceType,
    productDescription = hit?.data?.description,
    resourceCategory = hit?.data?.resourceCategory
  //   variantProductName = hit?.product_name_variant,
  //   sliceValue = hit?.slice_product,
  //   ProductCatalogNumber = hit?.plp_catalog_number,
  //   brandLabel = hit?.brand,
  //   brand = hit?.brand_code,
  //   applications = hit?.applications,
  //   format = hit?.format,
  //   reactivity = hit?.reactivity,
  //   host = hit?.host,
  //   trialSizeAvailable = hit?.trial_size_available,
  //   validated = hit?.validation_text,
  //   formulation = hit?.formulation,
  //   citation = hit?.plp_citation_count,
  //   newProduct = hit.new_product

  // const firstImage = hit?.product_images?.[0]
  //   ? `https://cdn-tp1.mozu.com/31165-m1/cms/files/${kiboImagesData[0]}`
  //   : pdpBrandLogos[brand]

  const truncatedTitle = title && title.length > 30 ? `${title.substring(0, 30)}` : title
  // const uniqueVal = `${
  //   sliceValue
  //     ? variationProductCode
  //     : ProductCatalogNumber !== undefined
  //     ? ProductCatalogNumber
  //     : brandLabel
  // }`
  // truncatedTitle = truncatedTitle + `${uniqueVal}`

  return (
    <>
      <Box
        sx={{ ...ProductCardStyles.main, marginBottom: '20px' }}
        // data-id={hit.plp_catalog_number}
      >
        {/*
          <Link
            href={hit.product_url}
            passHref
            data-testid="product-card-link"
            aria-label={title ? `View details for ${title}` : 'Product details'}
          >
          </Link>
        */}

        <Box>
          <Card sx={ProductCardStyles.cardRoot} data-testid="product-card">
            {/* <Box>
                {newProduct === 'true' && (
                  <Box
                    sx={{ ...ProductCardStyles.listNewTag }}
                    style={{
                      backgroundImage: `url('/NewTag.svg')`,
                    }}
                  />
                )}
              </Box> */}
            {/* Badge start */}
            {/* {badge ? (
                <Box
                  position="absolute"
                  left="0"
                  top="0"
                  width="fit-content"
                  bgcolor={'grey.200'}
                  className="badge"
                  px={2}
                  m={1}
                  textAlign={'center'}
                >
                  <Typography variant="subtitle2" fontWeight={600} color={'text.secondary'}>
                    {badge}
                  </Typography>
                </Box>
              ) : null} */}
            {/* Badge End */}

            <CardMedia
              className="product-image"
              sx={{
                ...ProductCardStyles.cardMedia,
                height: {
                  xs: imageHeight,
                  sm: 'auto',
                },
              }}
            >
              <KiboImage
                src={placeholderImageUrl}
                alt={truncatedTitle || 'no-image-alt'}
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-testid="product-image"
              />
            </CardMedia>
            <Box flexDirection="column" m={1} width="75%" className="product-info">
              <Box display="flex" alignItems="center" width="100%" mb={'20px'}>
                <Typography
                  variant="body2"
                  gutterBottom
                  color="text.primary"
                  fontWeight="500"
                  m={0}
                  mr={'40px'}
                  sx={{ ...ProductCardStyles.productTitle }}
                >
                  {title}
                </Typography>
                {resourceType
                  ? resourceTypeArr.map((data) => {
                      return data.resourceType === resourceType ? (
                        <Box
                          sx={{
                            position: 'absolute',
                            right: '10px',
                            top: '12px',
                            zIndex: 2,
                            width: '42px',
                            height: '42px',
                            color: 'primary.main',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '42px' }}>
                            {data.value}
                          </span>
                        </Box>
                      ) : (
                        ''
                      )
                    })
                  : null}
              </Box>
              <Box
                sx={{
                  ...ProductCardStyles.brandStyle,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  variant="body1"
                  gutterBottom
                  color="text.primary"
                  sx={ProductCardStyles.brandLable}
                >
                  {resourceCategory ? resourceCategory : null}
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  color="text.primary"
                  sx={ProductCardStyles.brandLable}
                >
                  {resourceType ? resourceType : null}
                </Typography>
              </Box>
              <Box>
                <Box
                  sx={styles.shortDesc}
                  data-testid="short-description"
                  dangerouslySetInnerHTML={{
                    __html: productDescription,
                  }}
                />
              </Box>
            </Box>
            <IconButton sx={ProductCardStyles.listIconButton} title={'Product-Detail'}>
              <ArrowForwardIos sx={{ color: 'white' }} />
            </IconButton>
          </Card>
        </Box>
      </Box>
    </>
  )
}

export default ProductHitListView
