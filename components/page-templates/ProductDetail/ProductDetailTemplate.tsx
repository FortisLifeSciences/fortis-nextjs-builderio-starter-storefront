import React, { useState, useEffect } from 'react'

import { RttOutlined } from '@mui/icons-material'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import StarRounded from '@mui/icons-material/StarRounded'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Grid,
  Rating,
  Button,
  Typography,
  Divider,
  Link as MuiLink,
  styled,
  Theme,
  MenuItem,
} from '@mui/material'
import { data } from 'cheerio/dist/commonjs/api/attributes'
import { any } from 'jest-mock-extended'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import ProductSpecifications from './ProductSpecifications'
import { SortingValues } from '../../../lib/types/B2bTypes'
import {
  FortisRadio,
  FulfillmentOptions,
  KiboRadio,
  KiboSelect,
  Price,
  QuantitySelector,
} from '@/components/common'
import { KiboBreadcrumbs, ImageGallery } from '@/components/core'
import { AddToCartDialog, StoreLocatorDialog } from '@/components/dialogs'
import { ProductRecentDocuments } from '@/components/product'
import {
  ColorSelector,
  ProductInformation,
  ProductOptionCheckbox,
  ProductOptionSelect,
  ProductOptionTextBox,
  ProductQuickViewDialog,
  ProductVariantSizeSelector,
} from '@/components/product'
import PdpIconAttributes from '@/components/product/PdpIconAttributes'
import ProductApplications from '@/components/product/ProductApplication/ProductApplications'
import { useModalContext } from '@/context'
import {
  useProductDetailTemplate,
  useGetPurchaseLocation,
  useAddCartItem,
  useWishlist,
  useGetProductInventory,
  usePriceRangeFormatter,
  useGetProductPrice,
} from '@/hooks'
import { FulfillmentOptions as FulfillmentOptionsConstant, PurchaseTypes } from '@/lib/constants'
import { productGetters, subscriptionGetters, wishlistGetters } from '@/lib/getters'
import { uiHelpers } from '@/lib/helpers'
import type { ProductCustom, BreadCrumb, LocationCustom } from '@/lib/types'
import abcore from '@/public/Brand_Logo/abcore-logo.png'
import arista from '@/public/Brand_Logo/arista-logo.png'
import bethyl from '@/public/Brand_Logo/bethyl-logo.png'
import empirical from '@/public/Brand_Logo/empirical-logo.png'
import fortis from '@/public/Brand_Logo/fortis-logo.png'
import ipoc from '@/public/Brand_Logo/ipoc-logo.png'
import nanocomposix from '@/public/Brand_Logo/nanocomposix-logo.png'
import vector from '@/public/Brand_Logo/vector-logo.png'

import type {
  AttributeDetail,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  CrProduct,
  ProductPrice,
  Product,
  Maybe,
} from '@/lib/gql/types'

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
interface ProductDetailTemplateProps {
  product: ProductCustom
  sliceValue?: string
  productVariations?: Product[]
  breadcrumbs?: BreadCrumb[]
  isQuickViewModal?: boolean
  children?: any
  isB2B?: boolean
  addItemToList?: string
  addItemToQuote?: string
  addItemToCart?: string
  title?: string
  cancel?: string
  quoteDetails?: any
  shouldFetchShippingMethods?: boolean
  getCurrentProduct?: (
    addToCartPayload: any,
    currentProduct: ProductCustom,
    isValidateAddToCart: boolean,
    isValidateAddToWishlist: boolean
  ) => void
}

const styles = {
  moreDetails: {
    typography: 'body2',
    textDecoration: 'underline',
    color: 'text.primary',
    display: 'flex',
    alignItems: 'right',
    padding: '0.5rem 0',
    cursor: 'pointer',
    paddingLeft: '30rem',
  },
}

const StyledLink = styled(Link)(({ theme }: { theme: Theme }) => ({
  ...styles.moreDetails,
  color: theme?.palette.text.primary,
  fontSize: theme?.typography.body2.fontSize,
}))

/**
 * fetches the document list data from specified documentListName based on filter
 */
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

