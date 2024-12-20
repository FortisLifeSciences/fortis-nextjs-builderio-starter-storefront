import React from 'react'

import { Box, Divider, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { OrderPrice, Price, ProductItem } from '@/components/common'
import type { OrderPriceProps } from '@/components/common/OrderPrice/OrderPrice'
import { cartGetters } from '@/lib/getters'

import type { CrCart, CrCartItem, CrProductOption } from '@/lib/gql/types'
interface CartContentProps {
  cartItem: CrCartItem
}

const Content = (props: CartContentProps) => {
  const { cartItem } = props
  const { shippingTotal, quantity, subtotal, itemTaxTotal, total } = cartItem
  const { t } = useTranslation('common')
  const orderPriceProps = {
    subTotalLabel: `${t('cart-sub-total')} (${t('item-quantity', { count: quantity })})`,
    totalLabel: t('total'),
    isShippingTaxIncluded: false,
    orderDetails: {
      subtotal,
      shippingTotal,
      tax: itemTaxTotal,
      total,
    } as CrCart,
  }
  const subscriptionDetails = cartGetters.getSubscriptionDetails(cartItem)

  return (
    <Box sx={{ width: '100%' }} data-testid="content-component">
      <Box>
        {/* <ProductItem
          image={cartItem?.product?.imageUrl || ''}
          name={cartItem?.product?.name || ''}
          options={cartItem?.product?.options as Array<CrProductOption>}
          price={(cartItem?.product?.price?.price || 0).toString()}
          salePrice={
            (cartItem?.product?.price?.salePrice &&
              (cartItem?.product?.price?.salePrice).toString()) ||
            undefined
          }
          subscriptionFrequency={subscriptionDetails as string}
          discounts={cartItem?.productDiscounts}
          pageType={pageType}
        /> */}
        <Typography variant="body1" data-testid="productName" pb={0.375}>
          {cartItem?.product?.name || ''}
        </Typography>
        {cartItem?.product?.options?.map((option, index) => (
          <Box
            key={index}
            data-testid="keyValueOptions"
            pt={0.5}
            display="flex"
            flexDirection={'row'}
            flexWrap="wrap"
            justifyContent={'space-between'}
            gap={1}
            //sx={{ ...sx }}
          >
            {typeof option?.value === 'string' ? (
              <Typography
                variant="body2"
                fontWeight={'normal'}
                component="span"
                //color={color}
              >
                {option?.value}
              </Typography>
            ) : (
              option?.value
            )}
            <Typography variant="body2" pb={0.375} fontWeight={'normal'} component="span">
              {cartItem?.product?.variationProductCode}
            </Typography>
          </Box>
        ))}
      </Box>
      <Divider sx={{ marginTop: '10px', border: '2px solid #EDEDED' }} />
      <Box display="flex" flexDirection={'row'} justifyContent={'flex-end'}>
        <Typography color="grey.900" fontWeight={500} sx={{ pr: 1 }} component="span">
          {cartItem?.quantity} @
        </Typography>
        <Price variant="body1" fontWeight={'500'} price={t('currency', { val: subtotal })} />
        {/* <OrderPrice {...orderPriceProps} /> */}
      </Box>
    </Box>
  )
}

export default Content
