import React, { useEffect, useRef, useState } from 'react'

import { Box, Button, ButtonBase, Typography } from '@mui/material'
import * as cookieNext from 'cookies-next'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { ProductCardLayoutStyles as styles } from '@/components/product/ProductHit/ProductCardLayout.styles'
import {
  getProductCardState,
  type ProductCardRecord,
  type ProductCardState,
} from '@/components/product/ProductHit/productCardState'
import ProductSizePicker from '@/components/product/ProductHit/ProductSizePicker'
import { type ProductSize, useProductSizes } from '@/components/product/ProductHit/useProductSizes'
import { useAuthContext, useSnackbarContext } from '@/context'
import { useAddCartItem, useGetProductInventory } from '@/hooks'
import { hasAnalyticsConsent } from '@/lib/consent/consent'
import { FulfillmentOptions } from '@/lib/constants'
import { addToCartGTMPDP } from '@/lib/utils/google-tag-manager'

export type ProductCardBuyBoxRecord = ProductCardRecord & {
  objectID?: string
  product_name?: string
  product_name_variant?: string
  brand?: string
  category_labels?: string | string[]
}

type ProductCardBuyBoxProps = {
  hit: ProductCardBuyBoxRecord
  productHref: string
  queryId?: string
  position?: number
  algoliaIndex?: string
}

type AddToCartPayload = NonNullable<ProductCardState['addToCart']>

type AddToCartButtonProps = Omit<ProductCardBuyBoxProps, 'hit'> & {
  hit: ProductCardBuyBoxRecord
  payload: AddToCartPayload
  stockCheck: boolean
  minimumStock: number
  price: number
  buttonRef?: React.Ref<HTMLButtonElement>
}

const INVENTORY_LOCATION = 'BETHYL'
const ADDED_FEEDBACK_MS = 1400

const firstCategoryLabel = (labels: ProductCardBuyBoxRecord['category_labels']): string => {
  const list = Array.isArray(labels)
    ? labels
    : Array.from(String(labels ?? '').matchAll(/'([^']*)'|"([^"]*)"/g), (m) => m[1] ?? m[2])
  return list.find((label) => label && label !== 'Products') ?? ''
}

const rememberQueryId = (productCode: string, queryId?: string | null) => {
  if (!queryId || !productCode || !hasAnalyticsConsent()) return
  try {
    const stored = JSON.parse(localStorage.getItem('queryIdArray') || '[]')
    const list: { ProductCode?: string; queryId: string }[] = Array.isArray(stored) ? stored : []
    const index = list.findIndex((item) => item.ProductCode === productCode)
    if (index === -1) list.push({ ProductCode: productCode, queryId })
    else list[index] = { ...list[index], queryId }
    localStorage.setItem('queryIdArray', JSON.stringify(list))
  } catch {
    return
  }
}

const useCardState = (hit: ProductCardRecord, productHref: string): ProductCardState | null => {
  const [isMounted, setIsMounted] = useState(false)
  const [countryCode, setCountryCode] = useState<string | null>(null)

  useEffect(() => {
    const cookie = cookieNext.getCookie('ipBasedCountryCode')
    setCountryCode(typeof cookie === 'string' ? cookie : null)
    setIsMounted(true)
  }, [])

  return getProductCardState(hit, { countryCode, isMounted, productHref })
}

const AddToCartButton = ({
  hit,
  payload,
  stockCheck,
  minimumStock,
  price,
  productHref,
  queryId,
  position,
  algoliaIndex,
  buttonRef,
}: AddToCartButtonProps) => {
  const { t } = useTranslation('common')
  const { user } = useAuthContext()
  const { addToCart } = useAddCartItem()
  const { showSnackbar } = useSnackbarContext()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [added])

  const inventory = useGetProductInventory(
    stockCheck ? payload.variationProductCode : '',
    stockCheck ? INVENTORY_LOCATION : ''
  )

  const stockAvailable = inventory.data?.[0]?.stockAvailable ?? 0
  const stockOk = !stockCheck || (inventory.isSuccess && stockAvailable >= minimumStock)
  const stockPending = stockCheck && inventory.isLoading

  if (!stockOk && !stockPending) {
    return (
      <Button component={Link} href={productHref} title={t('view-details')}>
        {t('view-details')}
      </Button>
    )
  }

  const searchContext = Boolean(queryId)

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    rememberQueryId(
      payload.variationProductCode,
      queryId || (typeof window !== 'undefined' ? localStorage.getItem('algoliaQueryId') : null)
    )
    try {
      const cartResponse = await addToCart.mutateAsync({
        product: {
          productCode: payload.productCode,
          variationProductCode: payload.variationProductCode,
          fulfillmentMethod: FulfillmentOptions.SHIP,
          options: payload.options,
        },
        quantity: payload.quantity,
      })
      if (!cartResponse?.id) {
        showSnackbar(t('add-to-cart-error'), 'error')
        return
      }
      setAdded(true)
      addToCartGTMPDP(
        cartResponse?.total,
        user?.userId,
        payload.productCode,
        (hit.product_name ?? '').replace(/[^a-zA-Z0-9 -]/g, ''),
        firstCategoryLabel(hit.category_labels),
        hit.brand ?? '',
        payload.variationProductCode,
        cartResponse?.product?.price?.price,
        payload.quantity
      )
    } catch (err) {
      console.error(err)
      showSnackbar(t('add-to-cart-error'), 'error')
    }
  }

  return (
    <Button
      ref={buttonRef}
      type="button"
      className={`${searchContext ? 'add-to-cart-button-search' : 'add-to-cart-button'}${
        added ? ' added' : ''
      }`}
      onClick={handleClick}
      disabled={stockPending || addToCart.isPending}
      data-insights-object-id={payload.variationProductCode}
      data-insights-query-id={queryId || undefined}
      data-insights-position={position}
      data-insights-object-data={JSON.stringify([{ price, quantity: payload.quantity }])}
      data-insights-product-price={JSON.stringify(price * payload.quantity)}
      data-insights-currency={JSON.stringify('USD')}
      data-insights-index={algoliaIndex || 'products'}
    >
      {added ? `${t('added')} ✓` : t('add-to-cart')}
    </Button>
  )
}

