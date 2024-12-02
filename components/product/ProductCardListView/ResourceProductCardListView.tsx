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

import { ProductCardListViewProps } from './ProductCardListView'
import { ProductCardStyles } from './ProductCardListView.styles'
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

import type { ProductPriceRange } from '@/lib/gql/types'
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

const styles = {
  shortDesc: {
    fontSize: '14px',
    fontWeight: 300,
    fontFamily: 'poppins',
    lineHeight: 'normal',
    color: '#333',
  },
}

const ProductCardSkeleton = () => {
  return (
    <Stack spacing={1} sx={ProductCardStyles.cardRoot} data-testid="product-card-skeleton">
      <Skeleton variant="rectangular" height={150} />
      <Skeleton variant="rectangular" height={20} />
      <Skeleton variant="rectangular" width={60} height={20} />
      <Skeleton variant="rectangular" width={95} height={20} />
    </Stack>
  )
}

const ResourceProductCardListView = (props: ProductCardListViewProps) => {
  const {
    price,
    salePrice,
    priceRange,
    title,
    brand = '',
    newProduct,
    reactivity,
    properties,
    resourceTypeName,
    resourceType,
    categoryCode,
    parentCategoryName,
    productType,
    link,
    imageUrl,
    placeholderImageUrl = DefaultImage,
    rating = 4,
    productDescription = '',
    imageHeight = 140,
    imageAltText = 'product-image-alt',
    isLoading = false,
    isInWishlist = false,
    isShowWishlistIcon = true,
    badge,
    productProperties,
    showQuickViewButton = false,
    productCode,
    variantProductName,
    variationProductCode,
    fulfillmentTypesSupported,
    onAddOrRemoveWishlistItem,
    onClickQuickViewModal,
    onClickAddToCart,
  } = props
  const isResourceType = productType === 'Resources' ? true : false
  const brandProperties = productProperties?.find(
    (prop) => prop.attributeFQN?.toLowerCase() === 'tenant~brand'
  )
  const brandLabel = (
    brandProperties?.values as { value: string; stringValue: string }[] | undefined
  )?.[0]?.stringValue

  const productPriceRange = usePriceRangeFormatter(priceRange as ProductPriceRange)

  const { t } = useTranslation('common')

  if (isLoading) return <ProductCardSkeleton />
  else
    return (
      <Box sx={ProductCardStyles.main}>
        <Link href={link} passHref data-testid="product-card-link">
          <Box>
            <Card sx={ProductCardStyles.cardRoot} data-testid="product-card">
              <Box>
                {newProduct === 'true' && (
                  <Box
                    sx={{ ...ProductCardStyles.listNewTag }}
                    style={{
                      backgroundImage: `url('/NewTag.svg')`,
                    }}
                  />
                )}
              </Box>
              {/* In figma design the wishlist icon not available so comment this code */}
              {/* {isShowWishlistIcon && (
                                <Box
                                    className="wishlist-button-container"
                                    textAlign={'right'}
                                    position={'absolute'}
                                    right={16}
                                    onClick={handleAddOrRemoveWishlistItem}
                                >
                                    {isInWishlist ? (
                                        <FavoriteRounded sx={{ color: 'red.900' }} />
                                    ) : (
                                        <FavoriteBorderRounded sx={{ color: 'grey.600' }} />
                                    )}
                                </Box>
                            )} */}

              {/* Badge start */}
              {badge ? (
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
              ) : null}
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
                  src={imageUrl || brandImages[brand.toLowerCase()] || placeholderImageUrl}
                  alt={imageUrl ? imageAltText : 'no-image-alt'}
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  data-testid="product-image"
                />
              </CardMedia>
              <Box flexDirection="column" m={1} width="75%" className="product-info">
                <Box display="flex" alignItems="center" width="100%">
                  <Typography
                    variant="body2"
                    gutterBottom
                    color="text.primary"
                    fontWeight="500"
                    sx={{ ...ProductCardStyles.productTitle }}
                  >
                    {title}
                  </Typography>
                  {isResourceType && resourceTypeName
                    ? resourceTypeArr.map((data) => {
                        return data.resourceType === resourceType?.value ? (
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
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '42px' }}
                            >
                              {data.value}
                            </span>
                          </Box>
                        ) : (
                          ''
                        )
                      })
                    : brandImages[brand.toLowerCase()] && (
                        <Box
                          component="img"
                          src={brandImages[brand.toLowerCase()]}
                          alt={`${brand}-logo`}
                          sx={ProductCardStyles.brandLogoImage}
                          data-testid="brand-logo"
                        />
                      )}
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
                    {isResourceType && resourceTypeName ? parentCategoryName : brandLabel}
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    color="text.primary"
                    sx={ProductCardStyles.brandLable}
                  >
                    {isResourceType && resourceTypeName ? resourceType?.stringValue : null}
                  </Typography>
                </Box>
                {/* <Rating
                  name="read-only"
                  value={rating}
                  precision={0.5}
                  readOnly
                  size="small"
                  icon={
                    <StarRounded color="primary" fontSize="small" data-testid="filled-rating" />
                  }
                  emptyIcon={<StarRounded data-testid="empty-rating" fontSize="small" />}
                  data-testid="product-rating"
                /> */}
                <Box>
                  <Box
                    sx={styles.shortDesc}
                    data-testid="short-description"
                    dangerouslySetInnerHTML={{
                      __html: productDescription,
                    }}
                  />
                </Box>
                {/* <Box py={1}>
                                    <Price
                                        price={price}
                                        salePrice={salePrice}
                                        priceRange={productPriceRange}
                                        variant="body1"
                                    />
                                </Box> */}

                {/* <Box pt={1} display={'flex'} gap={2}>
                                    {showQuickViewButton ? (
                                        <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleOpenProductQuickViewModal}
                                        >
                                        {t('quick-view')}
                                        </Button>
                                    ) : null}
                                    {isShowWishlistIcon && (
                                        <Button variant="contained" color="primary" onClick={handleAddToCart}>
                                            {t('add-to-cart')}
                                        </Button>
                                    )}
                                </Box> */}
              </Box>
              <IconButton sx={ProductCardStyles.listIconButton}>
                <ArrowForwardIos sx={{ color: 'white' }} />
              </IconButton>
            </Card>
          </Box>
        </Link>
      </Box>
    )
}

export default ResourceProductCardListView
