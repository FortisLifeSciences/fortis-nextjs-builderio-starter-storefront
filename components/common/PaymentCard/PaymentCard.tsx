import { useMemo } from 'react'

import { Typography, Box } from '@mui/material'
import { useTranslation } from 'next-i18next'

import KiboImage from '../KiboImage/KiboImage'
import { PageType } from '@/lib/constants'
import { getCreditCardLogo } from '@/lib/helpers/credit-card'

interface PaymentCardProps {
  pageType?: string
  title?: string
  cardNumberPart: string
  expireMonth: number
  expireYear: number
  cardType?: string
  radio?: boolean
}

const PaymentCard = (props: PaymentCardProps) => {
  const { pageType, title, cardNumberPart, expireMonth, expireYear, cardType } = props
  const { t } = useTranslation('common')
  const cardTypeMemoized = useMemo(() => getCreditCardLogo(cardType as string), [cardType])
  const alt = `cardType-${cardType as string}`

  return (
    <>
      {title && (
        <Typography variant="subtitle2" fontWeight={600}>
          {title}
        </Typography>
      )}
      <Box display="flex" pt={1} gap={2} data-testid="credit-card-view">
        {pageType !== PageType.CHECKOUT && (
          <Box minWidth={45}>
            {cardTypeMemoized && (
              <KiboImage
                src={cardTypeMemoized}
                alt={alt}
                style={{ width: '45px', height: '35px' }}
                width={45}
                height={35}
              />
            )}
          </Box>
        )}

        {pageType === PageType.CHECKOUT ? (
          <>
            <Box
              sx={{
                fontSize: '1rem',
                display: 'flex',
              }}
            >
              <Typography variant="body2" component="span">
                {`${cardType} ${t('ending')
                  ?.substring(0, 6)
                  ?.toLocaleLowerCase()} ${cardNumberPart.substring(
                  cardNumberPart.length - 4,
                  cardNumberPart.length
                )} (${t('expires')} ${expireMonth}/${expireYear})`}
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Box>
              <Box display="flex">
                <Typography variant="body2" sx={{ pr: 1 }} component="span">
                  {t('ending')}
                </Typography>
                <Typography variant="body2" component="span">
                  {cardNumberPart}
                </Typography>
              </Box>
              <Box display="flex">
                <Typography variant="body2" sx={{ pr: 1 }} component="span">
                  {t('exp')}
                </Typography>
                <Typography variant="body2" component="span">
                  {expireMonth}/{expireYear}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </>
  )
}

export default PaymentCard
