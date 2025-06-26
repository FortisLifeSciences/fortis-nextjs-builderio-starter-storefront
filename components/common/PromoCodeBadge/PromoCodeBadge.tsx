/** @format */

import { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { Typography, Box, Button, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { KiboTextBox } from '@/components/common'

export interface PromoCodeBadgeProps {
  onApplyCouponCode: (promo: string) => void
  onRemoveCouponCode: (promo: string) => void
  promoList?: string[] | null
  promoError?: boolean
  helpText?: string
  couponLabel?: string
  isEdit?: boolean
  discountThresholdMessages?: any
}
const styles = {
  boxStyle: {
    display: 'inline-block',
    mr: '0.5rem',
    px: '0.5rem',
    mb: '0.5rem',
    backgroundColor: 'success.main',
    color: 'secondary.light',
    borderRadius: '3px',
  },
  textBoxStyle: {
    minWidth: '10rem',
    mr: '0.5rem',
  },
}

const PromoCodeBadge = (props: PromoCodeBadgeProps) => {
  const { t } = useTranslation('common')
  const {
    onApplyCouponCode,
    onRemoveCouponCode,
    promoList,
    promoError,
    helpText,
    couponLabel,
    isEdit = true,
    discountThresholdMessages,
  } = props
  const [promo, setPromo] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>(helpText as string)
  const router = useRouter()
  const isCheckout = router.pathname === '/checkout/[checkoutId]'
  const isCart = router.pathname === '/cart'

  const handleApplyCouponCode = () => {
    setErrorMessage('')
    const isPromoCodeApplied = promoList?.find((promoCode) => {
      return promoCode.toLowerCase() === promo.toLowerCase()
    })

    if (!isPromoCodeApplied) {
      onApplyCouponCode(promo)
      setPromo('')
    } else {
      setErrorMessage(t('promo-code-already-in-use'))
    }
  }

  const handleRemoveCouponCode = (item: string) => {
    onRemoveCouponCode(item)
  }

  useEffect(() => {
    setErrorMessage(helpText as string)
  }, [promoError])

  return (
    <>
      {isEdit && (
        <Stack direction="row" display="flex" alignItems="center">
          <KiboTextBox
            name="promocode"
            label={couponLabel}
            value={promo}
            placeholder={t('promo-code')}
            sx={styles.textBoxStyle}
            onChange={(_name, value) => setPromo(value)}
            error={!!errorMessage}
            helperText={errorMessage}
            data-testid="promo-input"
          />
          <Button
            onClick={handleApplyCouponCode}
            sx={{
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: 'poppins',
              lineHeight: '25px',
              padding: '4px 12px',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              textDecorationSkipInk: 'none',
              '&:hover': {
                background: 'none',
              },
            }}
            variant="text"
            data-testid="promo-button"
          >
            {t('apply')}
          </Button>
        </Stack>
      )}
      {promoList?.map((coupon: string) => (
        <Box key={coupon} data-testid="applied-coupon" component="div" sx={styles.boxStyle}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minHeight: '30px' }}>
            <Typography variant="body2" fontWeight="500" sx={{ textAlign: 'left' }}>
              {coupon}
            </Typography>
            {isEdit && (
              <CloseIcon
                aria-label="remove-promo-code"
                sx={{
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
                onClick={() => handleRemoveCouponCode(coupon)}
              />
            )}
          </Stack>
        </Box>
      ))}
      {discountThresholdMessages.length > 0 &&
        discountThresholdMessages.map((item: any, i: number) =>
          (isCheckout && item?.showOnCheckout) || (isCart && item?.showInCart) ? (
            <Typography
              key={i}
              component="div"
              variant="body2"
              sx={{
                marginTop: '20px',
                '& a': {
                  textDecoration: 'underline',
                  color: 'primary.main',
                },
              }}
              dangerouslySetInnerHTML={{
                __html: item?.message ? item.message : '',
              }}
            />
          ) : (
            ''
          )
        )}
    </>
  )
}

export default PromoCodeBadge
