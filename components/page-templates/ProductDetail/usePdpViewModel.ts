import { useEffect, useMemo, useState } from 'react'

import * as cookieNext from 'cookies-next'
import router from 'next/router'

import { getPdpBrandConfig, resolveBrandKey, MAX_HERO_FACTS } from './pdpBrandConfig'
import { buildFacts } from './pdpProperties'
import { applyVariationData, resolveDefaultOptionValue } from './resolveDefaultVariant'
import {
  useProductDetailTemplate,
  useGetPurchaseLocation,
  useAddCartItem,
  useWishlist,
  useGetProductInventory,
  useGetProductPrice,
} from '@/hooks'
import { hasAnalyticsConsent } from '@/lib/consent/consent'
import {
  DIGITAL_ASSETS_LIST,
  FulfillmentOptions as FulfillmentOptionsConstant,
  PurchaseTypes,
} from '@/lib/constants'
import { productGetters, subscriptionGetters, wishlistGetters } from '@/lib/getters'
import type { ProductCustom } from '@/lib/types'
import { viewItemGTM } from '@/lib/utils/google-tag-manager'

import type { Product, ProductPrice, FilteredProduct, ConfiguredProduct } from '@/lib/gql/types'

const getDocumentListDocuments = async (documentListName: string, filter: string) => {
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
}

const variantProperties = [
  'tenant~applications-variant',
  'tenant~new-product-variant',
  'tenant~conjugate-type-variant',
  'tenant~purity-variant',
  'tenant~stock-concentration',
  'tenant~storage-variant',
  'tenant~shelf-life-variant',
  'tenant~buffer',
  'tenant~epitope-tag',
  'tenant~prodprocedures-1',
  'tenant~contents-variant',
  'tenant~application-text-variant',
  'tenant~application-dilution-range',
  'tenant~citation-count-variant',
]

type queryIdArr = {
  ProductCode: string | undefined
  queryId: string
}

function getQueryID(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('queryID')
}

export interface UsePdpViewModelParams {
  product: ProductCustom
  sliceValue?: string
  selectedUrlVariant?: string
  productVariations?: Product[] | FilteredProduct[]
  isB2B?: boolean
  digitalAssets?: any[]
  configuredVariant?: ConfiguredProduct | null
  citationApiKey?: string | null
  PDPCustomAndBulkDisplayContentSection?: any
  getCurrentProduct?: (
    addToCartPayload: any,
    currentProduct: ProductCustom,
    isValidateAddToCart: boolean,
    isValidateAddToWishlist: boolean
  ) => void
}

