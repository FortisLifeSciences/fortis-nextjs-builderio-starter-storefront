import { Box, Grid, Typography } from '@mui/material'
import { color } from 'framer-motion'
import Link from 'next/link'

const style = {
  alignCenter: {
    width: '100%',
    backgroundColor: 'secondary.main',
    height: { xs: 'auto', sm: 'auto', md: '60px' },
    display: 'flex',
    alignItems: 'center',
    padding: { md: 0, xs: '20px 16px', sm: '20px 16px' },
  },
  containerBox: {
    width: '100%',
    maxWidth: '1200px',
    display: { xs: 'block', md: 'flex' },
    justifyContent: 'space-between',
    margin: '0 auto',
  },
  toUppercase: {
    textTransform: 'uppercase',
    color: 'primary.main',
    marginBottom: { xs: '12px', sm: '12px', md: 0 },
  },
}

const CheckoutFooter = () => {
  return (
    <Box sx={style.alignCenter}>
      <Box sx={style.containerBox}>
        <Typography variant="h6" sx={style.toUppercase}>
          <Link href="/privacy-policy" style={{ textDecoration: 'none' }}>
            Privacy Policy
          </Link>
        </Typography>

        <Typography variant="h6" sx={style.toUppercase}>
          <Link href="/site-use-terms" style={{ textDecoration: 'none' }}>
            Site Use Terms
          </Link>
        </Typography>
        <Typography variant="h6" sx={style.toUppercase}>
          <Link href="/sales-terms" style={{ textDecoration: 'none' }}>
            Sales terms & conditions
          </Link>
        </Typography>
        <Typography variant="h6" sx={style.toUppercase}>
          © 2025 Fortis Life Sciences, llc. All rights Reserved.
        </Typography>
      </Box>
    </Box>
  )
}

export default CheckoutFooter
