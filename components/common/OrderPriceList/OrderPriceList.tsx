import React from 'react'

import { Typography, Box, ListItem, ListItemText, List } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'next-i18next'

import KiboSkeleton from '../KiboSkeleton/KiboSkeleton'
import Price from '../Price/Price'

interface OrderPriceListProps {
  title: string
  total?: number
  subTotal?: number
  taxTotal?: number
  discountedSubtotal?: number
  discounts?: any[]
  // While true, shows placeholder bars instead of the label/amount - for a row whose figure
  // (e.g. tax) is still being calculated/fetched, rather than flashing a stale/zero value.
  isLoading?: boolean
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
  const { title, total, subTotal, taxTotal, discountedSubtotal, discounts, isLoading } = props

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
              isLoading ? (
                <KiboSkeleton variant="text" width={100} height={22} />
              ) : (
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
              )
            }
          />
          {isLoading ? (
            <KiboSkeleton variant="text" width={60} height={22} />
          ) : (
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
          )}
        </ListItem>
      </List>
    </Box>
  )
}

export default OrderPriceList
