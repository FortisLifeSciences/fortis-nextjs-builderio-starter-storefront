/** @format */
import { Fragment, ReactNode } from 'react'

import { Card, Typography, Box, CardContent, Link as MuiLink, Stack } from '@mui/material'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'

import { OrderPriceProps } from '../OrderPrice/OrderPrice'
import { OrderPrice, Price } from '@/components/common'
import { productGetters } from '@/lib/getters'

import type { Checkout, CrCart, CrOrder, CrProduct } from '@/lib/gql/types'

interface OrderSummaryProps<T extends CrCart | CrOrder | Checkout> extends OrderPriceProps<T> {
  nameLabel: string
  backLabel?: string
  checkoutLabel?: string
  shippingLabel?: string
  taxLabel?: string
  children?: ReactNode
  editHref?: string
  showItems?: boolean
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

const itemCaptionSx = {
  fontFamily: 'Poppins',
  fontWeight: 400,
  fontSize: '12px',
  lineHeight: '130%',
  letterSpacing: '0.05em',
  color: '#808080',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OrderSummaryItem = ({ item }: { item: any }) => {
  const { t } = useTranslation('common')
  const product = item?.product as CrProduct
  const options = productGetters.getOptions(product)
  const price = productGetters.getPrice(product)
  const expectedDeliveryDate = item?.expectedDeliveryDate

  const captions = [
    options?.[0]?.value,
    productGetters.getVariationProductCode(product) || product?.productCode,
    item?.quantity ? `${t('quantity')}: ${item.quantity}` : undefined,
  ].filter(Boolean) as string[]

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      gap={2.5}
      sx={{ width: '100%' }}
    >
      <Stack gap={0.75} sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '15px',
            lineHeight: '150%',
            letterSpacing: '-0.005em',
            color: '#333333',
          }}
        >
          {productGetters.getName(product)}
        </Typography>
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75}>
          {captions.map((text, index) => (
            <Fragment key={index}>
              {index > 0 && <Typography sx={itemCaptionSx}>.</Typography>}
              <Typography sx={itemCaptionSx}>{text}</Typography>
            </Fragment>
          ))}
        </Stack>
        {expectedDeliveryDate && (
          <Box
            sx={{
              display: 'inline-flex',
              alignSelf: 'flex-start',
              padding: '2px 12px',
              borderRadius: '100px',
              border: '1px solid #30299A',
              backgroundColor: '#DFE6FF',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 400,
                fontSize: '13px',
                lineHeight: '150%',
                letterSpacing: '-0.005em',
                color: '#30299A',
              }}
            >
              {t('ships-on', {
                date: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(
                  new Date(expectedDeliveryDate)
                ),
              })}
            </Typography>
          </Box>
        )}
      </Stack>
      <Price
        fontWeight="600"
        color="#333333"
        sx={{
          fontFamily: 'Poppins',
          fontSize: '17px',
          lineHeight: '150%',
          letterSpacing: '-0.005em',
        }}
        price={t('currency', { val: price.special || price.regular })}
      />
    </Stack>
  )
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
    editHref = '/cart',
    // Off by default: consumers like the order-history detail page already render their own
    // item list and an "edit" link back to /cart wouldn't make sense there. Checkout opts in.
    showItems = false,
  } = props
  const { t } = useTranslation('common')

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = ((orderDetails as any)?.items ?? []) as any[]
  const hasItems = showItems && items.length > 0

  return (
    <Card
      sx={{
        bgcolor: '#FFFFFF',
        width: '100%',
        maxWidth: {
          md: '380px',
          lg: '380px',
        },
        border: '1px solid #C9C9C9',
        borderRadius: '8px',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ padding: '24px' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ ...styles.headerStyle, pb: 1, borderBottom: '1px solid #C4C4C4', mb: 2.5 }}
        >
          <Typography
            sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '15px', color: '#454545' }}
          >
            {nameLabel}
          </Typography>
          {hasItems && (
            <NextLink href={editHref} passHref legacyBehavior>
              <MuiLink
                underline="none"
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#454545',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
              >
                {t('edit')}
              </MuiLink>
            </NextLink>
          )}
        </Stack>

        {hasItems && (
          <Stack gap={2.5} sx={{ mb: 2.5 }}>
            {items.map((item, index) => (
              <OrderSummaryItem key={item?.id || index} item={item} />
            ))}
          </Stack>
        )}

        <OrderPrice {...orderPriceProps} />
      </CardContent>
      {props?.children && (
        <CardContent>
          <Box textAlign="center">{props.children}</Box>
        </CardContent>
      )}
    </Card>
  )
}
export default OrderSummary
