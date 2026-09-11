import React, { useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { Box, Button, Grid, IconButton, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { QuantitySelector } from '@/components/common'
import { cartGetters } from '@/lib/getters'
import { uiHelpers } from '@/lib/helpers'

import { CrOrderItem, CrWishlistItem } from '@/lib/gql/types'

export interface ListItemProps {
  item: CrWishlistItem
  onDeleteItem: (param: string) => void
  onChangeQuantity: (param1: string, param2: number) => void
  listId?: string
}

const styles = {
  row: {
    alignItems: 'flex-start',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    borderTop: '1px solid',
    borderColor: 'grey.300',
  },
  productName: {
    fontSize: '0.9375rem',
    color: 'text.primary',
  },
  productMeta: {
    fontSize: '0.75rem',
    color: 'text.secondary',
  },
  unitPrice: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    textAlign: 'right',
  },
  lineTotal: {
    fontSize: '0.75rem',
    color: 'text.secondary',
    textAlign: 'right',
  },
  detailsLink: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'primary.main',
    padding: 0,
    minWidth: 0,
    marginTop: '0.25rem',
    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
  },
}

const ListItem = (props: ListItemProps) => {
  const { item, onChangeQuantity, onDeleteItem } = props
  const { product } = item

  const { t } = useTranslation('common')
  const { getProductLink } = uiHelpers()
  const [itemQuantity, setItemQuantity] = useState(item?.quantity || 1)

  const handleQuantityUpdate = (quantity: number) => {
    setItemQuantity(quantity)
    onChangeQuantity(item.id ? item.id : (product?.productCode as string), quantity)
  }

  const optionValues = (product?.options ?? [])
    .map((option) => option?.value)
    .filter(Boolean)
    .map(String)

  const linePrice = cartGetters.getLineItemPrice(item as CrOrderItem)
  const unitPrice = linePrice.special || linePrice.regular || 0

  return (
    <Grid container sx={{ ...styles.row }}>
      <Grid item xs={3} sm={2} sx={{ paddingRight: '0.5rem' }}>
        <QuantitySelector
          quantity={item?.quantity}
          onIncrease={() => handleQuantityUpdate(itemQuantity + 1)}
          onDecrease={() => handleQuantityUpdate(itemQuantity - 1)}
          onQuantityUpdate={(q) => handleQuantityUpdate(q)}
        />
      </Grid>

      <Grid item xs={7} sm={8}>
        <Typography component="p" sx={{ ...styles.productName }}>
          {product?.name}
        </Typography>
        <Typography component="p" sx={{ ...styles.productMeta }}>
          {product?.variationProductCode || product?.productCode}
        </Typography>
        {Boolean(optionValues.length) && (
          <Typography component="p" sx={{ ...styles.productMeta }}>
            {optionValues.join(', ')}
          </Typography>
        )}
        <Button
          variant="text"
          component="a"
          href={getProductLink(product?.productCode as string) || ''}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="product-modal-btn"
          sx={{ ...styles.detailsLink }}
        >
          {t('view-details')}
        </Button>
      </Grid>

      <Grid item xs={2} sm={2}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
          <Box>
            <Typography component="p" sx={{ ...styles.unitPrice }}>
              {t('currency', { val: unitPrice })}
            </Typography>
            {item?.quantity > 1 && (
              <Typography component="p" sx={{ ...styles.lineTotal }}>
                {t('currency', { val: unitPrice * item.quantity })}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            aria-label={`${t('remove')} ${product?.name}`}
            id={item.id as string}
            onClick={() => onDeleteItem(item.id ? item.id : (product?.productCode as string))}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  )
}
export default ListItem
