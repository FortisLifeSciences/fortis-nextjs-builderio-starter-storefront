import React, { ReactNode } from 'react'

import { Typography, Box, Divider } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { Price, OrderPriceList } from '@/components/common'
import { checkoutGetters, orderGetters } from '@/lib/getters'

import type { Checkout, CrCart, CrOrder } from '@/lib/gql/types'

export interface OrderPriceProps<T extends CrCart | CrOrder | Checkout> {
  subTotalLabel: string
  shippingTotalLabel?: string
  totalLabel: string
  handlingLabel?: string
  taxLabel?: string
  orderDetails: T
  isShippingTaxIncluded?: boolean
  promoComponent?: ReactNode
}

const styles = {
  priceRow: { display: 'flex', py: 1 },
  priceLabel: { flex: '50%', color: 'text.primary', fontWeight: '500', lineHeight: '2.188rem' },
  priceTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '5px',
  },
}

const OrderPrice = <T extends CrCart | CrOrder | Checkout>(props: OrderPriceProps<T>) => {
  const {
    subTotalLabel,
    shippingTotalLabel,
    totalLabel,
    handlingLabel,
    taxLabel,

    promoComponent,
    isShippingTaxIncluded = true,
    orderDetails,
  } = props

  const total = orderGetters.getTotal(orderDetails)
  const subTotal = orderGetters.getSubtotal(orderDetails)
  const itemTaxTotal = orderGetters.getItemTaxTotal(orderDetails as CrOrder)
  const discountedSubtotal =
    orderGetters.getDiscountedSubtotal(orderDetails as CrOrder | CrCart) ||
    checkoutGetters.getDiscountedSubtotal(orderDetails as Checkout)

  const lineItemSubtotal = orderGetters.getLineItemSubtotal(orderDetails as CrOrder)

  const shippingTotal = orderGetters.getShippingTotal(orderDetails as CrOrder)
  const shippingSubTotal = orderGetters.getShippingSubTotal(orderDetails)
  const shippingTaxTotal = orderGetters.getShippingTaxTotal(orderDetails)

  const handlingTotal = orderGetters.getHandlingTotal(orderDetails)
  const handlingSubTotal = orderGetters.getHandlingSubTotal(orderDetails)
  const handlingTaxTotal = orderGetters.getHandlingTaxTotal(orderDetails)

  const taxTotal = orderGetters.getTaxTotal(orderDetails as CrOrder)

  const { t } = useTranslation('common')

  return (
    <Box sx={{ width: '100%' }} data-testid={'order-price-component'}>
      <>
        {isShippingTaxIncluded && (
          <>
            <OrderPriceList
              title={subTotalLabel as string}
              total={lineItemSubtotal}
              subTotal={subTotal}
              discountedSubtotal={discountedSubtotal}
              taxTotal={itemTaxTotal}
            />
            <OrderPriceList
              title={shippingTotalLabel as string}
              total={shippingTotal}
              subTotal={shippingSubTotal}
              taxTotal={shippingTaxTotal}
            />
            <OrderPriceList
              title={handlingLabel as string}
              total={handlingTotal}
              subTotal={handlingSubTotal}
              taxTotal={handlingTaxTotal}
            />
            <OrderPriceList
              title={taxLabel as string}
              total={handlingTotal}
              subTotal={taxTotal}
              taxTotal={taxTotal}
            />
          </>
        )}

        {!isShippingTaxIncluded && (
          <>
            <Box sx={{ ...styles.priceRow }}>
              <Typography sx={{ ...styles.priceLabel }} variant="body1">
                {subTotalLabel}
              </Typography>
              <Price
                variant="body1"
                fontWeight="bold"
                price={t('currency', { val: subTotal })}
                salePrice={
                  discountedSubtotal > 0 && discountedSubtotal !== subTotal
                    ? t('currency', { val: discountedSubtotal })
                    : ''
                }
              />
            </Box>
            <Box sx={{ ...styles.priceRow }}>
              <Typography sx={{ ...styles.priceLabel }} variant="body2">
                {t('shipping-tax-at-checkout')}
              </Typography>
            </Box>
          </>
        )}
      </>
      <Divider sx={{ margin: '0' }} />

      {promoComponent && <Box>{promoComponent}</Box>}

      <Box sx={{ ...styles.priceTotalRow }}>
        <Typography variant="body1" sx={{ ...styles.priceLabel }}>
          {totalLabel}
        </Typography>
        <Price variant="body1" fontWeight="500" price={t('currency', { val: total })} />
      </Box>
    </Box>
  )
}

export default OrderPrice
