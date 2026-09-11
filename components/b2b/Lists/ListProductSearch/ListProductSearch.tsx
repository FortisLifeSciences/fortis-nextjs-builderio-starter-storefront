import React, { useState } from 'react'

import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
} from '@mui/material'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'

import { useSnackbarContext } from '@/context'
import { useAlgoliaProductSearch, useDebounce, useGetSearchedProducts } from '@/hooks'
import { productGetters } from '@/lib/getters'
import type { ProductCustom } from '@/lib/types'

import type { AlgoliaProductHit } from '@/hooks'
import type { Product } from '@/lib/gql/types'

interface ListProductSearchProps {
  onAddProduct: (product: Product) => void
}

const styles = {
  wrapper: {
    position: 'relative',
    maxWidth: '26rem',
  },
  field: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '2rem',
      backgroundColor: 'grey.100',
      minHeight: '2.625rem',
    },
    '& fieldset': { border: 'none' },
    '& .MuiOutlinedInput-input': { fontSize: '0.9375rem' },
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
}

const ListProductSearch = (props: ListProductSearchProps) => {
  const { onAddProduct } = props
  const { t } = useTranslation('common')
  const { publicRuntimeConfig } = getConfig()
  const { showSnackbar } = useSnackbarContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [pendingCode, setPendingCode] = useState('')

  const debouncedSearch = useDebounce(searchTerm, publicRuntimeConfig.debounceTimeout)
  const { hits, isLoading: isSearching } = useAlgoliaProductSearch({ query: debouncedSearch })

  const debouncedCode = useDebounce(pendingCode, publicRuntimeConfig.debounceTimeout)
  const { data: searchResult, isLoading } = useGetSearchedProducts({
    search: debouncedCode || debouncedSearch,
    pageSize: publicRuntimeConfig?.b2bProductSearchPageSize,
  })

  const kiboMatches = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    if (!term || pendingCode) return []

    const algoliaCodes = new Set(hits.map((hit) => hit.catalogNumber?.toLowerCase()))

    return (searchResult?.items ?? [])
      .filter((item) => {
        const code = productGetters.getVariationProductCodeOrProductCode(item as ProductCustom)
        return (
          Boolean(code) &&
          code.toLowerCase().includes(term) &&
          !algoliaCodes.has(code.toLowerCase())
        )
      })
      .map((item) => ({
        objectID: `kibo-${productGetters.getVariationProductCodeOrProductCode(
          item as ProductCustom
        )}`,
        catalogNumber: productGetters.getVariationProductCodeOrProductCode(item as ProductCustom),
        productName: productGetters.getName(item as ProductCustom),
      })) as AlgoliaProductHit[]
  }, [debouncedSearch, pendingCode, hits, searchResult])

  const suggestions = [...hits, ...kiboMatches]

  const resolveProduct = (catalogNumber: string): Product | undefined => {
    const term = catalogNumber.trim().toLowerCase()
    if (!term) return undefined

    return (searchResult?.items ?? []).find(
      (item) =>
        productGetters.getProductId(item as Product)?.toLowerCase() === term ||
        productGetters.getVariationProductCode(item as Product)?.toLowerCase() === term
    ) as Product | undefined
  }

  React.useEffect(() => {
    if (!pendingCode || isLoading || debouncedCode !== pendingCode) return

    const product = resolveProduct(pendingCode)

    if (product) {
      onAddProduct(product)
    } else {
      showSnackbar(String(t('no-results-found')), 'error')
    }

    setPendingCode('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCode, debouncedCode, isLoading, searchResult])

  const handleSelect = (hit: AlgoliaProductHit) => {
    if (!hit.catalogNumber) return

    setSearchTerm('')
    setPendingCode(hit.catalogNumber)
  }

  const handleSubmitTypedCode = () => {
    const typed = searchTerm.trim()
    if (!typed) return

    const exactHit = suggestions.find(
      (hit) => hit.catalogNumber?.toLowerCase() === typed.toLowerCase()
    )

    setSearchTerm('')
    setPendingCode(exactHit?.catalogNumber ?? typed)
  }

  const isOpen = Boolean(searchTerm.trim())

  return (
    <Box sx={{ ...styles.wrapper }}>
      <TextField
        fullWidth
        size="small"
        autoComplete="off"
        placeholder={String(t('search-by-catalog-number-product-name'))}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleSubmitTypedCode()
          }
        }}
        sx={{ ...styles.field }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment:
            isSearching || Boolean(pendingCode) ? (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : null,
        }}
        inputProps={{ 'aria-label': String(t('search-by-catalog-number-product-name')) }}
      />

      {isOpen && (
        <Paper elevation={3} sx={{ ...styles.suggestions }}>
          <List dense disablePadding>
            {!isSearching && !isLoading && !suggestions.length && (
              <ListItem>
                <ListItemText
                  primary={t('no-results-found')}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            )}
            {suggestions.map((hit) => (
              <ListItemButton key={hit.objectID} onClick={() => handleSelect(hit)}>
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
  )
}

export default ListProductSearch
