import React, { useMemo, useState } from 'react'

import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import OrderHistoryCard from './OrderHistoryCard'
import { AccountPageHeader, accountActionButton, accountType } from '@/components/my-account/common'
import { useAuthContext, useSnackbarContext } from '@/context'
import { useGetCustomerOrders, useProductCardActions } from '@/hooks'
import { useAddItemsToCurrentCart } from '@/hooks/mutations/cart/useAddItemsToCurrentCart/useAddItemsToCurrentCart'
import { FacetListForHistory } from '@/lib/constants'
import { orderGetters, userGetters } from '@/lib/getters'
import { buildOrdersCsv, downloadCsv } from '@/lib/helpers'
import {
  addToCartGTM,
  getValueOfItemList,
  mapCartItemsToGAEvent,
} from '@/lib/utils/google-tag-manager'

import type { CrOrder, CrOrderItem, CustomerAccount } from '@/lib/gql/types'

interface OrderHistoryTemplateProps {
  user: CustomerAccount
  queryFilters?: string[]
}

const DEFAULT_TIME_FILTER = 'M-3'
const PAGE_SIZE = 5

const ORDER_STATUSES = ['Accepted', 'Processing', 'Completed', 'Cancelled']

const styles = {
  controlsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  control: {
    minWidth: '9rem',
  },
  controlLabel: {
    typography: 'caption',
    color: 'text.secondary',
    display: 'block',
    marginBottom: '0.25rem',
  },
  searchField: {
    marginBottom: '1.5rem',
    maxWidth: '32rem',
    '& .MuiOutlinedInput-root': {
      borderRadius: '2rem',
      backgroundColor: 'grey.100',
    },
    '& fieldset': { border: 'none' },
  },
  select: {
    borderRadius: '0.375rem',
    '& .MuiSelect-select': { typography: 'body2', padding: '0.5rem 0.75rem' },
  },
  clearButton: {
    typography: 'body2',
    fontWeight: 600,
    color: 'primary.main',
  },
  sectionTitle: {
    ...accountType.cardTitle,
    fontWeight: 700,
    marginBottom: '1rem',
  },
  emptyState: {
    ...accountType.body,
    color: 'text.secondary',
    padding: '2rem 0',
  },
  exportButton: accountActionButton,
  loadMore: {
    display: 'block',
    margin: '1rem auto 0',
    typography: 'body2',
    fontWeight: 600,
    color: 'primary.main',
  },
}

