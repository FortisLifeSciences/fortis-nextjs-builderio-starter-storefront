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

import { ProductCardStyles } from './ProductCardListView.styles'
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

export interface ProductCardListViewProps {
  title?: string
  newProduct?: string
  link: string
  imageUrl?: string
  placeholderImageUrl?: string
  imageAltText?: string
  price?: string
  salePrice?: string
  priceRange?: ProductPriceRange
  productCode?: string
  properties?: ProductProperties[]
  resourceTypeName?: string
  productType?: string
  variationProductCode?: string
  rating?: number
  productDescription?: string
  seoFriendlyUrl?: string
  categoryCode?: string
  parentCategoryName?: string
  imageHeight?: number
  imageLayout?: string
  isInWishlist?: boolean
  isInCart?: boolean
  isLoading?: boolean
  isShopNow?: boolean
  isShowWishlistIcon?: boolean
  showQuickViewButton?: boolean
  badge?: string
  brand?: string
  productProperties?: ProductProperties[]
  sliceValue?: string
  reactivity?: string
  variantProductName?: string
  isATCLoading?: boolean
  fulfillmentTypesSupported?: string[]
  onAddOrRemoveWishlistItem?: () => Promise<void>
  onClickQuickViewModal?: () => void
  onClickAddToCart?: (payload: any) => Promise<void>
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

const ProductCardListView = (props: ProductCardListViewProps) => {
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
    categoryCode,
    parentCategoryName,
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
    sliceValue,
    variantProductName,
    variationProductCode,
    fulfillmentTypesSupported,
    onAddOrRemoveWishlistItem,
    onClickQuickViewModal,
    onClickAddToCart,
  } = props

  const brandProperties = productProperties?.find(
    (prop) => prop.attributeFQN?.toLowerCase() === 'tenant~brand'
  )
  const brandLabel = (
    brandProperties?.values as { value: string; stringValue: string }[] | undefined
  )?.[0]?.stringValue

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

  const handleAddToCart = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    const payload = {
      product: {
        productCode: productCode,
        variationProductCode: variationProductCode,
        fulfillmentMethod: fulfillmentTypesSupported?.includes(FulfillmentOptionsConstant.DIGITAL)
          ? FulfillmentOptionsConstant.DIGITAL
          : FulfillmentOptionsConstant.SHIP,
        purchaseLocationCode: '',
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
              {isShowWishlistIcon && (
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
              )}

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
                    fontWeight={500}
                    sx={ProductCardStyles.productTitle}
                  >
                    {variationProductCode ? variantProductName : title}
                  </Typography>
                  {brandImages[brand.toLowerCase()] && (
                    <Box
                      component="img"
                      src={brandImages[brand.toLowerCase()]}
                      alt={`${brand}-logo`}
                      sx={ProductCardStyles.brandLogoImage}
                      data-testid="brand-logo"
                    />
                  )}
                </Box>
                <Box sx={ProductCardStyles.brandStyle}>
                  <Typography
                    variant="body1"
                    gutterBottom
                    color="text.primary"
                    sx={ProductCardStyles.brandLable}
                  >
                    {brandLabel}
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
                  {/* <Box
                    data-testid="short-description"
                    dangerouslySetInnerHTML={{
                      __html: productDescription,
                    }}
                  /> */}
                </Box>
                {/* <Box py={1}>
                  <Price
                    price={price}
                    salePrice={salePrice}
                    priceRange={productPriceRange}
                    variant="body1"
                  />
                </Box> */}

                <Box pt={1} display={'flex'} gap={2}>
                  {/* {showQuickViewButton ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleOpenProductQuickViewModal}
                    >
                      {t('quick-view')}
                    </Button>
                  ) : null} */}
                  {isShowWishlistIcon && (
                    <Button variant="contained" color="primary" onClick={handleAddToCart}>
                      {t('add-to-cart')}
                    </Button>
                  )}
                </Box>
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

export default ProductCardListView
