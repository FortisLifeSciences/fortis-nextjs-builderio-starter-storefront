import React from 'react'

import { Container, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { useHeaderContext } from '@/context'

const checkoutHeaderStyles = {
  container: {
    backgroundColor: '#E3E2FF',
    height: '40px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 2,
  },
}

const CheckoutHeader = ({ isMultiShipEnabled }: { isMultiShipEnabled: boolean }) => {
  const { t } = useTranslation()
  const { toggleCartDrawer } = useHeaderContext()

  // The cart has no standalone page anymore - opening the side drawer in place keeps the shopper
  // on checkout instead of navigating them away to the homepage, which reads as having lost
  // everything they just entered.
  const gotoCart = () => {
    toggleCartDrawer(true)
  }

  return (
    <>
      <Container maxWidth="xl" sx={checkoutHeaderStyles.container} data-testid="checkout-header">
        <Typography
          variant="h6"
          sx={{ color: 'primary.main', cursor: 'pointer' }}
          onClick={gotoCart}
        >
          RETURN TO CART
        </Typography>
      </Container>
    </>
  )
}

export default CheckoutHeader
