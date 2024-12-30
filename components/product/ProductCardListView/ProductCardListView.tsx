import React, { MouseEvent, useEffect, useState } from 'react'

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

import PlpIconAttributes from './PlpIconAttributes'
import PlpTextAttributes from './PlpTextAttributes'
import { ProductCardStyles } from './ProductCardListView.styles'
import { KiboImage, Price } from '@/components/common'
import { usePriceRangeFormatter } from '@/hooks'
import { FulfillmentOptions as FulfillmentOptionsConstant } from '@/lib/constants'
import { productGetters } from '@/lib/getters'
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

import type { ProductImage, ProductPriceRange } from '@/lib/gql/types'

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
  resourceType: any
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
  catalogNumber?: string
  productProperties?: ProductProperties[]
  sliceValue?: string
  reactivity?: string
  variantProductName?: string
  isATCLoading?: boolean
  fulfillmentTypesSupported?: string[]
  onAddOrRemoveWishlistItem?: () => Promise<void>
  onClickQuickViewModal?: () => void
  onClickAddToCart?: (payload: any) => Promise<void>
  kiboImagesData: any
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

const getDocumentListDocuments = async (documentListName: string, filter: string) => {
  try {
    const response = await fetch('/api/custom-schema/get-documentlist-documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentListName, filter }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return data.response.items
  } catch (error) {
    console.error('Error fetching document list documents:', error)
    throw error
  }
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
    resourceType,
    categoryCode,
    parentCategoryName,
    link,
    imageUrl,
    kiboImagesData,
    placeholderImageUrl = DefaultImage,
    rating = 4,
    productDescription = '',
    imageHeight = 180,
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
    catalogNumber,
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

  const catalogNumberProperties = productProperties?.find(
    (prop) => prop.attributeFQN?.toLowerCase() === 'tenant~plp-catalog-number'
  )
  const ProductCatalogNumber = (
    catalogNumberProperties?.values as { value: string; stringValue: string }[] | undefined
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
  const [sortedImageUrl, setUpdateImageUrl] = useState<string>('')

  useEffect(() => {
    const fetchDocumentData = async () => {
      const digitalDocRes = await getDocumentListDocuments(
        'digitalassets@Fortis',
        `name eq ${variationProductCode} or name eq ${productCode}`
      )
      const imageAssets = digitalDocRes
        .filter(
          (asset: { properties: { assettype: string } }) =>
            asset.properties.assettype === 'ProductImage'
        )
        .map((asset: { properties: any }) => asset.properties)
        .sort((a: { sortorder: number }, b: { sortorder: number }) => a.sortorder - b.sortorder)

      const filterImgData = imageAssets.filter(
        (item: { sortorder: string }) => item.sortorder === '1'
      )

      let updatedImageData: { imageUrl: string; cmsId: string }[] | undefined

      if (filterImgData.length === 1) {
        // If `filterImgData` has only one item, filter `kiboImagesData` using its `cmsid`
        const imgCmsId = filterImgData[0].cmsid
        updatedImageData = kiboImagesData?.filter(
          (item: { cmsId: any } | null | undefined): item is { cmsId: string } =>
            item !== null && item !== undefined && item.cmsId === imgCmsId
        )
      } else {
        // If `filterImgData` has more than one item, iterate over all `cmsid` values
        for (const { cmsid } of filterImgData) {
          const matchedData = kiboImagesData?.filter(
            (item: { cmsId: any } | null | undefined): item is { cmsId: string } =>
              item !== null && item !== undefined && item.cmsId === cmsid
          )

          if (matchedData && matchedData.length > 0) {
            updatedImageData = matchedData
            break
          }
        }
      }
      const updateImageUrl = updatedImageData?.[0]?.imageUrl
      setUpdateImageUrl(updateImageUrl ?? '')
    }
    if (kiboImagesData.length > 0) {
      fetchDocumentData()
    }
  }, [variationProductCode, productCode, kiboImagesData])

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
                    // sm: 'auto',
                  },
                }}
              >
                <KiboImage
                  src={
                    productGetters.handleProtocolRelativeUrl(sortedImageUrl) ||
                    brandImages[brand.toLowerCase()] ||
                    placeholderImageUrl
                  }
                  alt={imageUrl ? imageAltText : 'no-image-alt'}
                  objectFit={
                    imageUrl ? 'contain' : brandImages[brand.toLowerCase()] ? 'none' : 'contain'
                  }
                  data-testid="product-image"
                />
              </CardMedia>
              <Box flexDirection="column" m={1} width="75%" className="product-info">
                <Box display="flex" alignItems="start" width="100%">
                  <Typography
                    variant="body2"
                    gutterBottom
                    fontWeight={500}
                    sx={ProductCardStyles.productTitle}
                  >
                    {sliceValue ? variantProductName : title}
                  </Typography>
                  {brandImages[brand.toLowerCase()] && (
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
                  <PlpIconAttributes
                    productProperties={productProperties}
                    sliceValue={sliceValue}
                  />
                </Box>

                <Box>
                  <PlpTextAttributes
                    productProperties={productProperties}
                    sliceValue={sliceValue}
                  />
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
