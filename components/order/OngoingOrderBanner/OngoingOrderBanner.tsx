import React from 'react'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useAuthContext } from '@/context'
import { useGetCustomerOrders } from '@/hooks'
import { OrderStatus } from '@/lib/constants'
import { orderGetters } from '@/lib/getters'

import type { CrOrder } from '@/lib/gql/types'

// Anything not in this list (e.g. 'Created', 'Processing', 'Accepted') counts as "ongoing".
const closedStatuses: string[] = [
  OrderStatus.COMPLETED,
  OrderStatus.CANCELED,
  OrderStatus.ABANDONED,
]

const OngoingOrderBanner = () => {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { user } = useAuthContext()

  const { data: orderCollection } = useGetCustomerOrders({
    filters: ['M-6'],
    isRefetching: true,
  })
  const orders = (orderCollection?.items || []) as CrOrder[]

  const ongoingOrder = orders
    .filter((order) => !closedStatuses.includes(orderGetters.getOrderStatus(order)))
    .sort(
      (a, b) =>
        new Date(b?.submittedDate as string).getTime() -
        new Date(a?.submittedDate as string).getTime()
    )[0]

  if (!ongoingOrder) return null

  const handleCheckDeliveryStatus = () => {
    router.push(
      `/order-status?${new URLSearchParams({
        orderNumber: String(orderGetters.getOrderNumber(ongoingOrder) ?? ''),
        billingEmail: user?.emailAddress ?? '',
      }).toString()}`
    )
  }

  return (
    <Box
      data-testid="ongoing-order-banner"
      sx={{
        backgroundColor: '#DFE6FF',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '1.5rem',
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <LocalShippingOutlinedIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h3" sx={{ color: 'primary.main' }}>
          {t('ongoing-order')}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        onClick={handleCheckDeliveryStatus}
        sx={{ cursor: 'pointer' }}
      >
        <Typography sx={{ color: 'primary.main', fontSize: '15px' }}>
          {t('check-delivery-status')}
        </Typography>
        <ChevronRightIcon sx={{ color: 'primary.main' }} />
      </Stack>
    </Box>
  )
}

export default OngoingOrderBanner
