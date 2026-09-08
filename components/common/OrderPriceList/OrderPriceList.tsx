import React from 'react'

import { Typography, Box, ListItem, ListItemText, List } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'next-i18next'

import Price from '../Price/Price'

interface OrderPriceListProps {
  title: string
  total?: number
  subTotal?: number
  taxTotal?: number
  discountedSubtotal?: number
  discounts?: any[]
}

const styles = {
  detailedSummaryContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0,
    marginBottom: '10px',
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
      <List component="ul" disablePadding>
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
              <Typography
                component="h4"
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '150%',
                  letterSpacing: '-0.005em',
                  color: '#454545',
                }}
              >
                {t(title)}
              </Typography>
            }
          />
          <Price
            fontWeight="600"
            color={Number(subTotal) < 0 ? 'error.main' : 'rgba(1, 1, 1, 0.74)'}
            sx={{
              fontFamily: 'Poppins',
              fontSize: '15px',
              lineHeight: '150%',
              letterSpacing: '-0.005em',
            }}
            price={t('currency', {
              val: discountedSubtotal ? discountedSubtotal : subTotal,
            })}
          />
        </ListItem>
      </List>
    </Box>
  )
}

export default OrderPriceList
