/** @format */

import { useEffect, useState } from 'react'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import { Typography, Box, Stack, CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { KiboTextBox } from '@/components/common'

export interface PromoCodeBadgeProps {
  onApplyCouponCode: (promo: string) => void | Promise<void>
  onRemoveCouponCode: (promo: string) => void
  promoList?: string[] | null
  promoError?: boolean
  helpText?: string
  couponLabel?: string
  isEdit?: boolean
  discountThresholdMessages?: any
  // Real discount name per coupon code (e.g. `cart.orderDiscounts[].discount.name`).
  discountDescriptions?: Record<string, string>
  // Codes rejected by the backend (`order.invalidCoupons[].couponCode`) - Kibo keeps a
  // rejected code in `couponCodes` regardless, so these get filtered out of the applied list.
  invalidCouponCodes?: string[]
}
const appliedCouponColors = {
  border: '#34BC34',
  background: '#E4F5E6',
  text: '#1B7A1B',
}
const styles = {
  boxStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '4px',
    width: '100%',
    minHeight: '38px',
    mb: '0.75rem',
    px: '12px',
    py: '8px',
    backgroundColor: appliedCouponColors.background,
    border: `1px solid ${appliedCouponColors.border}`,
    borderRadius: '10px',
  },
  couponCode: {
    fontFamily: 'Poppins',
    fontWeight: 600,
    fontSize: '13px',
    lineHeight: '150%',
    letterSpacing: '-0.005em',
    color: appliedCouponColors.text,
  },
  couponDescription: {
    fontFamily: 'Poppins',
    fontWeight: 400,
    fontSize: '13px',
    lineHeight: '150%',
    letterSpacing: '-0.005em',
    color: appliedCouponColors.text,
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
    discountDescriptions,
    invalidCouponCodes,
  } = props
  const appliedCoupons = promoList?.filter((coupon) => !invalidCouponCodes?.includes(coupon))
  const [promo, setPromo] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>(helpText as string)
  const [isApplying, setIsApplying] = useState(false)
  const router = useRouter()
  const isCheckout = router.pathname === '/checkout/[checkoutId]'
  const isCart = router.pathname === '/cart'

  const handleApplyCouponCode = async () => {
    if (isApplying || !promo) return
    setErrorMessage('')
    const isPromoCodeApplied = appliedCoupons?.find((promoCode) => {
      return promoCode.toLowerCase() === promo.toLowerCase()
    })

    if (!isPromoCodeApplied) {
      setIsApplying(true)
      try {
        // Typed as `void` above, but every real caller passes an async handler - awaiting it
        // (harmless no-op if it truly is sync) is what lets the spinner reflect the request.
        await onApplyCouponCode(promo)
        setPromo('')
      } finally {
        setIsApplying(false)
      }
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
        <KiboTextBox
          name="promocode"
          label={couponLabel}
          value={promo}
          placeholder={t('promo-code')}
          onChange={(_name, value) => setPromo(value)}
          error={!!errorMessage}
          helperText={errorMessage}
          data-testid="promo-input"
          icon={
            isApplying ? (
              <CircularProgress size={15} data-testid="promo-button-loading" />
            ) : (
              <Typography
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: 'primary.main',
                  whiteSpace: 'nowrap',
                }}
                data-testid="promo-button"
              >
                {t('apply')}
              </Typography>
            )
          }
          onIconClick={handleApplyCouponCode}
        />
      )}
      {!!appliedCoupons?.length && (
        <Box sx={{ mt: '12px' }}>
          {appliedCoupons.map((coupon: string) => (
            <Box key={coupon} data-testid="applied-coupon" component="div" sx={styles.boxStyle}>
              <Stack direction="row" spacing="4px" alignItems="center" sx={{ minWidth: 0 }}>
                <CheckCircleIcon
                  sx={{ color: appliedCouponColors.border, fontSize: '20px', flexShrink: 0 }}
                />
                <Typography sx={styles.couponCode}>{coupon}</Typography>
                {discountDescriptions?.[coupon] && (
                  <Typography sx={styles.couponDescription}>
                    – {discountDescriptions[coupon]}
                  </Typography>
                )}
              </Stack>
              {isEdit && (
                <CloseIcon
                  aria-label="remove-promo-code"
                  sx={{
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    color: appliedCouponColors.text,
                    flexShrink: 0,
                  }}
                  onClick={() => handleRemoveCouponCode(coupon)}
                />
              )}
            </Box>
          ))}
        </Box>
      )}
      {discountThresholdMessages?.length > 0 &&
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
