import React from 'react'

import { BuilderComponent } from '@builder.io/react'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Grid,
  Typography,
  Divider,
  Link as MuiLink,
  styled,
  Theme,
  MenuItem,
} from '@mui/material'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import CitationWidget from './CitationWidget'
import ProductInventoryMessages from './ProductInventoryMessages'
import ProductSpecifications from './ProductSpecifications'
import { usePdpViewModel } from './usePdpViewModel'
import {
  FortisRadio,
  FulfillmentOptions,
  KiboRadio,
  KiboSelect,
  QuantitySelector,
} from '@/components/common'
import { KiboBreadcrumbs, ImageGallery } from '@/components/core'
import { AddToCartDialog, StoreLocatorDialog } from '@/components/dialogs'
import { ProductRecentDocuments } from '@/components/product'
import {
  ColorSelector,
  ProductInformation,
  ProductOptionCheckbox,
  ProductOptionTextBox,
  ProductQuickViewDialog,
  ProductVariantSizeSelector,
} from '@/components/product'
import AdditionalProductInfo from '@/components/product/AdditionalProductInfo'
import PdpIconAttributes from '@/components/product/PdpIconAttributes'
import ProductApplications from '@/components/product/ProductApplication/ProductApplications'
import RelatedProductsCarousel from '@/components/product/RelatedProductsCarousel'
import { useAuthContext, useModalContext } from '@/context'
import { FulfillmentOptions as FulfillmentOptionsConstant, PurchaseTypes } from '@/lib/constants'
import { brandImages, pdpBrandLogos } from '@/lib/constants/brandLogos'
import { productGetters } from '@/lib/getters'
import { uiHelpers } from '@/lib/helpers'
import type { ProductCustom, BreadCrumb, LocationCustom } from '@/lib/types'
import { addToCartGTMPDP } from '@/lib/utils/google-tag-manager'
import theme from '@/styles/theme'

import type {
  AttributeDetail,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  CrProduct,
  Product,
  FilteredProduct,
} from '@/lib/gql/types'