const ProductCardBuyBox = (props: ProductCardBuyBoxProps): JSX.Element | null => {
  const { hit, productHref, queryId, position, algoliaIndex } = props
  const { t } = useTranslation('common')
  const state = useCardState(hit, productHref)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const addToCartRef = useRef<HTMLButtonElement>(null)
  const focusAfterSelect = useRef(false)

  const choosesSize = state?.button.kind === 'chooseSize'
  const sizes = useProductSizes(
    hit.parent_id ?? '',
    choosesSize && pickerOpen,
    hit.brand_code?.toLowerCase() === 'arista'
  )

  useEffect(() => {
    if (!focusAfterSelect.current || !selectedSize) return
    focusAfterSelect.current = false
    addToCartRef.current?.focus({ preventScroll: true })
  }, [selectedSize])

  if (!state) return null

  const { button } = state
  const insightsLinkProps = {
    'data-insights-object-id': hit.sku,
    'data-insights-query-id': queryId || undefined,
    'data-insights-position': position,
    'data-insights-index': algoliaIndex || 'products',
  }
  const sharedButtonProps = { hit, productHref, queryId, position, algoliaIndex }

  const handleSelect = (size: ProductSize) => {
    focusAfterSelect.current = true
    setSelectedSize(size)
    setPickerOpen(false)
  }

  let cta: React.ReactNode = null
  if (button.kind === 'addToCart' && state.addToCart) {
    cta = (
      <AddToCartButton
        {...sharedButtonProps}
        payload={state.addToCart}
        stockCheck={button.stockCheck}
        minimumStock={button.minimumStock}
        price={state.price ?? 0}
      />
    )
  } else if (button.kind === 'chooseSize' && selectedSize) {
    cta = (
      <AddToCartButton
        key={selectedSize.variationProductCode}
        {...sharedButtonProps}
        buttonRef={addToCartRef}
        payload={{
          productCode: hit.parent_id ?? '',
          variationProductCode: selectedSize.variationProductCode,
          options: selectedSize.options,
          quantity: state.addToCart?.quantity ?? 1,
        }}
        stockCheck={button.stockCheck}
        minimumStock={button.minimumStock}
        price={selectedSize.price ?? 0}
      />
    )
  } else if (button.kind === 'chooseSize') {
    cta = (
      <Button type="button" aria-haspopup="dialog" onClick={() => setPickerOpen(true)}>
        {t('choose-a-size')}
      </Button>
    )
  } else if (button.kind === 'customCta' || button.kind === 'distributors') {
    cta = (
      <Button
        component={Link}
        href={button.href}
        className={queryId ? 'custom-CTA-button-search' : 'custom-CTA-button'}
        {...insightsLinkProps}
      >
        {button.kind === 'customCta' ? button.label : t('distributors')}
      </Button>
    )
  } else if (button.kind === 'pdpLink') {
    cta = (
      <Button component={Link} href={button.href}>
        {t('view-details')}
      </Button>
    )
  }

  const shownPrice = selectedSize ? selectedSize.price : state.price
  let priceText: string | null = null
  if (state.priceVisible && shownPrice !== null) {
    const formatted = t('currency', { val: shownPrice })
    priceText =
      state.sizeCount !== null && !selectedSize ? t('price-from', { price: formatted }) : formatted
  }

  let subline: React.ReactNode = null
  if (selectedSize) {
    subline = (
      <ButtonBase
        sx={styles.sizeChange}
        aria-haspopup="dialog"
        aria-label={t('change-size', { size: selectedSize.label })}
        onClick={() => setPickerOpen(true)}
      >
        {selectedSize.label}
      </ButtonBase>
    )
  } else if (state.sizeCount !== null) {
    subline = t('sizes-count', { count: state.sizeCount })
  } else if (state.sizeLabel) {
    subline = state.sizeLabel
  }

  return (
    <Box sx={styles.buyBox} data-testid="product-card-buy-box">
      <Box sx={styles.priceLine}>
        {priceText !== null ? (
          <Typography variant="inherit" component="p" sx={styles.price}>
            {priceText}
          </Typography>
        ) : (
          <Typography variant="inherit" component="p" sx={styles.priceOnRequest}>
            {t('price-on-request')}
          </Typography>
        )}
        {subline && (
          <Typography variant="inherit" component="p" sx={styles.sizeLine}>
            {subline}
          </Typography>
        )}
      </Box>
      {state.note === 'nonDistributor' && (
        <Typography variant="inherit" component="p" sx={styles.buyNote}>
          {t('nonDistributorMessage')}
        </Typography>
      )}
      {cta && <Box sx={styles.buyAction}>{cta}</Box>}
      {choosesSize && (
        <ProductSizePicker
          open={pickerOpen}
          productName={hit.product_name ?? ''}
          productHref={productHref}
          sizes={sizes.data}
          isLoading={sizes.isLoading}
          isError={sizes.isError}
          priceVisible={state.priceVisible}
          selectedCode={selectedSize?.variationProductCode ?? null}
          onSelect={handleSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </Box>
  )
}

export default ProductCardBuyBox
