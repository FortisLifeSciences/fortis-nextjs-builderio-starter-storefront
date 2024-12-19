import React from 'react'

import { Typography, Box, ListItem, ListItemText, List } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'next-i18next'

import Price from '../Price/Price'

interface OrderPriceListProps {
  title: string
  total: number
  subTotal: number
  taxTotal: number
  discountedSubtotal?: number
  discounts?: any[]
}

const styles = {
  detailedSummaryContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 19px',
    marginBottom: '5px',
    px: {
      xs: 0,
      md: 0,
    },
    width: {
      xs: '100%',
      md: '100%',
    },
  },
}

const OrderPriceList = (props: OrderPriceListProps) => {
  const { title, total, subTotal, taxTotal, discountedSubtotal, discounts } = props

  const { t } = useTranslation('common')

  return (
    <Box>
      <List component="div" disablePadding>
        <ListItem
          slotProps={{
            root: {
              'aria-label': title,
            },
          }}
          sx={{ ...styles.detailedSummaryContainer }}
        >
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontSize: '1.375rem' }}>
                {t(title)}
              </Typography>
            }
          />
          <Price
            fontWeight="300"
            price={t('currency', {
              val: discountedSubtotal ? discountedSubtotal?.toString() : subTotal?.toString(),
            })}
          />
        </ListItem>
      </List>
    </Box>
  )
}

export default OrderPriceList