interface ProductDetailTemplateProps {
  product: ProductCustom
  sliceValue?: string
  selectedUrlVariant?: string
  productVariations?: Product[] | FilteredProduct[]
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
  relatedProducts?: []
  shouldFetchShippingMethods?: boolean
  getCurrentProduct?: (
    addToCartPayload: any,
    currentProduct: ProductCustom,
    isValidateAddToCart: boolean,
    isValidateAddToWishlist: boolean
  ) => void
  PDPCustomAndBulkDisplayContentSection?: any
  PDPCustomAndBulkDisplaySectionKey?: string
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

type queryIdArr = {
  ProductCode: string | undefined
  queryId: string
}

const ProductDetailTemplate = (props: ProductDetailTemplateProps) => {
  const { getProductLink } = uiHelpers()
  const {
    product,
    sliceValue,
    selectedUrlVariant,
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
    relatedProducts,
    PDPCustomAndBulkDisplayContentSection,
    PDPCustomAndBulkDisplaySectionKey,
    getCurrentProduct,
  } = props

  const { t } = useTranslation('common')
  const { showModal, closeModal } = useModalContext()
  const { user } = useAuthContext()
  const siteUrl = process.env.NEXT_PUBLIC_URL

  const {
    updatedProduct,
    currentProduct,
    isDigitalFulfillment,
    sectionTargetUrl,
    productCode,
    variationProductCode,
    description,
    shortDescription,
    productGallery,
    productOptions,
    optionsVisibility,
    properties,
    factoredProductData,
    brand,
    brandName,
    newProduct,
    variantProductName,
    variantProductTitle,
    isLoading,
    purchaseType,
    selectedFrequency,
    isSubscriptionModeAvailable,
    isSubscriptionOnly,
    subscriptionFrequency,
    handlePurchaseTypeSelection,
    handleFrequencyChange,
    quantity,
    setQuantity,
    minQuantity,
    maxQuantity,
    quantityLeft,
    stockAvailable,
    minimumStock,
    stockBehaviour,
    skuStatusText,
    showPrices,
    availabilityMessageArr,
    fulfillmentOptions,
    selectedFulfillmentOption,
    setSelectedFulfillmentOption,
    selectProductOption,
    customCTALabel,
    handleCustomCTATarget,
    handleLinkTarget,
    countryCode,
    ousShowDistributorBtn,
    ousShowPrices,
    citationCountVariant,
    citeabProductCode,
    citationApiKey,
    digitalDocumentData,
    addToCartPayload,
    addToCart,
    setProductsQueryIdArr,
    algoliaQueryId,
    algoliaObjectData,
    addtocartvalue,
    keyVal,
    variationCodeDynamic,
    purchaseLocation,
    currentlocationInventory,
  } = usePdpViewModel({
    product,
    sliceValue,
    selectedUrlVariant,
    productVariations,
    isB2B,
    PDPCustomAndBulkDisplayContentSection,
    getCurrentProduct,
  })

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

  const handleAddToCart = async () => {
    try {
      const storedQueryId = localStorage.getItem('algoliaQueryId')

      if (storedQueryId) {
        const newProductQuery: queryIdArr = {
          ProductCode: variationProductCode || undefined,
          queryId: storedQueryId,
        }

        setProductsQueryIdArr((prevProducts) => {
          const existingIndex = prevProducts.findIndex(
            (p) => p.ProductCode === newProductQuery.ProductCode
          )

          if (existingIndex !== -1) {
            const updatedProducts = [...prevProducts]
            updatedProducts[existingIndex] = {
              ...updatedProducts[existingIndex],
              queryId: storedQueryId,
            }
            return updatedProducts
          }

          return [...prevProducts, newProductQuery]
        })
      }
      const cartResponse = await addToCart.mutateAsync(addToCartPayload)
      const productPrice = productGetters.getPrice(product)
      if (cartResponse.id && !isB2B) {
        showModal({
          Component: AddToCartDialog,
          props: {
            cartItem: cartResponse,
          },
        })
      }

      if (product?.productCode && cartResponse && product?.categories?.[0]?.content?.name) {
        addToCartGTMPDP(
          cartResponse?.total,
          user?.userId,
          product?.productCode,
          productGetters.getName(product).replace(/[^a-zA-Z0-9 -]/g, ''),
          product?.categories?.[0]?.content?.name,
          brandName,
          variationProductCode,
          cartResponse?.product?.price?.price,
          quantity
        )
      }
    } catch (err) {
      console.log(err)
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

  return (
    <Grid container>
      {!isQuickViewModal && (
        <Grid
          item
          xs={12}
          alignItems="center"
          sx={{ paddingTop: { lg: '4px' }, paddingBottom: { lg: '16px' } }}
        >
          <KiboBreadcrumbs breadcrumbs={breadcrumbs} />
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
              flexDirection: { md: 'row', sm: 'row', xs: 'column' },
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
              {!isLoading && (
                <Typography variant="h1" sx={{ color: 'primary.main' }} tabIndex={0}>
                  {variantProductTitle}
                </Typography>
              )}
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

      <Grid
        sx={{
          display: 'flex',
          flexDirection: { md: 'row', sm: 'column', xs: 'column' },
          gap: '40px',
          width: '100%',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <ImageGallery
            digitalAssets={digitalDocumentData}
            kiboImages={productGallery as ProductImage[]}
            title={'HI Image'}
            brandImage={
              brand && typeof brand === 'string' ? pdpBrandLogos[brand.toLowerCase()] : null
            }
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <Grid sx={{ width: '100%' }}>
            {/* <Price
                price={t<string>('currency', { val: productPrice.regular })}
                {...(productPrice.special && {
                  salePrice: t<string>('currency', { val: productPrice.special }),
                })}
                priceRange={usePriceRangeFormatter(productPriceRange)}
              /> */}
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
                      ousShowPrices={ousShowPrices}
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
            <PdpIconAttributes
              product={updatedProduct}
              hasDocuments={digitalDocumentData && digitalDocumentData.length > 0}
            />
            {((countryCode && countryCode === 'US') ||
              !countryCode ||
              (typeof countryCode === 'string' && countryCode.trim() === '')) && (
              <Box
                display="flex"
                sx={{
                  padding: '20px',
                  bgcolor: theme?.palette.secondary.main,
                  margin: '30px 0',
                  flexDirection: { xs: 'column', lg: 'row' },
                }}
              >
                {/* Column for ProductInventoryMessages */}
                <Box
                  flex={1}
                  sx={{ minWidth: '0', [theme.breakpoints.up('lg')]: { minWidth: '333px' } }}
                >
                  <ProductInventoryMessages
                    product={currentProduct}
                    inventoryInfo={currentlocationInventory}
                    stockAvailable={stockAvailable}
                    availabilityMessageArr={availabilityMessageArr}
                    countryCode={'US'}
                  />
                </Box>

                {/* Column for QuantitySelector and LoadingButton */}
                {skuStatusText === 'CustomCTA' && (
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    fullWidth
                    className={algoliaQueryId ? 'custom-CTA-button-search' : 'custom-CTA-button'}
                    onClick={() =>
                      ousShowDistributorBtn ? handleLinkTarget() : handleCustomCTATarget()
                    }
                    {...(algoliaQueryId && {
                      'data-insights-query-id': algoliaQueryId,
                    })}
                    data-insights-object-id={variationProductCode}
                    data-insights-index="products"
                    sx={{
                      marginTop: 1,
                      bgcolor: theme?.palette.primary.main,
                      fontSize: '16px !important',
                      fontWeight: 500,
                      width: '100%',
                      transition: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: theme?.palette.primary.light,
                      },
                      '@media (max-width: 1023px)': {
                        width: '52%',
                      },
                    }}
                  >
                    {ousShowDistributorBtn ? t('distributors') : customCTALabel}
                  </LoadingButton>
                )}
                {skuStatusText &&
                  skuStatusText === 'Active' &&
                  stockBehaviour &&
                  (stockBehaviour !== 'DenyBackorder' ||
                    (stockBehaviour === 'DenyBackorder' && stockAvailable >= minimumStock)) && (
                    <Box display="flex" flexDirection="column" justifyContent="flex-start">
                      {/* Align items in a column */}
                      <Box
                        sx={{
                          width: '100%',
                          '@media (max-width: 1023px)': { marginTop: '20px' },
                        }}
                      >
                        <QuantitySelector
                          label="Quantity"
                          quantity={quantity >= minQuantity ? quantity : minQuantity}
                          minQty={minQuantity}
                          {...(maxQuantity ? { maxQuantity } : {})}
                          onIncrease={() => setQuantity((prevQuantity) => Number(prevQuantity) + 1)}
                          onDecrease={() => setQuantity((prevQuantity) => Number(prevQuantity) - 1)}
                          onQuantityUpdate={(qty: any) => setQuantity(qty)}
                        />
                      </Box>
                      <LoadingButton
                        variant="contained"
                        color="primary"
                        fullWidth
                        className={
                          algoliaQueryId ? 'add-to-cart-button-search' : 'add-to-cart-button'
                        }
                        onClick={() => handleAddToCart()}
                        loading={addToCart.isPending}
                        data-insights-object-id={variationProductCode}
                        data-insights-query-id={algoliaQueryId ? algoliaQueryId : undefined}
                        data-insights-object-data={
                          algoliaObjectData ? JSON.stringify(algoliaObjectData) : undefined
                        }
                        data-insights-product-price={JSON.stringify(addtocartvalue)}
                        data-insights-currency={JSON.stringify('USD')}
                        data-insights-index="products"
                        sx={{
                          marginTop: '20px',
                          bgcolor: theme?.palette.primary.main,
                          fontSize: '16px !important',
                          fontWeight: 500,
                          transition: 'none',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: theme?.palette.primary.light,
                          },
                          '@media (max-width: 1023px)': {
                            width: '52%',
                          },
                        }}
                      >
                        {t('add-to-cart')}
                      </LoadingButton>
                    </Box>
                  )}
              </Box>
            )}
            {countryCode &&
              countryCode !== 'US' &&
              typeof countryCode === 'string' &&
              countryCode.trim() !== '' && (
                <Box
                  display="flex"
                  sx={{
                    padding: '20px',
                    bgcolor: theme?.palette.secondary.main,
                    margin: '30px 0',
                    flexDirection: { xs: 'column', lg: 'row' },
                  }}
                >
                  {/* Column for Messages */}
                  <Box
                    flex={1}
                    sx={{ minWidth: '0', [theme.breakpoints.up('lg')]: { minWidth: '333px' } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'start' }}>
                      <Typography
                        variant="body1"
                        sx={{
                          margin: '0 35px 0 10px',
                          lineHeight: '25px',
                          color: '#000000',
                          fontSize: '16px',
                          '@media (max-width: 910px)': {
                            fontSize: '0.875rem',
                            lineHeight: '1.375rem',
                          },
                        }}
                      >
                        {ousShowDistributorBtn
                          ? t('distributorMessage')
                          : t('nonDistributorMessage')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Column for OUS Button */}
                  {!(skuStatusText !== 'CustomCTA' && !ousShowDistributorBtn) && (
                    <LoadingButton
                      variant="contained"
                      color="primary"
                      fullWidth
                      className={algoliaQueryId ? 'custom-CTA-button-search' : 'custom-CTA-button'}
                      data-insights-object-id={variationProductCode}
                      data-insights-query-id={algoliaQueryId ? algoliaQueryId : undefined}
                      data-insights-index="products"
                      onClick={() =>
                        ousShowDistributorBtn ? handleLinkTarget() : handleCustomCTATarget()
                      }
                      sx={{
                        bgcolor: theme?.palette.primary.main,
                        fontSize: '16px !important',
                        fontWeight: '500',
                        transition: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: theme?.palette.primary.light,
                        },
                        '@media (max-width: 1023px)': {
                          width: '52%',
                        },
                      }}
                    >
                      {ousShowDistributorBtn && t('distributors')}
                      {!ousShowDistributorBtn && skuStatusText === 'CustomCTA' && customCTALabel}
                    </LoadingButton>
                  )}
                </Box>
              )}
            {PDPCustomAndBulkDisplayContentSection &&
              PDPCustomAndBulkDisplaySectionKey &&
              variationCodeDynamic && (
                <BuilderComponent
                  key={variationCodeDynamic}
                  model={PDPCustomAndBulkDisplaySectionKey}
                  content={PDPCustomAndBulkDisplayContentSection}
                  data={{
                    objectId: variationProductCode,
                    queryId: algoliaQueryId || undefined,
                  }}
                  context={{
                    className: algoliaQueryId
                      ? 'bulk-and-custom-button-search'
                      : 'bulk-and-custom-button',
                    bulkRedirect: () => {
                      window.location.href = `${siteUrl}${sectionTargetUrl}?Catalog_Num=${variationCodeDynamic}`
                    },
                  }}
                />
              )}
            {/* <Box paddingY={1}>
              <QuantitySelector
                label="Qty"
                quantity={quantity}
                onIncrease={() => setQuantity((prevQuantity: number) => Number(prevQuantity) + 1)}
                onDecrease={() => setQuantity((prevQuantity: number) => Number(prevQuantity) - 1)}
              />
            </Box> */}
            {isSubscriptionModeAvailable && (
              <Box paddingY={1} sx={{ display: 'none' }}>
                <KiboRadio
                  radioOptions={purchaseTypeRadioOptions}
                  selected={purchaseType}
                  onChange={handlePurchaseTypeSelection}
                />
              </Box>
            )}
            <Box paddingY={1} sx={{ display: 'none' }}>
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
                    onFulfillmentOptionChange={(value: string) =>
                      handleFulfillmentOptionChange(value)
                    }
                    onStoreSetOrUpdate={() => handleProductPickupLocation()}
                  />
                )}
            </Box>
            {!addItemToList && (
              <Box pt={2} display="flex" sx={{ justifyContent: 'space-between', display: 'none' }}>
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
            {/* {!isB2B && (
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
            )} */}
          </Grid>
        </Box>
        {/* <ImageGallery images={productGallery as ProductImage[]} title={'HI Image'} /> */}
      </Grid>
      {!isQuickViewModal && (
        <>
          <Grid item xs={12} paddingY={3}>
            <Divider sx={{ borderBottomWidth: '2px' }} />
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
      <AdditionalProductInfo product={product} />
      <Grid item xs={12} paddingY={3} pb={'20px'}>
        <Divider sx={{ borderBottomWidth: '2px' }} />
      </Grid>
      {digitalDocumentData && digitalDocumentData.length > 0 ? (
        <ProductRecentDocuments
          code={variationProductCode || productCode}
          properties={properties}
          documents={digitalDocumentData}
        />
      ) : null}
      {!isQuickViewModal && children}

      {/* Citations */}
      {citationCountVariant && product?.productType === 'Antibody-Configurable' ? (
        <Box
          id="citation-document-section"
          width={'100%'}
          display={'flex'}
          flexDirection={'row'}
          key={keyVal}
          sx={{
            marginTop: '35px',
          }}
        >
          <CitationWidget
            citeabProductCode={citeabProductCode}
            variantProductName={variantProductName}
            citationApiKey={citationApiKey}
          />
        </Box>
      ) : null}

      <Grid item xs={12} paddingY={4} pb={'30px'}>
        <Divider sx={{ borderBottomWidth: '2px' }} />
      </Grid>
      {relatedProducts && relatedProducts.length > 0 ? (
        <RelatedProductsCarousel relatedProducts={relatedProducts} />
      ) : null}
    </Grid>
  )
}

export default ProductDetailTemplate
