/** @format */
import { ReactNode } from 'react'

import { Card, Typography, Box, CardContent, Divider } from '@mui/material'

import { OrderPriceProps } from '../OrderPrice/OrderPrice'
import { OrderPrice } from '@/components/common'

import type { Checkout, CrCart, CrOrder } from '@/lib/gql/types'

interface OrderSummaryProps<T extends CrCart | CrOrder | Checkout> extends OrderPriceProps<T> {
  nameLabel: string
  backLabel?: string
  checkoutLabel?: string
  shippingLabel?: string
  taxLabel?: string
  children?: ReactNode
}

const styles = {
  boxStyle: {
    lineHeight: '1.063rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
  headerStyle: {
    lineHeight: '1.5rem',
    textAlign: 'left',
  },
}

const OrderSummary = <T extends CrCart | CrOrder | Checkout>(props: OrderSummaryProps<T>) => {
  const {
    nameLabel,
    subTotalLabel,
    shippingTotalLabel,
    totalLabel,
    orderDetails,
    handlingLabel,
    taxLabel,

    isShippingTaxIncluded,
    promoComponent,
  } = props

  const orderPriceProps: OrderPriceProps<T> = {
    subTotalLabel,
    shippingTotalLabel,
    totalLabel,
    handlingLabel,
    taxLabel,

    promoComponent,
    isShippingTaxIncluded,
    orderDetails,
  }
  return (
    <Card
      sx={{
        bgcolor: '#EDEDED',
        width: '100%',
        maxWidth: {
          md: '380px',
          lg: '380px',
        },
      }}
    >
      <CardContent sx={{ padding: '12px 19px' }}>
        <Box sx={{ ...styles.headerStyle }}>
          <Typography variant="h3" color="text.primary">
            {nameLabel}
          </Typography>
        </Box>
      </CardContent>
      {/*<Divider />*/}
      <CardContent sx={{ pl: '19px', pr: '19px', pb: '14px', pt: '0' }}>
        <OrderPrice {...orderPriceProps} />
      </CardContent>

      <CardContent>
        <Box textAlign="center">{props.children}</Box>
      </CardContent>
    </Card>
  )
}
export default OrderSummary
