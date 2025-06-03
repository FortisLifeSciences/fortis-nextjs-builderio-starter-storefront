import React, { ChangeEvent, useEffect, useState } from 'react'

import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import { Stack, TextField, IconButton, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

// Interface
interface QuantitySelectorProps {
  quantity: number
  minQty?: number
  label?: string
  maxQuantity?: number
  onIncrease?: () => void
  onDecrease?: () => void
  onQuantityUpdate?: (quantity: number) => void
}

interface QuantityInputProps {
  quantity: number
  minQty: number
  handleCustomQuantity?: any
}

// MUI
const styles = {
  iconButton: {
    border: 2,
    borderColor: 'primary.main',
    color: 'primary.main',
    height: 20,
    width: 20,
  },
}

const QuantityTextField = ({ quantity, minQty, handleCustomQuantity }: QuantityInputProps) => {
  const [itemQuantity, setItemQuantity] = useState<number | string>(quantity)

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setItemQuantity(e.target.value)
  }

  const handleQuantityOnBlur = () => {
    const numericQty = Number(itemQuantity)
    if (itemQuantity === '' || Number.isNaN(numericQty) || numericQty < minQty) {
      setItemQuantity(minQty)
      if (typeof handleCustomQuantity === 'function') {
        handleCustomQuantity(minQty)
      }
    } else if (numericQty !== quantity && typeof handleCustomQuantity === 'function') {
      handleCustomQuantity(numericQty)
    }
  }

  return (
    <TextField
      name="quantity"
      autoComplete="off"
      onChange={handleQuantityChange}
      onBlur={handleQuantityOnBlur}
      value={itemQuantity}
      inputProps={{
        'aria-label': 'quantity',
        inputMode: 'numeric',
        pattern: '[0-9]*',
        style: {
          padding: '2px 5px',
          textAlign: 'center',
          color: '#000',
          fontFamily: 'Poppins',
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: '300',
          lineHeight: '25px',
          border: '1px solid #000',
          borderRadius: '3px',
          backgroundColor: '#ffffff',
        },
      }}
      sx={{ width: '50px', height: '24px', borderRadius: '3px' }}
    />
  )
}

// Component
const QuantitySelector = (props: QuantitySelectorProps) => {
  const { quantity, minQty, label, maxQuantity, onIncrease, onDecrease, onQuantityUpdate } = props
  const { t } = useTranslation('common')

  return (
    <Stack
      direction="row"
      justifyContent="flec-start"
      alignItems="center"
      spacing={1.2}
      width={'100%'}
    >
      {label && (
        <Typography
          variant="body2"
          component="span"
          sx={{ pr: '0.5rem', color: '#000', fontSize: '16px' }}
          data-testid="label"
        >
          {label}:
        </Typography>
      )}

      <IconButton
        onClick={onDecrease}
        disabled={quantity === minQty ? true : false}
        sx={{
          ...styles.iconButton,
          ...(quantity === 1 && {
            borderColor: 'grey.600',
            color: 'grey.600',
            cursor: 'not-allowed',
          }),
          '&:hover': {
            bgcolor: 'unset',
          },
        }}
        aria-label={t('decrease')}
        component="span"
      >
        <Remove fontSize="small" />
      </IconButton>

      <QuantityTextField
        key={quantity + 'quantity-text-field'}
        quantity={quantity}
        minQty={minQty ? minQty : 1}
        handleCustomQuantity={onQuantityUpdate}
      />

      <IconButton
        onClick={onIncrease}
        disabled={maxQuantity === quantity ? true : false}
        sx={{
          ...styles.iconButton,
          '&:hover': {
            bgcolor: 'unset',
          },
        }}
        aria-label={t('increase')}
        component="span"
      >
        <Add fontSize="small" />
      </IconButton>
    </Stack>
  )
}

export default QuantitySelector
