import React, { SyntheticEvent } from 'react'

import { Button, Stack, styled, Theme } from '@mui/material'
import { useTranslation } from 'next-i18next'

export interface ActionsProps {
  onGoToCart: () => void
  onContinueShopping: () => void
}

interface StyledButtonProps {
  theme?: Theme
}

const StyledActionsComponent = styled(Stack)(() => ({
  width: '100%',
  flexDirection: 'row',
  alignItems: 'stretch',
  //padding: '0 2%',
  marginBottom: '1.438rem',
  marginTop: '9.4375rem',
  '@media (max-width: 1023px)': {
    flexDirection: 'column',
    marginTop: '4.375rem',
  },
}))

const StyledGoToCartButton = styled(Button)(({ theme }: StyledButtonProps) => ({
  fontSize: '1rem',
  bgcolor: theme?.palette.primary.main,
  transition: 'none',
  boxShadow: 'none',
  borderRadius: '0px 1.625rem',
  lineHeight: '1.5rem',
  '&:hover': {
    bgcolor: theme?.palette.primary.light,
  },
  '@media (max-width: 1023px)': {
    width: '100%',
    marginTop: '12px',
    padding: '12px 0',
  },
}))

const StyledContinueShoppingButton = styled(Button)(({ theme }: StyledButtonProps) => ({
  color: '#30299A',
  backgroundColor: theme?.palette.grey[50],
  border: '1px solid #30299A',
  fontSize: theme?.typography.body2.fontSize,
  transition: 'none',
  boxShadow: 'none',
  borderRadius: '0 1.625rem',
  lineHeight: '1.5rem',
  padding: '0.75rem 1.125rem',
  fontWeight: 500,
  '&:hover': {
    bgcolor: theme?.palette.secondary.main,
    color: theme?.palette.primary.light,
  },
  '@media (max-width: 1023px)': {
    width: '100%',
  },
}))

const Actions = (props: ActionsProps) => {
  const { onGoToCart, onContinueShopping } = props
  const { t } = useTranslation('common')

  const handleGoToCart = (e: SyntheticEvent<Element, Event>) => {
    e.preventDefault()
    onGoToCart()
  }
  const handleContinueShopping = (e: SyntheticEvent<Element, Event>) => {
    e.preventDefault()
    onContinueShopping()
  }

  return (
    <StyledActionsComponent
      data-testid="actions-component"
      sx={{ justifyContent: 'space-between' }}
    >
      <StyledContinueShoppingButton
        variant="outlined"
        onClick={handleContinueShopping}
        sx={{ '&:hover': { bgcolor: '#E3E2FF', color: '#4C47C4' } }}
      >
        {t('continue-shopping')}
      </StyledContinueShoppingButton>
      <StyledGoToCartButton
        variant="contained"
        onClick={handleGoToCart}
        sx={{ padding: '0 3.25rem', '&:hover': { bgcolor: '#4C47C4' } }}
      >
        {t('go-to-cart')}
      </StyledGoToCartButton>
    </StyledActionsComponent>
  )
}

export default Actions