export const usePdpViewModel = (params: UsePdpViewModelParams) => {
  const {
    product,
    sliceValue,
    selectedUrlVariant,
    productVariations,
    isB2B = false,
    digitalAssets,
    configuredVariant,
    citationApiKey = null,
    PDPCustomAndBulkDisplayContentSection,
    getCurrentProduct,
  } = params

  const [minQuantity, setMinQuantity] = useState(1)
  const isDigitalFulfillment = product.fulfillmentTypesSupported?.some(
    (type) => type === FulfillmentOptionsConstant.DIGITAL
  )

  const sectionTargetUrl = PDPCustomAndBulkDisplayContentSection?.data?.targetUrl
  const [purchaseType, setPurchaseType] = useState<string>(PurchaseTypes.ONETIMEPURCHASE)
  const [selectedFrequency, setSelectedFrequency] = useState<string>('')
  const [isSubscriptionPricingSelected, setIsSubscriptionPricingSelected] = useState<boolean>(false)

  const isSubscriptionModeAvailable = subscriptionGetters.isSubscriptionModeAvailable(product)
  const isSubscriptionOnly = subscriptionGetters.isSubscriptionOnly(product)
  const { data: productPriceResponse } = useGetProductPrice(
    product?.productCode as string,
    isSubscriptionPricingSelected
  )

  const [digitalDocumentData, setDigitalDocumentData] = useState<any[]>(digitalAssets ?? [])

  const { addToCart } = useAddCartItem()
  const { data: purchaseLocation } = useGetPurchaseLocation()

  const { addOrRemoveWishlistItem, checkProductInWishlist, isWishlistLoading } = useWishlist()

  const countryCode = cookieNext.getCookie('ipBasedCountryCode')

  const [algoliaQueryId, setAlgoliaQueryId] = useState<string | null>('')

  useEffect(() => {
    const queryId = getQueryID()

    if (queryId) {
      setAlgoliaQueryId(queryId)
      if (hasAnalyticsConsent()) {
        localStorage.setItem('algoliaQueryId', queryId)
      }
    } else {
      const storedQueryId = localStorage.getItem('algoliaQueryId')
      if (storedQueryId) {
        setAlgoliaQueryId(storedQueryId)
      }
    }
  }, [])

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
    configuredVariant,
  })

  const {
    productName,
    newVariantProductAttribute,
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
  const [variationCodeDynamic, setVariationCodeDynamic] = useState<string>()
  const newProductData = product?.properties?.find(
    (data: any) => data?.attributeFQN === 'tenant~new-product'
  )
  const newProduct = (newProductData?.values?.[0]?.value as string) ?? null
  const brandValue = product?.properties?.find((data: any) => data?.attributeFQN === 'tenant~brand')
  const brand = (brandValue?.values?.[0]?.value as string) ?? null
  const brandName = (brandValue?.values?.[0]?.stringValue as string) ?? null
  const variantProductName = productGetters.getVariantProductAttributeName(properties)
  const ousShowDistributorBtn =
    (product?.properties?.find(
      (data: any) => data?.attributeFQN === 'tenant~ous-show-distributors-button'
    )?.values?.[0]?.value as boolean) || false
  const ousShowPrices =
    (product?.properties?.find((data: any) => data?.attributeFQN === 'tenant~ous-show-prices')
      ?.values?.[0]?.value as boolean) || false
  const { data: locationInventory } = useGetProductInventory(
    (variationProductCode || productCode) as string,
    selectedFulfillmentOption?.location?.code as string
  )

  const getModifiedOptionData = (options: any) => applyVariationData(options, productVariations)

  useEffect(() => {
    const fetchOptionData = async () => {
      const selection = resolveDefaultOptionValue({
        product,
        productVariations,
        sliceValue,
        selectedUrlVariant,
      })

      if (!selection) return

      await selectProductOption(
        selection.attributeFQN,
        selection.value,
        undefined,
        selection.isEnabled
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

  useEffect(() => {
    const fetchPriceList = async () => {
      try {
        const response = await fetch('/api/user/priceListRep', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ variationProductCode }),
        })

        const result = await response.json()
        setMinQuantity(result?.minQty)
        if (result?.minQty) setQuantity(result?.minQty)
        else setQuantity(1)
      } catch (error) {
        console.error('Error calling price list API:', error)
      }
    }

    if (variationProductCode) {
      fetchPriceList()
    }
  }, [variationProductCode])

  const isValidForAddToCart = () => {
    if (purchaseType === PurchaseTypes.SUBSCRIPTION) {
      return !!selectedFrequency && !(quantityLeft < 1)
    } else if (isDigitalFulfillment) {
      return isValidForOneTime
    }
    return true
  }

  const isProductInWishlist = checkProductInWishlist({
    productCode,
    variationProductCode,
  })

  const subscriptionFrequency = subscriptionGetters.getFrequencyValues(product as ProductCustom)

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

  const [productsQueryIdArr, setProductsQueryIdArr] = useState<queryIdArr[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('queryIdArray')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })
  useEffect(() => {
    if (!hasAnalyticsConsent()) return
    localStorage.setItem('queryIdArray', JSON.stringify(productsQueryIdArr))
  }, [productsQueryIdArr])

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

  const currentlocationInventory = useGetProductInventory(
    (currentProduct?.variationProductCode || productCode) as string,
    'BETHYL' as string
  )
  const stockAvailable = currentlocationInventory?.data?.[0]?.stockAvailable || 0

  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        const digitalDocRes = await getDocumentListDocuments(
          DIGITAL_ASSETS_LIST,
          `name eq ${variationProductCode} or name eq ${productCode}`
        )
        if (Array.isArray(digitalDocRes)) setDigitalDocumentData(digitalDocRes)
      } catch (error) {
        console.error('Error fetching document list documents:', error)
      }
    }
    fetchDocumentData()
  }, [variationProductCode, productCode])

  const updatedProduct = useMemo(() => {
    if (!product || !currentProduct) return product

    const currentProductMap = new Map(
      currentProduct?.properties?.map((item: any) => [item.attributeFQN, item])
    )

    let mergedProperties = product?.properties?.filter(
      (item: any) => !currentProductMap?.has(item.attributeFQN)
    )

    mergedProperties = mergedProperties
      ?.filter((property: any) => !variantProperties.includes(property.attributeFQN))
      ?.concat(currentProduct?.properties || [])

    return { ...product, properties: mergedProperties }
  }, [product, currentProduct])

  const variantTitleValues = currentProduct?.properties?.find(
    (data: any) => data?.attributeFQN === 'tenant~variant-product-name'
  )?.values

  const variantProductTitle =
    variantTitleValues?.length === 1 ? (variantTitleValues?.[0]?.stringValue as string) ?? '' : ''

  const isLoading = variantTitleValues?.length !== 1

  const citationCountVariantAttr =
    currentProduct?.properties?.find(
      (data: any) => data?.attributeFQN === 'tenant~citation-count-variant'
    )?.values?.[0]?.value || null
  const citationCountVariant = citationCountVariantAttr ? Number(citationCountVariantAttr) : 0

  const {
    skuStatusText,
    showPrices,
    customCTALabel,
    customCTATarget,
    stockBehaviour,
    minimumStock,
    citeabProductCode,
  } = useMemo(() => {
    const skuStatusTextProperty = updatedProduct?.properties?.find(
      (prop: any) => prop?.attributeFQN === 'tenant~sku-status-text'
    )

    const showPricesProperty = updatedProduct?.properties?.find(
      (prop: any) => prop?.attributeFQN === 'tenant~show-prices'
    )

    const customCTALabelAttr =
      updatedProduct?.properties?.find(
        (data: any) => data?.attributeFQN === 'tenant~custom-cta-label'
      )?.values?.[0]?.stringValue || null

    const customCTATargetAttr =
      updatedProduct?.properties?.find(
        (data: any) => data?.attributeFQN === 'tenant~custom-cta-target'
      )?.values?.[0]?.stringValue || null

    const stockBehaviourAttr =
      updatedProduct?.properties?.find(
        (data: any) => data?.attributeFQN === 'tenant~stock-behavior-option'
      )?.values?.[0]?.stringValue || null

    const minimumStockArr =
      updatedProduct?.properties?.find((data: any) => data?.attributeFQN === 'tenant~minimum-stock')
        ?.values?.[0]?.value || null

    const citeabProductCodeAttr =
      updatedProduct?.properties?.find(
        (data: any) => data?.attributeFQN === 'tenant~citeab-product-code'
      )?.values?.[0]?.stringValue || null

    return {
      skuStatusText: skuStatusTextProperty
        ? String(skuStatusTextProperty?.values?.[0]?.value)
        : null,
      showPrices: showPricesProperty ? Boolean(showPricesProperty?.values?.[0]?.value) : null,
      customCTALabel: customCTALabelAttr ? String(customCTALabelAttr) : null,
      customCTATarget: customCTATargetAttr ? String(customCTATargetAttr) : null,
      stockBehaviour: stockBehaviourAttr ? String(stockBehaviourAttr) : null,
      minimumStock: minimumStockArr ? Number(minimumStockArr) : 0,
      citeabProductCode: citeabProductCodeAttr ? String(citeabProductCodeAttr) : null,
    }
  }, [updatedProduct])

  const availabilityMessageArr =
    product?.properties?.find((data: any) => data?.attributeFQN === 'tenant~availability-message')
      ?.values?.[0]?.stringValue || null

  const customCTAHref = `${customCTATarget}${currentProduct?.variationProductCode}`
  const linkTargetHref = ousShowDistributorBtn ? '/distributors' : '/'
  const ctaHref = ousShowDistributorBtn ? linkTargetHref : customCTAHref

  const handleCustomCTATarget = () => {
    router.push(customCTAHref)
  }

  const handleLinkTarget = () => {
    router.push(linkTargetHref)
  }

  const maxQuantity =
    skuStatusText?.toLowerCase() === 'active' &&
    stockBehaviour?.toLowerCase() === 'denybackorder' &&
    stockAvailable >= minimumStock
      ? stockAvailable - minimumStock
      : undefined

  useEffect(() => {
    if (productCode !== variationProductCode) {
      const productPrice = productGetters.getPrice(currentProduct)
      const productPriceActual = productPrice?.special
        ? productPrice?.special
        : productPrice?.regular

      if (
        productPrice &&
        productPriceActual &&
        product?.categories?.[0]?.content?.name &&
        productGetters.getName(product) &&
        brandName
      ) {
        const value = quantity * productPriceActual
        viewItemGTM(
          productCode,
          '',
          variantProductName ? variantProductName : (productGetters.getName(product) as string),
          product?.categories?.[0]?.content?.name,
          brandName,
          value,
          variationProductCode
        )
      }
      setVariationCodeDynamic(variationProductCode)
    }
  }, [variationProductCode])

  useEffect(() => {
    if (window.location.hash === '#citations') {
      setTimeout(() => {
        const section = document.getElementById('citation-document-section')
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [citationCountVariant])

  const algoliaObjectData = [
    {
      price: productPrice?.special ? productPrice?.special : productPrice?.regular,
      quantity: quantity,
    },
  ]

  const addtocartvalue =
    (productPrice?.special ? productPrice?.special : productPrice?.regular) * quantity

  const brandKey = resolveBrandKey(brand)
  const brandConfig = getPdpBrandConfig(brand)
  const catalogNumber = variationProductCode || productCode
  const heroTitle = variantProductTitle || productName || catalogNumber || ''
  const heroFacts = buildFacts(updatedProduct, brandConfig.heroFacts, MAX_HERO_FACTS - 1)

  return {
    brandKey,
    brandConfig,
    catalogNumber,
    heroTitle,
    heroFacts,
    updatedProduct,
    currentProduct,
    isDigitalFulfillment,
    sectionTargetUrl,

    productName,
    newVariantProductAttribute,
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
    factoredProductData,

    brand,
    brandName,
    newProduct,
    variantProductName,
    variantProductTitle,
    isLoading,

    purchaseType,
    setPurchaseType,
    selectedFrequency,
    isSubscriptionPricingSelected,
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
    locationInventory,
    fulfillmentOptions,
    selectedFulfillmentOption,
    setSelectedFulfillmentOption,
    selectProductOption,
    updatedShopperEnteredValues,

    customCTALabel,
    customCTATarget,
    ctaHref,
    handleCustomCTATarget,
    handleLinkTarget,
    countryCode,
    ousShowDistributorBtn,
    ousShowPrices,

    citationCountVariant,
    citeabProductCode,
    citationApiKey,
    digitalDocumentData,

    isProductInWishlist,
    isValidForAddToWishlist,
    isWishlistLoading,
    handleWishList,

    addToCartPayload,
    isValidForAddToCart,
    addToCart,
    productsQueryIdArr,
    setProductsQueryIdArr,

    algoliaQueryId,
    algoliaObjectData,
    addtocartvalue,

    keyVal: citeabProductCode ?? 'citations',
    variationCodeDynamic,
    purchaseLocation,
    currentlocationInventory,
  }
}
