import { useEffect, useState } from 'react'

import * as cookieNext from 'cookies-next'
import router from 'next/router'

import {
  getPdpBrandConfig,
  resolveBrandKey,
  HERO_FACT_FQNS,
  MAX_HERO_FACTS,
} from './pdpBrandConfig'
import { buildFacts } from './pdpProperties'
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
import GetThemeSettings from '@/src/pages/api/getThemeSettings'

import type { Product, ProductPrice, FilteredProduct } from '@/lib/gql/types'

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
    PDPCustomAndBulkDisplayContentSection,
    getCurrentProduct,
  } = params

  const [updatedProduct, setUpdatedProduct] = useState(product)
  const [minQuantity, setMinQuantity] = useState(1)
  const isDigitalFulfillment = product.fulfillmentTypesSupported?.some(
    (type) => type === FulfillmentOptionsConstant.DIGITAL
  )

  const sectionTargetUrl = PDPCustomAndBulkDisplayContentSection?.data?.targetUrl
  const [purchaseType, setPurchaseType] = useState<string>(PurchaseTypes.ONETIMEPURCHASE)
  const [selectedFrequency, setSelectedFrequency] = useState<string>('')
  const [isSubscriptionPricingSelected, setIsSubscriptionPricingSelected] = useState<boolean>(false)
  const [skuStatusText, setSkuStatusText] = useState<string | null>('')
  const [showPrices, setShowPrices] = useState<boolean | null>()
  const [customCTALabel, setcustomCTALabel] = useState<string | null>('')
  const [customCTATarget, setcustomTarget] = useState<string | null>('')
  const [stockBehaviour, setStockBehaviourArr] = useState<string | null>('')
  const [minimumStock, setMinimumStock] = useState<number>(0)
  const [citationCountVariant, setCitationCountVariant] = useState<number>(0)
  const [citeabProductCode, setCiteabProductCodeAttr] = useState<string | null>('')
  const [keyVal, setKey] = useState(0)
  const [citationApiKey, setCitationApiKey] = useState<string | null>('')

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
  })

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
  const [variationCodeDynamic, setVariationCodeDynamic] = useState<string>()
  const [variantProductTitle, setVariantProductTitle] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
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

  const getModifiedOptionData = (options: any) => {
    const variationMap = new Map()
    productVariations?.forEach((variation) => {
      if (variation?.option && variation.option.length > 0) {
        const variationValue = variation.option[0]?.value
        variationMap.set(variationValue, {
          childPriority: variation.childPriority,
          price: variation.price,
          variationProductCode: variation.variationProductCode,
        })
      }
    })

    options?.selectOptions?.forEach((selectOption: { values: any[] }) => {
      selectOption?.values?.forEach((optionValue) => {
        if (optionValue && variationMap.has(optionValue.value)) {
          const variationData = variationMap.get(optionValue.value)

          if (variationData) {
            optionValue.childPriority = variationData.childPriority
            optionValue.price = { ...variationData.price }
            optionValue.variationProductCode = variationData.variationProductCode
          }
        }
      })

      selectOption?.values?.sort((a, b) => {
        if (a?.childPriority === undefined && b?.childPriority === undefined) return 0
        if (a?.childPriority === undefined) return 1
        if (b?.childPriority === undefined) return -1
        return a?.childPriority - b?.childPriority
      })
    })
    return options
  }

  useEffect(() => {
    const fetchOptionData = async () => {
      const optionData = getModifiedOptionData(productOptions)
      let selectedValue = sliceValue
        ? sliceValue
        : optionData?.selectOptions?.[0]?.values?.[0]?.value
      const selectedValueFromUrl = selectedUrlVariant
        ? optionData?.selectOptions?.[0]?.values?.find(
            (value: any) => value.variationProductCode === selectedUrlVariant
          )?.value
        : null
      selectedValue = selectedValueFromUrl ? selectedValueFromUrl : selectedValue
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

  useEffect(() => {
    const mergeProductProperties = () => {
      if (!product || !currentProduct) return

      const currentProductMap = new Map(
        currentProduct?.properties?.map((item: any) => [item.attributeFQN, item])
      )

      let mergedProperties = product?.properties?.filter(
        (item: any) => !currentProductMap?.has(item.attributeFQN)
      )

      mergedProperties = mergedProperties
        ?.filter((property: any) => !variantProperties.includes(property.attributeFQN))
        ?.concat(currentProduct?.properties || [])

      setUpdatedProduct({ ...product, properties: mergedProperties })
    }
    const variantTitlePropertyLength = currentProduct?.properties?.find(
      (data: any) => data?.attributeFQN === 'tenant~variant-product-name'
    )?.values?.length

    const variantTitle =
      currentProduct?.properties?.find(
        (data: any) => data?.attributeFQN === 'tenant~variant-product-name'
      )?.values?.[0]?.stringValue || null
    if (variantTitlePropertyLength === 1) {
      setIsLoading(false)
      setVariantProductTitle(variantTitle as string)
    }
    mergeProductProperties()
    forceRender()
  }, [product, currentProduct])

  useEffect(() => {
    const citationCountVariantAttr =
      currentProduct?.properties?.find(
        (data: any) => data?.attributeFQN === 'tenant~citation-count-variant'
      )?.values?.[0]?.value || null
    setCitationCountVariant(citationCountVariantAttr ? Number(citationCountVariantAttr) : 0)
  }, [currentProduct])

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await GetThemeSettings()
      setCitationApiKey(settings?.data?.citationsApiKey)
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    const skuStatusTextProperty = updatedProduct?.properties?.find(
      (prop) => prop?.attributeFQN === 'tenant~sku-status-text'
    )

    const showPricesProperty = updatedProduct?.properties?.find(
      (prop) => prop?.attributeFQN === 'tenant~show-prices'
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

    setSkuStatusText(
      skuStatusTextProperty ? String(skuStatusTextProperty?.values?.[0]?.value) : null
    )

    setShowPrices(showPricesProperty ? Boolean(showPricesProperty?.values?.[0]?.value) : null)
    setcustomCTALabel(customCTALabelAttr ? String(customCTALabelAttr) : null)
    setcustomTarget(customCTATargetAttr ? String(customCTATargetAttr) : null)
    setStockBehaviourArr(stockBehaviourAttr ? String(stockBehaviourAttr) : null)
    setMinimumStock(minimumStockArr ? Number(minimumStockArr) : 0)

    setCiteabProductCodeAttr(citeabProductCodeAttr ? String(citeabProductCodeAttr) : null)
  }, [updatedProduct])

  const availabilityMessageArr =
    product?.properties?.find((data: any) => data?.attributeFQN === 'tenant~availability-message')
      ?.values?.[0]?.stringValue || null

  const handleCustomCTATarget = () => {
    const targetPath = `${customCTATarget}${currentProduct?.variationProductCode}`
    router.push(targetPath)
  }

  const handleLinkTarget = () => {
    const targetPath = ousShowDistributorBtn ? '/distributors' : '/'
    router.push(targetPath)
  }

  const maxQuantity =
    skuStatusText?.toLowerCase() === 'active' &&
    stockBehaviour?.toLowerCase() === 'denybackorder' &&
    stockAvailable >= minimumStock
      ? stockAvailable - minimumStock
      : undefined

  const forceRender = () => {
    setKey((prevKey) => prevKey + 1)
  }

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
  const heroFacts = buildFacts(updatedProduct, HERO_FACT_FQNS, MAX_HERO_FACTS - 1)

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

    keyVal,
    variationCodeDynamic,
    purchaseLocation,
    currentlocationInventory,
  }
}
