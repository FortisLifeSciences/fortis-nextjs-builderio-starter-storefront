import React, { MouseEvent } from 'react'

import { ArrowForwardIos } from '@mui/icons-material'
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRounded from '@mui/icons-material/FavoriteRounded'
import StarRounded from '@mui/icons-material/StarRounded'
import {
  Card,
  Typography,
  Rating,
  CardMedia,
  Box,
  Stack,
  Skeleton,
  Button,
  IconButton,
} from '@mui/material'
import { data } from 'cheerio/dist/commonjs/api/attributes'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { ProductCardStyles } from '../ProductCard/ProductCard.styles'
import { KiboImage, Price } from '@/components/common'
import resourceTypeArr from '@/components/common/ResourceTypeArr'
import { usePriceRangeFormatter } from '@/hooks'
import { FulfillmentOptions as FulfillmentOptionsConstant } from '@/lib/constants'
import { ProductProperties } from '@/lib/types'
import abcore from '@/public/Brand_Logo/abcore-logo.png'
import arista from '@/public/Brand_Logo/arista-logo.png'
import bethyl from '@/public/Brand_Logo/bethyl-logo.png'
import empirical from '@/public/Brand_Logo/empirical-logo.png'
import fortis from '@/public/Brand_Logo/fortis-logo.png'
import ipoc from '@/public/Brand_Logo/ipoc-logo.png'
import nanocomposix from '@/public/Brand_Logo/nanocomposix-logo.png'
import vector from '@/public/Brand_Logo/vector-logo.png'
import DefaultImage from '@/public/noImage.png'
import DefaultImage1 from '@/public/product_placeholder.svg'

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
type Resources = {
  objectID: any
  __position: any
  query: any
  data: any
}

const ResourceHitGridView = ({ hit }: { hit: Resources }): JSX.Element => {
  const imageHeight = 180,
    placeholderImageUrl = DefaultImage,
    title = hit?.data?.title,
    resourceType = hit?.data?.resourceType,
    productDescription = hit?.data?.description,
    resourceCategory = hit?.data?.resourceCategory,
    truncatedTitle = title && title.length > 30 ? `${title.substring(0, 30)}` : title,
    resourceImage = hit?.data?.image ? hit?.data?.image : placeholderImageUrl

  return (
    <>
      <Box sx={ProductCardStyles.main}>
        <Link
          href={hit?.query[0]?.value}
          passHref
          data-testid="product-card-link"
          aria-label={title ? `View details for ${title}` : 'Product details'}
          data-insights-object-id={hit.objectID}
          data-insis-position={hit.__position}
          data-insights-index={'builder-page'}
          data-insights-method={'clickedObjectIDs'}
          className="resource-card"
        >
          <Box>
            <Box>
              <Card
                sx={{
                  position: 'relative',
                  padding: '0.625rem',
                  backgroundColor: 'secondary.light',
                  textDecoration: 'none',
                  width: 260,
                  maxWidth: 260,
                  // height: 345,
                  boxShadow: 'none',
                  cursor: 'pointer',
                  borderRadius: '0px 0px 25px 0px',
                  border: '1px solid #E3E2FF',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  // '&:hover .quick-actions': {
                  //   opacity: 1,
                  // },
                  '&:hover': {
                    boxShadow: '0 2px 16px 4px rgb(11 32 61 / 7%)',
                    borderColor: 'primary.light',
                    // '.quick-view': {
                    //   opacity: 1,
                    // },
                  },
                  '&:hover .MuiIconButton-root': {
                    opacity: 1,
                  },
                  '&:hover .productNameStyle': {
                    color: 'grey.900',
                  },
                }}
                className="resourceCardGrid"
                data-testid="product-card"
              >
                {resourceType &&
                  resourceTypeArr.map((data) => {
                    return data.resourceType === resourceType ? (
                      <Box
                        sx={{
                          ...ProductCardStyles.resourceIcon,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                          {data.value}
                        </span>
                      </Box>
                    ) : (
                      ''
                    )
                  })}

                {/* <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} pb={1}>
              </Box> */}
                <CardMedia
                  className="product-image"
                  sx={{
                    ...ProductCardStyles.cardMedia,
                    height: imageHeight,
                    zIndex: 1,
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <KiboImage
                    src={resourceImage}
                    alt={truncatedTitle || 'no-image-alt'}
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-testid="product-image"
                  />
                </CardMedia>
                <Box flexDirection="column" m={1}>
                  <Typography
                    variant="body2"
                    gutterBottom
                    color="text.primary"
                    sx={ProductCardStyles.brandLabel}
                  >
                    {resourceCategory ? resourceCategory : null}
                  </Typography>
                  <Typography
                    variant="body2"
                    gutterBottom
                    fontWeight={500}
                    sx={ProductCardStyles.productNameStyle}
                  >
                    {title ? title : resourceType}
                  </Typography>
                </Box>
                <IconButton sx={ProductCardStyles.iconButton} title={'Product-Detail'}>
                  <ArrowForwardIos sx={{ color: 'white' }} />
                </IconButton>
              </Card>
            </Box>
          </Box>
        </Link>
      </Box>
    </>
  )
}

export default ResourceHitGridView