const MyAccountOrderHistoryTemplate = (props: OrderHistoryTemplateProps) => {
  const { user, queryFilters } = props
  const { t } = useTranslation('common')
  const router = useRouter()

  const [timeFilter, setTimeFilter] = useState<string>(queryFilters?.[0] ?? DEFAULT_TIME_FILTER)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('submittedDate desc')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [submittedSearch, setSubmittedSearch] = useState<string>('')
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE)

  const { data: orderCollection, isFetching } = useGetCustomerOrders({
    filters: [timeFilter],
    status: statusFilter || undefined,
    sortBy,
    pageSize,
    startIndex: 0,
    orderNumber: submittedSearch || undefined,
    isRefetching: true,
  })

  const { addItemsToCurrentCart } = useAddItemsToCurrentCart()
  const { handleDeleteCurrentCart } = useProductCardActions()
  const { showSnackbar } = useSnackbarContext()
  const { user: authUser } = useAuthContext()

  const items = (orderCollection?.items ?? []) as CrOrder[]
  const totalCount = orderCollection?.totalCount ?? 0
  const organizationName = userGetters.getCompanyOrOrganization(user)

  const timeOptions = useMemo(() => FacetListForHistory, [])

  const handleClearFilters = () => {
    setTimeFilter(DEFAULT_TIME_FILTER)
    setStatusFilter('')
    setSortBy('submittedDate desc')
    setSearchTerm('')
    setSubmittedSearch('')
    setPageSize(PAGE_SIZE)
  }

  const handleReorder = async (order: CrOrder) => {
    const orderItems = (order?.items ?? []) as CrOrderItem[]

    try {
      await handleDeleteCurrentCart()
      const response = await addItemsToCurrentCart.mutateAsync({ items: orderItems })

      if (response) {
        showSnackbar(t('list-added-to-cart'), 'success')
        const mappedGTMProducts = mapCartItemsToGAEvent(orderItems)
        const valueOfCart = getValueOfItemList(mappedGTMProducts)

        addToCartGTM(authUser?.userId, valueOfCart, mappedGTMProducts)
      }

      router.push('/cart')
    } catch (error) {
      console.error('Error: reorder from order history', error)
    }
  }

  const handleExportCsv = () => {
    downloadCsv(buildOrdersCsv(items), `order-history-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <>
      <AccountPageHeader
        title={String(t('order-history'))}
        action={
          <Button
            variant="outlined"
            color="primary"
            sx={{ ...styles.exportButton }}
            onClick={handleExportCsv}
            disabled={!items.length}
          >
            {t('export-as-csv')}
          </Button>
        }
      />

      <TextField
        fullWidth
        size="small"
        placeholder={String(t('search-orders-placeholder'))}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') setSubmittedSearch(searchTerm.trim())
        }}
        onBlur={() => setSubmittedSearch(searchTerm.trim())}
        sx={{ ...styles.searchField }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        inputProps={{ 'aria-label': String(t('search-orders-placeholder')) }}
      />

      <Box sx={{ ...styles.controlsRow }}>
        <Box sx={{ ...styles.control }}>
          <Typography component="span" sx={{ ...styles.controlLabel }}>
            {t('time')}
          </Typography>
          <Select
            fullWidth
            size="small"
            value={timeFilter}
            onChange={(event) => setTimeFilter(event.target.value)}
            sx={{ ...styles.select }}
            inputProps={{ 'aria-label': String(t('time')) }}
          >
            {timeOptions.map((option) => (
              <MenuItem key={option.filterValue} value={option.filterValue}>
                {t(option.label)}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ ...styles.control }}>
          <Typography component="span" sx={{ ...styles.controlLabel }}>
            {t('sort')}
          </Typography>
          <Select
            fullWidth
            size="small"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            sx={{ ...styles.select }}
            inputProps={{ 'aria-label': String(t('sort')) }}
          >
            <MenuItem value="submittedDate desc">{t('newest-first')}</MenuItem>
            <MenuItem value="submittedDate asc">{t('oldest-first')}</MenuItem>
          </Select>
        </Box>

        <Box sx={{ ...styles.control }}>
          <Typography component="span" sx={{ ...styles.controlLabel }}>
            {t('status')}
          </Typography>
          <Select
            fullWidth
            size="small"
            displayEmpty
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            sx={{ ...styles.select }}
            inputProps={{ 'aria-label': String(t('status')) }}
          >
            <MenuItem value="">{t('all')}</MenuItem>
            {ORDER_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Button variant="text" sx={{ ...styles.clearButton }} onClick={handleClearFilters}>
          {t('clear-filter')}
        </Button>
      </Box>

      <Typography component="h2" sx={{ ...styles.sectionTitle }}>
        {t('orders')}
      </Typography>

      {isFetching && !items.length && <CircularProgress />}

      {!isFetching && !items.length && (
        <Typography sx={{ ...styles.emptyState }}>{t('no-orders-found')}</Typography>
      )}

      {items.map((order) => (
        <OrderHistoryCard
          key={orderGetters.getId(order)}
          order={order}
          organizationName={organizationName}
          onReorder={() => handleReorder(order)}
          actions={[
            {
              id: 'reorder',
              label: String(t('reorder')),
              onClick: () => handleReorder(order),
            },
          ]}
        />
      ))}

      {items.length < totalCount && (
        <Button
          variant="text"
          sx={{ ...styles.loadMore }}
          onClick={() => setPageSize(pageSize + PAGE_SIZE)}
          disabled={isFetching}
        >
          {t('load-more')}
        </Button>
      )}
    </>
  )
}

export default MyAccountOrderHistoryTemplate
