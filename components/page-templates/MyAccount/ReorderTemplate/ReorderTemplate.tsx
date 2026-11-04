import React, { useEffect, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { AccountPageHeader, accountActionButton, accountType } from '@/components/my-account/common'
import { useAuthContext, useSnackbarContext } from '@/context'
import { useAlgoliaProductSearch, useDebounce, useGetSearchedProducts } from '@/hooks'
import { useAddItemsToCurrentCart } from '@/hooks/mutations/cart/useAddItemsToCurrentCart/useAddItemsToCurrentCart'
import { productGetters } from '@/lib/getters'
import { makeGraphQLClient } from '@/lib/gql/client'
import {
  getProductLocationInventoryQuery,
  getProductPriceQuery,
  getProductVariationQuery,
} from '@/lib/gql/queries'
import { inventoryKeys } from '@/lib/react-query/queryKeys'
import type { ProductCustom } from '@/lib/types'
import {
  addToCartGTM,
  getValueOfItemList,
  mapCartItemsToGAEvent,
} from '@/lib/utils/google-tag-manager'

import type { AlgoliaProductHit } from '@/hooks'
import type { CrOrderItem, LocationInventory, Product } from '@/lib/gql/types'
import type { Theme } from '@mui/material'

interface ReorderRow {
  key: string
  catalogNumber: string
  quantity: number
  product?: Product
  isPriceResolved?: boolean
  maxQuantity?: number
}

const createEmptyRow = (): ReorderRow => ({
  key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  catalogNumber: '',
  quantity: 1,
})

const hasPrice = (price?: { price?: number | null; salePrice?: number | null } | null) =>
  Boolean(price?.salePrice || price?.price)

const INVENTORY_LOCATION_CODE = 'BETHYL'

const getPropertyValue = (properties: Product['properties'], attributeFQN: string) => {
  const value = properties?.find((property) => property?.attributeFQN === attributeFQN)?.values?.[0]
  return value?.stringValue ?? value?.value ?? null
}

const getMaxQuantity = (
  parent: Product,
  variant: Product | undefined,
  stockAvailable: number
): number | undefined => {
  const findValue = (attributeFQN: string) =>
    getPropertyValue(variant?.properties, attributeFQN) ??
    getPropertyValue(parent.properties, attributeFQN)

  const skuStatusText = findValue('tenant~sku-status-text')
  const stockBehaviour = findValue('tenant~stock-behavior-option')
  const minimumStock = Number(findValue('tenant~minimum-stock')) || 0

  return String(skuStatusText).toLowerCase() === 'active' &&
    String(stockBehaviour).toLowerCase() === 'denybackorder' &&
    stockAvailable >= minimumStock
    ? stockAvailable - minimumStock
    : undefined
}

const clampQuantity = (quantity: number, maxQuantity?: number) =>
  maxQuantity === undefined ? quantity : Math.min(quantity, maxQuantity)

const styles = {
  searchWrapper: {
    position: 'relative',
    maxWidth: '32rem',
    marginBottom: '1.5rem',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10,
    maxHeight: '18rem',
    overflowY: 'auto',
    borderRadius: '0.5rem',
  },
  searchField: {
    maxWidth: '32rem',
    '& .MuiOutlinedInput-root': {
      borderRadius: '2rem',
      backgroundColor: 'grey.100',
      paddingRight: '1rem',
    },
    '& fieldset': { border: 'none' },
    '& .MuiInputBase-input': { fontSize: '0.875rem' },
    '& .MuiInputBase-input::placeholder': { textOverflow: 'ellipsis' },
  },
  headerRow: {
    ...accountType.body,
    fontWeight: 700,
    color: 'text.primary',
    paddingBottom: '0.75rem',
  },
  row: {
    alignItems: 'flex-start',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    borderTop: '1px solid',
    borderColor: 'grey.300',
  },
  productName: {
    typography: 'body2',
    color: 'text.primary',
  },
  productMeta: {
    typography: 'caption',
    color: 'text.secondary',
  },
  placeholderText: {
    typography: 'body2',
    color: 'text.secondary',
  },
  notFoundText: {
    typography: 'body2',
    color: 'error.main',
  },
  unitPrice: {
    ...accountType.body,
    fontWeight: 700,
    textAlign: 'right',
  },
  lineTotal: {
    typography: 'caption',
    color: 'text.secondary',
    textAlign: 'right',
  },
  addRowLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    typography: 'body2',
    fontWeight: 600,
    color: 'primary.main',
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid',
    borderColor: 'grey.300',
  },
  subtotal: {
    typography: 'body2',
    color: 'text.secondary',
    marginLeft: 'auto',
  },
  actionButton: {
    ...accountActionButton,
    '&.MuiButton-contained.Mui-disabled': {
      backgroundColor: (theme: Theme) => `${theme.palette.grey[300]} !important`,
      color: (theme: Theme) => `${theme.palette.grey[600]} !important`,
      cursor: 'not-allowed',
      pointerEvents: 'auto',
    },
  },
}