const ProductDetailTemplate = (props: ProductDetailTemplateProps) => {
  const { getProductLink } = uiHelpers()
  const {
    product,
    sliceValue,
    productVariations,
    breadcrumbs = [],
    isQuickViewModal = false,
    children,
    isB2B = false,
    addItemToList,
    addItemToQuote,
    addItemToCart,
    cancel,
    quoteDetails,
    shouldFetchShippingMethods,
    getCurrentProduct,
  } = props
  const [updatedProduct, setUpdatedProduct] = useState(product)
  const { t } = useTranslation('common')
  const isDigitalFulfillment = product.fulfillmentTypesSupported?.some(
    (type) => type === FulfillmentOptionsConstant.DIGITAL
  )

  console.log('This is updatedProduct ---> ', updatedProduct)

  const [purchaseType, setPurchaseType] = useState<string>(PurchaseTypes.ONETIMEPURCHASE)
  const [selectedFrequency, setSelectedFrequency] = useState<string>('')
  const [isSubscriptionPricingSelected, setIsSubscriptionPricingSelected] = useState<boolean>(false)
  const [skuStatusText, setSkuStatusText] = useState<string | null>('')
  const [showPrices, setShowPrices] = useState<boolean | null>()
  // const [radioProductOptions, setRadioProductOptions] = useState<any>()

  const isSubscriptionModeAvailable = subscriptionGetters.isSubscriptionModeAvailable(product)
  const isSubscriptionOnly = subscriptionGetters.isSubscriptionOnly(product)
  const { data: productPriceResponse } = useGetProductPrice(
    product?.productCode as string,
    isSubscriptionPricingSelected
  )

  const [digitalDocumentData, setDigitalDocumentData] = useState([])

  const { showModal, closeModal } = useModalContext()
  const { addToCart } = useAddCartItem()
  const { data: purchaseLocation } = useGetPurchaseLocation()

  const { addOrRemoveWishlistItem, checkProductInWishlist, isWishlistLoading } = useWishlist()

  const {
    currentProduct,
    quantity,
    updatedShopperEnteredValues,
    selectedFulfillmentOption,
    setQuantity,
    selectProductOption,
    setSelectedFulfillmentOption,
  } = useProductDetailTemplate({
    product,
    purchaseLocation,
  })

  // Getters
  const {
    productName,
    productCode,
    variationProductCode,
    fulfillmentMethod,
    productPrice,
    productPriceRange,
    productRating,
    description,
    shortDescription,
    productGallery,
    productOptions,
    optionsVisibility,
    properties,
    isValidForOneTime,
  } = productGetters.getProductDetails(
    {
      ...currentProduct,
      fulfillmentMethod: isDigitalFulfillment
        ? FulfillmentOptionsConstant.DIGITAL
        : selectedFulfillmentOption?.method,
      purchaseLocationCode: selectedFulfillmentOption?.location?.code as string,
    },
    productPriceResponse?.price as ProductPrice
  )
  const newProductData = product?.properties?.find(
    (data: any) => data?.attributeFQN === 'tenant~new-product'
  )
  const newProduct = (newProductData?.values?.[0]?.value as string) ?? null
  const brandValue = product?.properties?.find((data: any) => data?.attributeFQN === 'tenant~brand')
  const brand = (brandValue?.values?.[0]?.value as string) ?? null
  const variantProductName = productGetters.getVariantProductAttributeName(properties)

  const { data: locationInventory } = useGetProductInventory(
    (variationProductCode || productCode) as string,
    selectedFulfillmentOption?.location?.code as string
  )

  const getModifiedOptionData = (options: any) => {
    const variationMap = new Map()
    productVariations?.forEach((variation) => {
      if (variation?.option && variation.option.length > 0) {
        const variationValue = variation.option[0]?.value
        variationMap.set(variationValue, {
          childPriority: variation.childPriority,
          price: variation.price,
          variationProductCode: variation.variationProductCode, // Add this if it exists
        })
      }
    })

    options?.selectOptions?.forEach((selectOption: { values: any[] }) => {
      selectOption?.values?.forEach((optionValue) => {
        if (optionValue && variationMap.has(optionValue.value)) {
          const variationData = variationMap.get(optionValue.value)

          if (variationData) {
            // Directly assign properties since optionValue is checked
            optionValue.childPriority = variationData.childPriority
            optionValue.price = { ...variationData.price }
            optionValue.variationProductCode = variationData.variationProductCode
          }
        }
      })

      // Sort `values` array based on `childPriority`
      selectOption?.values?.sort((a, b) => {
        // If `childPriority` is undefined, place it at the end
        if (a?.childPriority === undefined && b?.childPriority === undefined) return 0
        if (a?.childPriority === undefined) return 1
        if (b?.childPriority === undefined) return -1
        return a?.childPriority - b?.childPriority
      })

      // Move the item that matches `sliceValue` to the top
      const matchedIndex = selectOption?.values?.findIndex((item) => item.value === sliceValue)
      if (matchedIndex !== -1) {
        const matchedItem = selectOption?.values?.splice(matchedIndex, 1)[0] // Remove the matched item
        selectOption?.values?.unshift(matchedItem) // Insert the matched item at the top
      }
    })
    return options
  }

  useEffect(() => {
    const fetchOptionData = async () => {
      const optionData = getModifiedOptionData(productOptions)
      const selectedValue = optionData?.selectOptions?.[0]?.values?.[0]?.value

      await selectProductOption(
        optionData?.selectOptions?.[0]?.attributeFQN as string,
        selectedValue,
        undefined,
        optionData?.selectOptions?.[0]?.values?.find(
          (value: { value: any }) => value?.value === selectedValue
        )?.isEnabled as boolean
      )
    }

    fetchOptionData()
  }, [])

  const factoredProductData = getModifiedOptionData(productOptions)

  const quantityLeft = productGetters.getAvailableItemCount(
    currentProduct,
    locationInventory,
    selectedFulfillmentOption?.method
  )
  const fulfillmentOptions = productGetters.getProductFulfillmentOptions(
    currentProduct,
    {
      name: selectedFulfillmentOption?.location?.name,
    },
    locationInventory
  )

  const isValidForAddToCart = () => {
    if (purchaseType === PurchaseTypes.SUBSCRIPTION) {
      return !!selectedFrequency && !(quantityLeft < 1)
    } else if (isDigitalFulfillment) {
      return isValidForOneTime
    }
    return isValidForOneTime && !(quantityLeft < 1)
  }

  const isProductInWishlist = checkProductInWishlist({
    productCode,
    variationProductCode,
  })

  const subscriptionFrequency = subscriptionGetters.getFrequencyValues(product as ProductCustom)

  const purchaseTypeRadioOptions = [
    {
      value: PurchaseTypes.SUBSCRIPTION,
      name: PurchaseTypes.SUBSCRIPTION,
      label: <Typography variant="body2">{PurchaseTypes.SUBSCRIPTION}</Typography>,
      selected: isSubscriptionOnly,
    },
    {
      value: PurchaseTypes.ONETIMEPURCHASE,
      name: PurchaseTypes.ONETIMEPURCHASE,
      label: <Typography variant="body2">{PurchaseTypes.ONETIMEPURCHASE}</Typography>,
      disabled: isSubscriptionOnly,
    },
  ]

  const addToCartPayload = {
    product: {
      productCode,
      variationProductCode,
      fulfillmentMethod,
      options: updatedShopperEnteredValues,
      purchaseLocationCode: selectedFulfillmentOption?.location?.code as string,
      currentProduct,
    },
    quantity,
    ...(purchaseType === PurchaseTypes.SUBSCRIPTION && {
      subscription: {
        required: true,
        frequency: subscriptionGetters.getFrequencyUnitAndValue(selectedFrequency),
      },
    }),
  }

  // methods
  const handleAddToCart = async () => {
    try {
      const cartResponse = await addToCart.mutateAsync(addToCartPayload)

      if (cartResponse.id && !isB2B) {
        showModal({
          Component: AddToCartDialog,
          props: {
            cartItem: cartResponse,
          },
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  const handleFulfillmentOptionChange = (value: string) => {
    if (
      value === FulfillmentOptionsConstant.SHIP ||
      selectedFulfillmentOption?.location?.name ||
      purchaseLocation.code
    ) {
      setSelectedFulfillmentOption({
        ...selectedFulfillmentOption,
        method: value,
      })
    } else {
      handleProductPickupLocation()
    }
  }

  const handleProductPickupLocation = (title?: string) => {
    showModal({
      Component: StoreLocatorDialog,
      props: {
        title: title,
        showProductAndInventory: true,
        product: currentProduct as CrProduct,
        quantity: quantity,
        isQuickViewModal: isQuickViewModal,
        isNested: isQuickViewModal,
        NestedDialog: isQuickViewModal ? ProductQuickViewDialog : null,
        nestedDialogProps: {
          product: currentProduct,
          shouldFetchShippingMethods,
          isQuickViewModal: true,
          dialogProps: {
            title: props.title,
            cancel,
            addItemToList: addItemToList,
            addItemToQuote: addItemToQuote,
            addItemToCart,
            isB2B,
          },
          quoteDetails,
        },
        onNestedDialogClose: {
          Component: ProductQuickViewDialog,
          props: {
            product: currentProduct,
            isQuickViewModal: true,
            shouldFetchShippingMethods,
            dialogProps: {
              title: props.title,
              cancel,
              addItemToList: addItemToList,
              addItemToQuote: addItemToQuote,
              addItemToCart,
              isB2B,
            },
            quoteDetails,
          },
        },
        handleSetStore: async (selectedStore: LocationCustom) => {
          setSelectedFulfillmentOption({
            method: FulfillmentOptionsConstant.PICKUP,
            location: selectedStore,
          })
        },
      },
    })
  }

  const isValidForAddToWishlist = wishlistGetters.isAvailableToAddToWishlist(currentProduct)

  const handleWishList = async () => {
    try {
      if (!isValidForAddToWishlist) return
      await addOrRemoveWishlistItem({ product: currentProduct })
    } catch (error) {
      console.log('Error: add or remove wishlist item from PDP', error)
    }
  }

  const handlePurchaseTypeSelection = (option: string) => {
    setPurchaseType(option)
    if (option === PurchaseTypes.SUBSCRIPTION) {
      setIsSubscriptionPricingSelected(true)
      setSelectedFulfillmentOption({
        ...selectedFulfillmentOption,
        method: FulfillmentOptionsConstant.SHIP,
      })
    } else {
      setIsSubscriptionPricingSelected(false)
    }
  }

  const handleFrequencyChange = async (_name: string, value: string) => setSelectedFrequency(value)

  useEffect(() => {
    if (isB2B && (isValidForAddToCart() || isValidForAddToWishlist)) {
      getCurrentProduct?.(
        addToCartPayload,
        currentProduct,
        isValidForAddToCart(),
        isValidForAddToWishlist as boolean
      )
    }
  }, [isB2B, isValidForAddToCart(), isValidForAddToWishlist, JSON.stringify(addToCartPayload)])

  useEffect(() => {
    if (isSubscriptionOnly) {
      setPurchaseType(PurchaseTypes.SUBSCRIPTION)
      setSelectedFulfillmentOption({
        ...selectedFulfillmentOption,
        method: FulfillmentOptionsConstant.SHIP,
      })
    }
  }, [])

  useEffect(() => {
    const fetchDocumentData = async () => {
      const digitalDocRes = await getDocumentListDocuments(
        'digitalassets@Fortis',
        `name eq ${variationProductCode} or name eq ${productCode}`
      )
      setDigitalDocumentData(digitalDocRes)
    }
    fetchDocumentData()
  }, [variationProductCode, productCode])

  useEffect(() => {
    const mergeProductProperties = () => {
      if (!product || !currentProduct) return

      // Create a map of currentProduct properties by attributeFQN for quick lookup
      const currentProductMap = new Map(
        currentProduct.properties?.map((item: any) => [item.attributeFQN, item])
      )

      // Merge properties from product and currentProduct
      const mergedProperties = product.properties
        ?.filter(
          (item: any) => !currentProductMap.has(item.attributeFQN) // Remove duplicates from product
        )
        ?.concat(currentProduct.properties || []) // Add currentProduct values

      // Update the product properties immutably
      setUpdatedProduct({ ...product, properties: mergedProperties })
    }

    mergeProductProperties()
  }, [product, currentProduct])

  useEffect(() => {
    const skuStatusTextProperty = updatedProduct?.properties?.find(
      (prop) => prop?.attributeFQN === 'tenant~sku-status-text'
    )

    const showPricesProperty = updatedProduct?.properties?.find(
      (prop) => prop?.attributeFQN === 'tenant~show-prices'
    )

    setSkuStatusText(
      skuStatusTextProperty ? String(skuStatusTextProperty?.values?.[0]?.value) : null
    )

    setShowPrices(showPricesProperty ? Boolean(showPricesProperty?.values?.[0]?.value) : null)
  }, [updatedProduct])

  // Update breadcrumbs links
  const updatedBreadcrumbsList = breadcrumbs.map((breadcrumb) => ({
    ...breadcrumb,
    link: breadcrumb.link ? breadcrumb.link.replace('/category/', '/products/') : breadcrumb.link,
  }))

  return (
    <Grid container>
      {!isQuickViewModal && (
        <Grid item xs={12} alignItems="center" sx={{ paddingBlock: 4 }}>
          <KiboBreadcrumbs breadcrumbs={updatedBreadcrumbsList} />
        </Grid>
      )}

      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flexStart',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '16px',
          }}
        >
          <Box
            sx={{
              width: { md: '80%', sm: '80%', xs: '100%' },
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Box>
              {newProduct && (
                <Box
                  sx={{
                    width: { md: '80px', sm: '80px', xs: '60px' },
                    height: { md: '41px', sm: '41px', xs: '30px' },
                    backgroundSize: { md: 'cover', sm: 'cover', xs: 'cover' },
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    marginRight: '15px',
                    marginTop: '12px',
                  }}
                  style={{
                    backgroundImage: `url('/NewTag.svg')`,
                  }}
                ></Box>
              )}
            </Box>
            <Box>
              <Typography variant="h1" sx={{ color: 'primary.main' }}>
                {sliceValue ? variantProductName : productName}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              width: {
                xs: '0',
                sm: newProduct === 'true' ? '20%' : '20%',
                md: newProduct === 'true' ? '20%' : '20%',
              },
              display: { xs: 'none', sm: 'block' },
              textAlign: 'right',
            }}
          >
            {brand && brandImages[brand.toLowerCase()] && (
              <Box
                component="img"
                src={brandImages[brand.toLowerCase()]}
                alt={`${brand}-logo`}
                sx={{
                  width: '100%',
                  maxWidth: { sm: '150px', md: '200px' },
                  height: { sm: '50px', md: '65px' },
                }}
                data-testid="brand-logo"
              />
            )}
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} md={6} sx={{ pb: { xs: 3, md: 0 } }}>
        <ImageGallery
          digitalAssets={digitalDocumentData}
          kiboImages={productGallery as ProductImage[]}
          title={'HI Image'}
          brandImage={brand && typeof brand === 'string' ? brandImages[brand.toLowerCase()] : null}
        />
        {/* <ImageGallery images={productGallery as ProductImage[]} title={'HI Image'} /> */}
      </Grid>
      <Grid item xs={12} md={6} sx={{ width: '100%', pl: { xs: 0, md: 5 } }}>
        <Price
          price={t<string>('currency', { val: productPrice.regular })}
          {...(productPrice.special && {
            salePrice: t<string>('currency', { val: productPrice.special }),
          })}
          priceRange={usePriceRangeFormatter(productPriceRange)}
        />
        <Box paddingY={1} display={shortDescription ? 'block' : 'none'}>
          <Box
            data-testid="short-description"
            dangerouslySetInnerHTML={{
              __html: shortDescription,
            }}
          />
          {isQuickViewModal && (
            <StyledLink
              href={getProductLink(product?.productCode as string)}
              passHref
              onClick={() => closeModal()}
              aria-label={t('more-details')}
            >
              {t('more-details')}
            </StyledLink>
          )}
        </Box>
        {/* <Box data-testid="product-rating">  //commented rating as per WEB-920, in future if needed one can reuse this block
          <Rating
            name="read-only"
            value={productRating}
            precision={0.5}
            readOnly
            size="small"
            icon={<StarRounded color="primary" />}
            emptyIcon={<StarRounded />}
          />
        </Box> */}
        <Box paddingX={1} paddingY={3} display={optionsVisibility.color ? 'block' : 'none'}>
          <ColorSelector
            attributeFQN={productOptions?.colourOptions?.attributeFQN as string}
            values={productOptions?.colourOptions?.values as ProductOptionValue[]}
            onColorChange={selectProductOption}
          />
        </Box>
        <Box paddingY={1} display={optionsVisibility.size ? 'block' : 'none'}>
          <ProductVariantSizeSelector
            values={productOptions?.sizeOptions?.values as ProductOptionValue[]}
            attributeFQN={productOptions?.sizeOptions?.attributeFQN as string}
            onSizeChange={selectProductOption}
          />
        </Box>
        <Box paddingY={1} display={optionsVisibility.select ? 'block' : 'none'}>
          {factoredProductData?.selectOptions?.map((option: any) => {
            // Mapping product options to radio button options
            const radioOptions = (option?.values ?? []).map((value: any) => ({
              childPriority: value?.childPriority,
              price: value?.price,
              variationProductCode: value?.variationProductCode,
              label: value?.stringValue || value?.value,
              value: value?.value,
              name: option?.attributeDetail?.name || '',
              disabled: !value?.isEnabled,
            }))

            return (
              <Box key={option?.attributeDetail?.name} paddingY={1}>
                <FortisRadio
                  name={option?.attributeDetail?.name || ''}
                  title={option?.attributeDetail?.name}
                  selected={productGetters.getOptionSelectedValue(option as ProductOption)}
                  radioOptions={radioOptions}
                  skuStatusText={skuStatusText}
                  showPrices={showPrices}
                  onChange={async (selectedValue) => {
                    await selectProductOption(
                      option?.attributeFQN as string,
                      selectedValue,
                      undefined,
                      option?.values?.find((value: any) => value?.value === selectedValue)
                        ?.isEnabled as boolean
                    )
                  }}
                />
              </Box>
            )
          })}
        </Box>
        <Box paddingY={1} display={optionsVisibility.checkbox ? 'block' : 'none'}>
          {productOptions?.yesNoOptions.map((option: ProductOption | null) => {
            const attributeDetail = option?.attributeDetail as AttributeDetail
            return (
              <ProductOptionCheckbox
                key={attributeDetail.name}
                label={attributeDetail.name as string}
                attributeFQN={option?.attributeFQN as string}
                checked={
                  productGetters.getOptionSelectedValue(option as ProductOption) ? true : false
                }
                onCheckboxChange={selectProductOption}
              />
            )
          })}
        </Box>
        <Box paddingY={1} display={optionsVisibility.textbox ? 'block' : 'none'}>
          {productOptions?.textBoxOptions.map((option) => {
            return (
              <ProductOptionTextBox
                key={option?.attributeDetail?.name}
                option={option as ProductOption}
                onBlur={selectProductOption}
              />
            )
          })}
        </Box>
        <Box>
          {currentProduct.properties?.map((item: any, index: number) => {
            if (item?.attributeFQN === 'tenant~description-variant') {
              return (
                <Typography
                  key={index}
                  dangerouslySetInnerHTML={{
                    __html: item?.values[0]?.stringValue,
                  }}
                  sx={{ fontSize: (theme) => theme.typography.body2, color: '#000' }}
                />
              )
            }
          })}
        </Box>
        <PdpIconAttributes product={product} />
        <Box paddingY={1}>
          <QuantitySelector
            label="Qty"
            quantity={quantity}
            onIncrease={() => setQuantity((prevQuantity: number) => Number(prevQuantity) + 1)}
            onDecrease={() => setQuantity((prevQuantity: number) => Number(prevQuantity) - 1)}
          />
        </Box>
        {isSubscriptionModeAvailable && (
          <Box paddingY={1}>
            <KiboRadio
              radioOptions={purchaseTypeRadioOptions}
              selected={purchaseType}
              onChange={handlePurchaseTypeSelection}
            />
          </Box>
        )}
        <Box paddingY={1}>
          {purchaseType === PurchaseTypes.SUBSCRIPTION && (
            <KiboSelect
              name={t('subscription-frequency')}
              onChange={handleFrequencyChange}
              placeholder={t('select-subscription-frequency')}
              value={selectedFrequency}
              label={t('subscription-frequency')}
            >
              {subscriptionFrequency?.map((property) => {
                return (
                  <MenuItem key={property?.stringValue} value={`${property?.stringValue}`}>
                    {`${property?.stringValue}`}
                  </MenuItem>
                )
              })}
            </KiboSelect>
          )}
          {!addItemToList &&
            purchaseType === PurchaseTypes.ONETIMEPURCHASE &&
            !isDigitalFulfillment && (
              <FulfillmentOptions
                title={t('fulfillment-options')}
                fulfillmentOptions={fulfillmentOptions}
                selected={selectedFulfillmentOption?.method}
                onFulfillmentOptionChange={(value: string) => handleFulfillmentOptionChange(value)}
                onStoreSetOrUpdate={() => handleProductPickupLocation()}
              />
            )}
        </Box>
        {!addItemToList && (
          <Box pt={2} display="flex" sx={{ justifyContent: 'space-between' }}>
            <Typography fontWeight="600" variant="body2">
              {selectedFulfillmentOption?.method && `${quantityLeft} ${t('item-left')}`}
            </Typography>
            {!isDigitalFulfillment && (
              <MuiLink
                color="inherit"
                variant="body2"
                sx={{ cursor: 'pointer' }}
                onClick={() => handleProductPickupLocation(t('check-nearby-store'))}
              >
                {t('nearby-stores')}
              </MuiLink>
            )}
          </Box>
        )}
        {!isB2B && (
          <Box paddingY={1} display="flex" flexDirection={'column'} gap={2}>
            <LoadingButton
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => handleAddToCart()}
              loading={addToCart.isPending}
              {...(!isValidForAddToCart() && { disabled: true })}
            >
              {t('add-to-cart')}
            </LoadingButton>
            <Box display="flex" gap={3}>
              <LoadingButton
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleWishList}
                loading={isWishlistLoading}
                sx={{ padding: '0.375rem 0.5rem' }}
                {...(!isValidForAddToWishlist && {
                  disabled: true,
                })}
              >
                {isProductInWishlist ? (
                  <FavoriteRoundedIcon sx={{ color: 'red.900', marginRight: '14px' }} />
                ) : (
                  <FavoriteBorderRoundedIcon sx={{ color: 'grey.600', marginRight: '14px' }} />
                )}
                {t('add-to-wishlist')}
              </LoadingButton>
              <Button variant="contained" color="inherit" fullWidth>
                {t('one-click-checkout')}
              </Button>
            </Box>
          </Box>
        )}
      </Grid>
      {!isQuickViewModal && (
        <>
          <Grid item xs={12} paddingY={3}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="h2"
              fontWeight={500}
              pb={2}
              sx={{ color: (theme) => theme.palette.primary.main }}
            >
              {t('product-details')}
            </Typography>
            {description && (
              <Box paddingY={1}>
                <ProductInformation productFullDescription={description} options={properties} />
              </Box>
            )}
          </Grid>
          {children}
        </>
      )}
      <ProductSpecifications product={updatedProduct} />
      <ProductApplications product={updatedProduct} currentProduct={currentProduct} />
      {digitalDocumentData && digitalDocumentData.length > 0 ? (
        <ProductRecentDocuments
          code={variationProductCode || productCode}
          properties={properties}
          documents={digitalDocumentData}
        />
      ) : null}
      {!isQuickViewModal && children}
    </Grid>
  )
}

export default ProductDetailTemplate
