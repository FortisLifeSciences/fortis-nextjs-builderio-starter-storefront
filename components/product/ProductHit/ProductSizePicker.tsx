import React, { useEffect, useRef } from 'react'

import { Box, ButtonBase, CircularProgress, Dialog, IconButton, Typography } from '@mui/material'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import type { ProductSize } from '@/components/product/ProductHit/useProductSizes'

type ProductSizePickerProps = {
  open: boolean
  productName: string
  productHref: string
  sizes: ProductSize[] | undefined
  isLoading: boolean
  isError: boolean
  priceVisible: boolean
  selectedCode: string | null
  onSelect: (size: ProductSize) => void
  onClose: () => void
}

const PHONE = '@media (max-width: 767px)'

const styles = {
  paper: {
    m: 0,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: 'min(440px, 92vw)',
    maxWidth: 'min(440px, 92vw)',
    maxHeight: '82vh',
    padding: '0 20px 20px',
    borderRadius: '16px',
    boxShadow: '0 24px 60px rgba(24,22,54,.22)',
    fontFamily: 'Poppins',
    color: '#1B1A24',
    [PHONE]: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      maxWidth: '100%',
      maxHeight: '82dvh',
      padding: '0 20px calc(18px + env(safe-area-inset-bottom))',
      borderRadius: '22px 22px 0 0',
      boxShadow: '0 -12px 40px rgba(24,22,54,.14)',
    },
  },
  backdrop: { backgroundColor: 'rgba(20,18,45,.38)' },
  head: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 0 12px',
    borderBottom: '1px solid #EAEAF1',
  },
  title: { fontFamily: 'Poppins', fontSize: '17px', fontWeight: 700, color: '#1B1A24' },
  close: {
    width: '44px',
    height: '44px',
    margin: '-5px -5px -5px 0',
    color: '#1B1A24',
    fontSize: '23px',
    lineHeight: 1,
    '&:hover': { backgroundColor: '#F4F3F8' },
  },
  sub: {
    paddingTop: '12px',
    color: '#5C5A70',
    fontFamily: 'Poppins',
    fontSize: '12.5px',
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  options: { minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '2px 0' },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    minHeight: '60px',
    marginTop: '10px',
    padding: '10px 14px',
    border: '1.5px solid #EAEAF1',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    color: '#1B1A24',
    textAlign: 'left',
    fontFamily: 'Poppins',
    '&:hover': { borderColor: '#30299A' },
    '&.on': { borderColor: '#30299A', backgroundColor: '#F4F3FC' },
    '&.Mui-focusVisible': { outline: '2px solid #30299A', outlineOffset: '3px' },
  },
  optionMain: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
  optionLabel: {
    fontFamily: 'Poppins',
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: 1.4,
    overflowWrap: 'anywhere',
  },
  optionSku: {
    color: '#8B8AA0',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '11px',
  },
  optionPrice: { flexShrink: 0, fontFamily: 'Poppins', fontSize: '15px', fontWeight: 800 },
  status: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 0 8px',
    color: '#5C5A70',
    fontFamily: 'Poppins',
    fontSize: '13px',
    '& a': { color: '#3B33B8', fontWeight: 600, textDecoration: 'underline' },
  },
}

const ProductSizePicker = ({
  open,
  productName,
  productHref,
  sizes,
  isLoading,
  isError,
  priceVisible,
  selectedCode,
  onSelect,
  onClose,
}: ProductSizePickerProps) => {
  const { t } = useTranslation('common')
  const titleId = 'product-size-picker-title'
  const focusTargetRef = useRef<HTMLButtonElement | null>(null)
  const hasSizes = Boolean(sizes?.length)

  useEffect(() => {
    if (!open || isLoading || !hasSizes) return
    const frame = requestAnimationFrame(() => focusTargetRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open, isLoading, hasSizes, selectedCode])

  let body: React.ReactNode
  if (isLoading) {
    body = (
      <Box sx={styles.status}>
        <CircularProgress size={24} sx={{ color: '#30299A' }} />
      </Box>
    )
  } else if (isError || !sizes?.length) {
    body = (
      <Box sx={styles.status}>
        <Link href={productHref}>{t('view-details')}</Link>
      </Box>
    )
  } else {
    body = (
      <Box sx={styles.options}>
        {sizes.map((size, index) => {
          const on = size.variationProductCode === selectedCode
          const isFocusTarget = on || (!selectedCode && index === 0)
          return (
            <ButtonBase
              key={size.variationProductCode}
              className={on ? 'on' : undefined}
              sx={styles.option}
              aria-pressed={on}
              ref={isFocusTarget ? focusTargetRef : undefined}
              onClick={() => onSelect(size)}
            >
              <Box component="span" sx={styles.optionMain}>
                <Box component="span" sx={styles.optionLabel}>
                  {size.label}
                </Box>
                <Box component="span" sx={styles.optionSku}>
                  {size.variationProductCode}
                </Box>
              </Box>
              {priceVisible && size.price !== null && (
                <Box component="span" sx={styles.optionPrice}>
                  {t('currency', { val: size.price })}
                </Box>
              )}
            </ButtonBase>
          )
        })}
      </Box>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      PaperProps={{ sx: styles.paper }}
      slotProps={{ backdrop: { sx: styles.backdrop } }}
      sx={{
        '& .MuiDialog-container': { alignItems: 'center', [PHONE]: { alignItems: 'flex-end' } },
      }}
    >
      <Box sx={styles.head}>
        <Typography id={titleId} component="b" sx={styles.title}>
          {t('choose-a-size')}
        </Typography>
        <IconButton aria-label={t('close-size-picker')} sx={styles.close} onClick={onClose}>
          ×
        </IconButton>
      </Box>
      <Typography component="p" sx={styles.sub}>
        {productName}
      </Typography>
      {body}
    </Dialog>
  )
}

export default ProductSizePicker
