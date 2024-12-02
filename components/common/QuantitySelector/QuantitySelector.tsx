import React, { ChangeEvent, useState } from 'react'

import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import { Stack, TextField, IconButton, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

// Interface
interface QuantitySelectorProps {
  quantity: number
  label?: string
  maxQuantity?: number
  onIncrease?: () => void
  onDecrease?: () => void
  onQuantityUpdate?: (quantity: number) => void
}

interface QuantityInputProps {
  quantity: number
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

const QuantityTextField = ({ quantity, handleCustomQuantity }: QuantityInputProps) => {
  const [itemQuantity, setItemQuantity] = useState<number | string>(quantity)

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newQuantity = Number(e.target.value)
    if ((!Number.isNaN(newQuantity) && newQuantity > 0) || e.target.value === '') {
      setItemQuantity(e.target.value)
    }
  }

  const handleQuantityOnBlur = () => {
    if (itemQuantity !== '' && itemQuantity !== quantity) {
      handleCustomQuantity(Number(itemQuantity))
    } else setItemQuantity(quantity)
  }

  return (
    <TextField
      name="quantity"
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
        },
      }}
      sx={{ width: '35px', height: '24px', borderRadius: '3px', border: '1px solid gray.900' }}
    />
  )
}

// Component
const QuantitySelector = (props: QuantitySelectorProps) => {
  const { quantity, label, maxQuantity, onIncrease, onDecrease, onQuantityUpdate } = props
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
          sx={{ pr: '0.5rem', color: 'gray.900' }}
          data-testid="label"
        >
          {label}:
        </Typography>
      )}

      <IconButton
        onClick={onDecrease}
        disabled={quantity === 1 ? true : false}
        sx={{ ...styles.iconButton }}
        aria-label={t('decrease')}
        component="span"
      >
        <Remove fontSize="small" />
      </IconButton>

      <QuantityTextField
        key={quantity + 'quantity-text-field'}
        quantity={quantity}
        handleCustomQuantity={onQuantityUpdate}
      />

      <IconButton
        onClick={onIncrease}
        disabled={maxQuantity === quantity ? true : false}
        sx={{ ...styles.iconButton }}
        aria-label={t('increase')}
        component="span"
      >
        <Add fontSize="small" />
      </IconButton>
    </Stack>
  )
}

export default QuantitySelector