const ReorderTemplate = () => {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { publicRuntimeConfig } = getConfig()

  const [rows, setRows] = useState<ReorderRow[]>([createEmptyRow()])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeRowKey, setActiveRowKey] = useState<string | null>(null)
  const [lookupTerm, setLookupTerm] = useState('')

  const debouncedSearch = useDebounce(searchTerm, publicRuntimeConfig.debounceTimeout)
  const { hits: algoliaHits, isLoading: isSearching } = useAlgoliaProductSearch({
    query: debouncedSearch,
  })

  const debouncedLookup = useDebounce(lookupTerm, publicRuntimeConfig.debounceTimeout)
  const { hits: lookupHits, isLoading: isLookupHitsLoading } = useAlgoliaProductSearch({
    query: debouncedLookup,
    hitsPerPage: 5,
  })
  const exactHit = lookupHits.find((hit) => {
    const term = debouncedLookup.trim().toLowerCase()
    return hit.sku?.toLowerCase() === term || hit.catalogNumber?.toLowerCase() === term
  })
  const {
    data: searchResult,
    isLoading: isProductLoading,
    isFetching: isProductFetching,
  } = useGetSearchedProducts({
    search: isLookupHitsLoading ? '' : exactHit?.parentId || debouncedLookup,
    pageSize: publicRuntimeConfig?.b2bProductSearchPageSize,
  })

  const isLoading = isProductLoading || isLookupHitsLoading
  const isLookupSettled =
    Boolean(lookupTerm.trim()) &&
    lookupTerm === debouncedLookup &&
    !isLookupHitsLoading &&
    !isProductFetching

  const queryClient = useQueryClient()
  const { addItemsToCurrentCart } = useAddItemsToCurrentCart()
  const { showSnackbar } = useSnackbarContext()
  const { user } = useAuthContext()

  const findProductMatch = (catalogNumber: string): Product | undefined => {
    const term = catalogNumber.trim().toLowerCase()
    if (!term) return undefined

    const items = (searchResult?.items ?? []) as Product[]
    const termHit = term === debouncedLookup.trim().toLowerCase() ? exactHit : undefined
    const sku = termHit?.sku
    const parentId = termHit?.parentId?.toLowerCase()

    const match = items.find(
      (item) =>
        productGetters.getProductId(item)?.toLowerCase() === term ||
        productGetters.getVariationProductCode(item)?.toLowerCase() === term ||
        (parentId && productGetters.getProductId(item)?.toLowerCase() === parentId)
    )

    if (!match) return undefined

    const matchedVariationCode = productGetters.getVariationProductCode(match)

    if (!sku || matchedVariationCode?.toLowerCase() === sku.toLowerCase()) return match

    return {
      ...match,
      variationProductCode: sku,
      options: matchedVariationCode ? [] : match.options,
    } as Product
  }

  const isMissingVariant = (product: Product) =>
    product.productUsage === 'Configurable' && !productGetters.getVariationProductCode(product)

  const resolveProduct = (catalogNumber: string): Product | undefined => {
    const match = findProductMatch(catalogNumber)
    return match && !isMissingVariant(match) ? match : undefined
  }

  const isGenericCatalogNumber = (catalogNumber: string) => {
    const match = findProductMatch(catalogNumber)
    return Boolean(match && isMissingVariant(match))
  }

  const updateRow = (key: string, changes: Partial<ReorderRow>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...changes } : row)))
  }

  const handleCatalogNumberChange = (key: string, value: string) => {
    updateRow(key, {
      catalogNumber: value,
      product: undefined,
      isPriceResolved: false,
      maxQuantity: undefined,
    })
    setActiveRowKey(key)
    setLookupTerm(value)
  }

  const handleCatalogNumberBlur = (key: string, value: string) => {
    const product = resolveProduct(value)
    if (!product) return

    // Keep an already resolved (priced) product; blur must not overwrite it with the raw search item
    setRows((current) =>
      current.map((row) => (row.key === key && !row.product ? { ...row, product } : row))
    )
  }

  const handleSelectSearchHit = (hit: AlgoliaProductHit) => {
    if (!hit.catalogNumber) return

    setSearchTerm('')
    setRows((current) => {
      const targetKey = current.find((row) => !row.catalogNumber.trim())?.key

      if (!targetKey) return current

      setActiveRowKey(targetKey)
      return current.map((row) =>
        row.key === targetKey ? { ...row, catalogNumber: hit.catalogNumber } : row
      )
    })
    setLookupTerm(hit.catalogNumber)
  }

  const handleRemoveRow = (key: string) => {
    setRows((current) => current.filter((row) => row.key !== key))
  }

  useEffect(() => {
    if (!activeRowKey || isLoading) return

    setRows((current) =>
      current.map((row) => {
        if (row.key !== activeRowKey || row.product) return row

        const product = resolveProduct(row.catalogNumber)
        return product ? { ...row, product } : row
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRowKey, isLoading, searchResult, exactHit])

  // Search results only carry the parent product price; fetch the variation (SKU) price.
  useEffect(() => {
    rows
      .filter((row) => row.product && !row.isPriceResolved)
      .forEach(async (row) => {
        const product = row.product as Product
        const productCode = productGetters.getProductId(product)
        const variationCode = productGetters.getVariationProductCode(product)

        try {
          const inventoryCode = variationCode || productCode
          const inventoryRequest = queryClient
            .fetchQuery({
              queryKey: inventoryKeys.inventoryParams(inventoryCode, INVENTORY_LOCATION_CODE),
              queryFn: async () => {
                const response = await makeGraphQLClient().request({
                  document: getProductLocationInventoryQuery,
                  variables: {
                    productCode: inventoryCode,
                    locationCodes: INVENTORY_LOCATION_CODE,
                  },
                })
                return (response?.productLocationInventory?.items ?? []) as LocationInventory[]
              },
              staleTime: 60 * 1000,
            })
            .catch((error) => {
              console.error('Error: reorder inventory lookup', error)
              return [] as LocationInventory[]
            })

          const priced = await queryClient.fetchQuery({
            queryKey: ['reorderProductPrice', productCode, variationCode],
            queryFn: async () => {
              const response = await makeGraphQLClient().request(
                variationCode
                  ? {
                      document: getProductVariationQuery,
                      variables: { productCode, variationProductCode: variationCode },
                    }
                  : { document: getProductPriceQuery, variables: { productCode } }
              )
              return response?.product as Product
            },
            staleTime: 60 * 1000,
          })

          const inventory = await inventoryRequest
          const maxQuantity = getMaxQuantity(product, priced, inventory?.[0]?.stockAvailable || 0)

          setRows((current) =>
            current.map((item) =>
              item.key === row.key && item.product === row.product
                ? {
                    ...item,
                    isPriceResolved: true,
                    maxQuantity,
                    quantity: clampQuantity(item.quantity, maxQuantity),
                    product: {
                      ...product,
                      price: hasPrice(priced?.price) ? priced?.price : product.price,
                      options: priced?.options?.length ? priced.options : product.options,
                    } as Product,
                  }
                : item
            )
          )
        } catch (error) {
          console.error('Error: reorder price lookup', error)
          setRows((current) =>
            current.map((item) =>
              item.key === row.key && item.product === row.product
                ? { ...item, isPriceResolved: true }
                : item
            )
          )
        }
      })
  }, [rows, queryClient])

  useEffect(() => {
    const hasEmptyRow = rows.some((row) => !row.catalogNumber.trim())

    if (!hasEmptyRow) setRows((current) => [...current, createEmptyRow()])
  }, [rows])

  const getUnitPrice = (product?: Product) => {
    const price = product ? productGetters.getPrice(product) : undefined
    return price?.special || price?.regular || 0
  }

  const filledRows = rows.filter(
    (row) => row.product && row.isPriceResolved && getUnitPrice(row.product) > 0 && row.quantity > 0
  )

  const subtotal = filledRows.reduce(
    (sum, row) => sum + getUnitPrice(row.product) * row.quantity,
    0
  )

  const totalItems = filledRows.reduce((sum, row) => sum + row.quantity, 0)

  const buildSelectedOptions = (product?: Product) =>
    (product?.options ?? [])
      .map((option) => {
        const selected = option?.values?.find((value) => value?.isSelected)

        return {
          attributeFQN: option?.attributeFQN,
          name: option?.attributeDetail?.name,
          value: selected?.value || selected?.stringValue || selected?.shopperEnteredValue,
        }
      })
      .filter((option) => option.value !== undefined && option.value !== null)

  const getSelectedOptionValues = (product?: Product) =>
    buildSelectedOptions(product)
      .map((option) => option.value)
      .filter(Boolean)
      .map(String)

  const buildCartItems = (): CrOrderItem[] =>
    filledRows.map(
      (row) =>
        ({
          product: {
            productCode: productGetters.getProductId(row.product as Product),
            variationProductCode: productGetters.getVariationProductCode(row.product as Product),
            options: buildSelectedOptions(row.product),
          },
          quantity: row.quantity,
        } as unknown as CrOrderItem)
    )

  const handleAddToCart = async () => {
    if (!filledRows.length) return

    const items = buildCartItems()

    try {
      const response = await addItemsToCurrentCart.mutateAsync({ items })

      if (response) {
        showSnackbar(t('list-added-to-cart'), 'success')
        const mappedGTMProducts = mapCartItemsToGAEvent(items)
        const valueOfCart = getValueOfItemList(mappedGTMProducts)

        addToCartGTM(user?.userId, valueOfCart, mappedGTMProducts)
      }

      router.push('/cart')
    } catch (error) {
      console.error('Error: add reorder rows to cart', error)
      showSnackbar(
        (error as { response?: { errors?: { message?: string }[] } })?.response?.errors?.[0]
          ?.message || String(t('something-went-wrong')),
        'error'
      )
    }
  }

  const visibleRows = rows
  const isSuggestionsOpen = Boolean(searchTerm.trim())

  return (
    <>
      <AccountPageHeader title={String(t('quick-order'))} />

      <Box sx={{ ...styles.searchWrapper }}>
        <TextField
          fullWidth
          size="small"
          autoComplete="off"
          placeholder={String(t('search-by-catalog-number-product-name'))}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          sx={{ ...styles.searchField }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: isSearching ? (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : null,
          }}
          inputProps={{ 'aria-label': String(t('search-by-catalog-number-product-name')) }}
        />

        {isSuggestionsOpen && (
          <Paper elevation={3} sx={{ ...styles.suggestions }}>
            <List dense disablePadding>
              {!isSearching && !algoliaHits.length && (
                <ListItem>
                  <ListItemText
                    primary={t('no-results-found')}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              )}
              {algoliaHits.map((hit) => (
                <ListItemButton key={hit.objectID} onClick={() => handleSelectSearchHit(hit)}>
                  <ListItemText
                    primary={hit.productName}
                    secondary={hit.catalogNumber}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      <Grid container sx={{ ...styles.headerRow }}>
        <Grid item xs={4} sm={3}>
          {t('catalog-number')}
        </Grid>
        <Grid item xs={2} sm={1}>
          {t('qty')}
        </Grid>
        <Grid item xs={4} sm={6}>
          {t('product')}
        </Grid>
        <Grid item xs={2} sm={2} sx={{ textAlign: 'right' }}>
          {t('unit-price')}
        </Grid>
      </Grid>

      {visibleRows.map((row) => {
        const unitPrice = getUnitPrice(row.product)
        const isPriceLoading = Boolean(row.product) && !row.isPriceResolved
        const isNotFound =
          isLookupSettled &&
          activeRowKey === row.key &&
          row.catalogNumber === lookupTerm &&
          Boolean(row.catalogNumber.trim()) &&
          !row.product
        const isLookingUp =
          !isNotFound &&
          (isLoading || lookupTerm !== debouncedLookup) &&
          activeRowKey === row.key &&
          Boolean(row.catalogNumber.trim())

        return (
          <Grid container key={row.key} sx={{ ...styles.row }}>
            <Grid item xs={4} sm={3} sx={{ paddingRight: '0.5rem' }}>
              <TextField
                size="small"
                fullWidth
                placeholder="eg: A700-131A"
                value={row.catalogNumber}
                onChange={(event) => handleCatalogNumberChange(row.key, event.target.value)}
                onBlur={(event) => handleCatalogNumberBlur(row.key, event.target.value)}
                inputProps={{ 'aria-label': String(t('catalog-number')) }}
              />
            </Grid>

            <Grid item xs={2} sm={1} sx={{ paddingRight: '0.5rem' }}>
              <TextField
                size="small"
                fullWidth
                type="number"
                disabled={!row.product || !row.isPriceResolved}
                value={row.quantity || ''}
                onChange={(event) =>
                  updateRow(row.key, {
                    quantity: clampQuantity(
                      Math.max(0, Math.floor(Number(event.target.value))),
                      row.maxQuantity
                    ),
                  })
                }
                inputProps={{ min: 0, max: row.maxQuantity, 'aria-label': String(t('qty')) }}
              />
            </Grid>

            <Grid item xs={4} sm={6}>
              {isLookingUp && <CircularProgress size={16} />}
              {!isLookingUp && row.product && (
                <>
                  <Typography component="p" sx={{ ...styles.productName }}>
                    {productGetters.getName(row.product)}
                  </Typography>
                  <Typography component="p" sx={{ ...styles.productMeta }}>
                    {productGetters.getVariationProductCodeOrProductCode(
                      row.product as ProductCustom
                    )}
                  </Typography>
                  {Boolean(getSelectedOptionValues(row.product).length) && (
                    <Typography component="p" sx={{ ...styles.productMeta }}>
                      {getSelectedOptionValues(row.product).join(', ')}
                    </Typography>
                  )}
                </>
              )}
              {isNotFound && (
                <Typography component="p" role="alert" sx={{ ...styles.notFoundText }}>
                  {isGenericCatalogNumber(row.catalogNumber)
                    ? t('enter-full-catalog-number')
                    : t('product-not-found')}
                </Typography>
              )}
              {!isLookingUp && !isNotFound && !row.product && (
                <Typography component="p" sx={{ ...styles.placeholderText }}>
                  {t('product-name-appears-here')}
                </Typography>
              )}
            </Grid>

            <Grid item xs={2} sm={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                <Box>
                  {isPriceLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Typography component="p" sx={{ ...styles.unitPrice }}>
                      {row.product ? t('currency', { val: unitPrice }) : '–'}
                    </Typography>
                  )}
                  {!isPriceLoading && row.product && row.quantity > 0 && (
                    <Typography component="p" sx={{ ...styles.lineTotal }}>
                      {t('currency', { val: unitPrice * row.quantity })}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  aria-label={`${t('remove')} ${row.catalogNumber}`}
                  onClick={() => handleRemoveRow(row.key)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        )
      })}

      <Box sx={{ ...styles.footer }}>
        <Button
          variant="text"
          sx={{ ...styles.addRowLink }}
          startIcon={<AddIcon />}
          onClick={() => setRows([...rows, createEmptyRow()])}
        >
          {t('add-row')}
        </Button>

        <Typography component="span" sx={{ ...styles.subtotal }}>
          {t('items-subtotal', { count: totalItems, subtotal: t('currency', { val: subtotal }) })}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          disableElevation
          sx={{ ...styles.actionButton }}
          onClick={handleAddToCart}
          disabled={!filledRows.length}
        >
          {t('add-to-cart')}
        </Button>
      </Box>
    </>
  )
}

export default ReorderTemplate
