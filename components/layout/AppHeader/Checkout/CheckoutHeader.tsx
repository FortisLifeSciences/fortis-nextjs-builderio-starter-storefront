import React from 'react'

import { Box, Container, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

const checkoutHeaderStyles = {
  container: {
    height: '40px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 2,
  },
}

const CheckoutHeader = ({ isMultiShipEnabled }: { isMultiShipEnabled: boolean }) => {
  const { t } = useTranslation()
  const router = useRouter()

  const gotoCart = () => {
    router.push('/cart')
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
