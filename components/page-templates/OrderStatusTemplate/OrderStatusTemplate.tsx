import React, { useEffect, useState } from 'react'

import { Box, CircularProgress, Grid } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import KiboBreadcrumbs from '@/components/core/Breadcrumbs/KiboBreadcrumbs'
import { OrderStatusDetails, ViewOrderStatus } from '@/components/order'
import type { OrderStatusFormDataProps } from '@/components/order/ViewOrderStatus/ViewOrderStatus'
import { useGetCustomerOrders } from '@/hooks'

import type { CrOrder } from '@/lib/gql/types'

const styles = {
  breadcrumbsClass: {
    // margin: '1.5rem 0',
    padding: { lg: '4px 0 16px 0' },
  },
}

const OrderStatusTemplate = () => {
  const router = useRouter()
  // Deep-linked from "Track Order" via ?orderNumber=&billingEmail=
  const { orderNumber: queryOrderNumber, billingEmail: queryBillingEmail } = router.query
  const hasDeepLinkedOrder = Boolean(queryOrderNumber && queryBillingEmail)

  const [queryFilters, setQueryFilters] = useState<OrderStatusFormDataProps>({
    billingEmail: typeof queryBillingEmail === 'string' ? queryBillingEmail : '',
    orderNumber: typeof queryOrderNumber === 'string' ? queryOrderNumber : '',
    isRefetching: hasDeepLinkedOrder,
  })

  const { t } = useTranslation('common')
  const { data: orderCollection, isFetching } = useGetCustomerOrders(queryFilters)
  const { items = [], pageCount } = orderCollection
  const order = items && (items[0] as CrOrder)
  const breadCrumbsList = [
    { text: t('home'), link: '/' },
    { text: t('order-status'), link: '/order-status' },
  ]
  const handleOrderStatusSubmit = (data: OrderStatusFormDataProps) => {
    setQueryFilters({ ...data, isRefetching: true })
  }

  useEffect(() => {
    if (isFetching) setQueryFilters({ ...queryFilters, isRefetching: false })
  }, [isFetching])

  // `pageCount` only exists once a fetch has completed - a pending lookup isn't "no order found".
  const isLookingUpOrder =
    Boolean(queryFilters.orderNumber && queryFilters.billingEmail) && pageCount === undefined

  return (
    <Grid container px={1}>
      <Grid item xs={12} sx={{ ...styles.breadcrumbsClass }}>
        <KiboBreadcrumbs breadcrumbs={breadCrumbsList} />
      </Grid>
      <Grid item xs={12}>
        {order?.id ? (
          <OrderStatusDetails order={order} />
        ) : isLookingUpOrder ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ViewOrderStatus
            onOrderStatusSubmit={handleOrderStatusSubmit}
            lookupWarningMessage={pageCount === 0 ? t('no-orders-found') : ''}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default OrderStatusTemplate
