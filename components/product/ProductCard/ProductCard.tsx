import React, { MouseEvent, useState } from 'react'

import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos'
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRounded from '@mui/icons-material/FavoriteRounded'
import StarRounded from '@mui/icons-material/StarRounded'
import { LoadingButton } from '@mui/lab'
import {
  Card,
  Typography,
  CardMedia,
  Box,
  Stack,
  Skeleton,
  Button,
  Rating,
  IconButton,
} from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { ProductCardStyles } from './ProductCard.styles'
import { KiboImage, Price } from '@/components/common'
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

import type { CrProductOption, Product, ProductPriceRange } from '@/lib/gql/types'
export interface ProductCardProps {
  title?: string
  newProduct?: string
  brand?: string
  link: string
  imageUrl?: string
  placeholderImageUrl?: string
  imageAltText?: string
  price?: string
  salePrice?: string
  priceRange?: ProductPriceRange
  productCode?: string
  resourceTypeName?: string
  categoryCode?: string
  productType?: string
  variantProductName?: string
  variationProductCode?: string
  sliceValue?: string
  rating?: number
  imageHeight?: number
  imageLayout?: string
  isInWishlist?: boolean
  isInCart?: boolean
  isLoading?: boolean
  isShowWishlistIcon?: boolean
  product?: Product
  productProperties?: ProductProperties[]
  showQuickViewButton?: boolean
  badge?: string
  isATCLoading?: boolean
  options?: CrProductOption[]
  fulfillmentTypesSupported?: string[]
  onAddOrRemoveWishlistItem?: () => void
  onClickQuickViewModal?: () => void
  onClickAddToCart?: (payload: any) => void
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
const ProductCard = (props: ProductCardProps) => {
  const {
    productCode,
    variationProductCode,
    sliceValue,
    variantProductName,
    price,
    salePrice,
    priceRange,
    title,
    brand = '',
    newProduct,
    resourceTypeName,
    categoryCode,
    productType,
    productProperties,
    link,
    imageUrl,
    placeholderImageUrl = DefaultImage,
    rating = 0,
    imageHeight = 180,
    imageAltText = 'product-image-alt',
    isLoading = false,
    isInWishlist = false,
    isShowWishlistIcon = true,
    badge,
    onAddOrRemoveWishlistItem,
    showQuickViewButton = true,
    isATCLoading,
    options,
    fulfillmentTypesSupported,
    onClickQuickViewModal,
    onClickAddToCart,
  } = props

  const brandProperties = productProperties?.find(
    (prop) => prop.attributeFQN?.toLowerCase() === 'tenant~brand'
  )

  const brandLabel = (
    brandProperties?.values as { value: string; stringValue: string }[] | undefined
  )?.[0]?.stringValue

  const isResourceType = productType === 'Resources' ? true : false

  const productPriceRange = usePriceRangeFormatter(priceRange as ProductPriceRange)
  const { t } = useTranslation('common')
  const handleAddOrRemoveWishlistItem = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    onAddOrRemoveWishlistItem?.()
  }

  const handleOpenProductQuickViewModal = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    onClickQuickViewModal?.()
  }
  const handleAddToCart = (event: any) => {
    event.preventDefault()
    const payload = {
      product: {
        productCode: productCode,
        variationProductCode: variationProductCode,
        fulfillmentMethod: fulfillmentTypesSupported?.includes(FulfillmentOptionsConstant.DIGITAL)
          ? FulfillmentOptionsConstant.DIGITAL
          : FulfillmentOptionsConstant.SHIP,
        purchaseLocationCode: '',
        options: options,
      },
      quantity: 1,
    }
    onClickAddToCart?.(payload)
  }
  if (isLoading) return <ProductCardSkeleton />
  else
    return (
      <Box sx={ProductCardStyles.main}>
        <Link href={link} passHref data-testid="product-card-link">
          <Box>
            <Card sx={{ ...ProductCardStyles.cardRoot, minHeight: 321 }} data-testid="product-card">
              <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} pb={1}>
                {newProduct === 'true' && (
                  <Box
                    sx={{ ...ProductCardStyles.newTag }}
                    style={{
                      backgroundImage: `url('/NewTag.svg')`,
                    }}
                  />
                )}
                {/* Badge start */}
                {badge ? (
                  <Box
                    width="fit-content"
                    bgcolor={'grey.200'}
                    className="badge"
                    px={2}
                    textAlign={'center'}
                  >
                    <Typography variant="body1" fontWeight={500} color={'text.secondary'}>
                      {badge}
                    </Typography>
                  </Box>
                ) : null}
                {/* Badge End */}
                {isShowWishlistIcon && (
                  <Box
                    className="wishlist-button-container"
                    ml={'auto'}
                    textAlign={'right'}
                    onClick={handleAddOrRemoveWishlistItem}
                  >
                    {isInWishlist ? (
                      <FavoriteRounded sx={{ color: 'red.900' }} />
                    ) : (
                      <FavoriteBorderRounded sx={{ color: 'grey.600' }} />
                    )}
                  </Box>
                )}
              </Box>
              <CardMedia
                className="product-image"
                sx={{
                  ...ProductCardStyles.cardMedia,
                  height: imageHeight,
                  zIndex: 1,
                  position: 'relative',
                }}
              >
                <KiboImage
                  src={imageUrl || brandImages[brand.toLowerCase()] || placeholderImageUrl}
                  alt={imageAltText}
                  fill
                  quality={100}
                  sizes="(max-width: 240px) 240px, 240px"
                  objectFit={
                    imageUrl ? 'contain' : brandImages[brand.toLowerCase()] ? 'none' : 'contain'
                  }
                  data-testid="product-image"
                />
              </CardMedia>
              <Box flexDirection="column" m={1}>
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
                  sx={ProductCardStyles.productNameStyle}
                >
                  {sliceValue ? variantProductName : title}
                </Typography>
                {/* <Price
                  price={price}
                  salePrice={salePrice}
                  priceRange={productPriceRange}
                  variant="body1"
                /> */}
                {/* <Rating
                  name="read-only"
                  value={rating}
                  precision={0.5}
                  readOnly
                  size="small"
                  icon={<StarRounded color="primary" data-testid="filled-rating" />}
                  emptyIcon={<StarRounded data-testid="empty-rating" />}
                  data-testid="product-rating"
                /> */}
                <Box
                  pt={2}
                  textAlign={'center'}
                  sx={{ opacity: 0 }}
                  className="quick-actions"
                  data-testid="quick-actions"
                >
                  {/* {showQuickViewButton && (
                    <Button
                      sx={{ mr: 2 }}
                      variant="contained"
                      color="primary"
                      onClick={handleOpenProductQuickViewModal}
                    >
                      {t('quick-view')}
                    </Button>
                  )} */}
                  {isShowWishlistIcon && (
                    <LoadingButton
                      variant="contained"
                      color="primary"
                      onClick={handleAddToCart}
                      // loading={isATCLoading}
                    >
                      {t('add-to-cart')}
                    </LoadingButton>
                  )}
                </Box>
              </Box>
              <IconButton sx={ProductCardStyles.iconButton}>
                <ArrowForwardIos sx={{ color: 'white' }} />
              </IconButton>
            </Card>
          </Box>
        </Link>
      </Box>
    )
}
export default ProductCard
