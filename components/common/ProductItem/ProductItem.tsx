import React, { ReactNode, useState } from 'react'

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp'
import {
  Typography,
  Box,
  CardContent,
  Collapse,
  useMediaQuery,
  useTheme,
  Link as MuiLink,
  Stack,
  Grid,
  Card,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { KiboImage, Price, KeyValueDisplay } from '@/components/common'
import { ProductOptionList } from '@/components/product'
import { productGetters } from '@/lib/getters'
import DefaultImage from '@/public/noImage.png'

import type { Maybe, CrProductOption } from '@/lib/gql/types'

export interface ProductItemProps {
  id?: Maybe<string>
  productCode?: Maybe<string>
  image: string
  name: string
  options?: CrProductOption[]
  price?: string
  salePrice?: string
  qty?: number
  isPickupItem?: boolean
  expectedDeliveryDate?: string
  purchaseLocation?: string
  link?: string
  children?: ReactNode
  width?: string
  subscriptionFrequency?: string
  showChangeStoreLink?: boolean
  isQuickOrder?: boolean
  discounts?: any
  onStoreLocatorClick?: () => void
  isOrderConfirmation?: boolean
}

const styles = {
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minWidth: '80px',
    aspectRatio: 1,
  },
  card: {
    maxWidth: '100%',
    marginBottom: {
      xs: 0,
      sm: 0,
      md: '1.5rem',
    },
    border: {
      xs: `2px solid ${grey[300]}`,
      md: `2px solid ${grey[300]}`,
    },
    boxShadow: 'none',
  },
  productItemContainer: {
    display: 'flex',
    flexDirection: {
      xs: 'column',
      md: 'row',
    },
    padding: '1rem 0.5rem',
    justifyContent: 'space-around',
  },
  subContainer: {
    flex: 1,
    padding: '0 0.5rem',
    paddingTop: {
      xs: 2,
      md: 0,
    },
    paddingLeft: {
      xs: 0,
      md: 2,
    },
  },
  icon: {
    alignItems: 'flex-start',
    margin: '0',
    position: 'absolute',
    padding: {
      xs: '0.5rem 0',
      sm: '0 0.5rem',
    },
    top: {
      xs: 0,
      sm: '2%',
      md: '5%',
      lg: '6%',
    },
    right: {
      xs: 0,
      sm: 0,
      md: '1%',
      lg: '1%',
    },
  },
}

const ProductItem = (props: ProductItemProps) => {
  const {
    id,
    productCode,
    image,
    name,
    options,
    price,
    salePrice,
    qty,
    isPickupItem,
    expectedDeliveryDate,
    purchaseLocation,
    link,
    children,
    isQuickOrder = false,
    subscriptionFrequency,
    showChangeStoreLink,
    discounts,
    onStoreLocatorClick,
    isOrderConfirmation,
  } = props
  const { t } = useTranslation('common')
  const theme = useTheme()
  const mdScreen = useMediaQuery(theme.breakpoints.up('md'))
  const [expanded, setExpanded] = useState<boolean>(true)

  if (isOrderConfirmation) {
    return (
      <Card sx={{ ...styles.card }} role="group" key={id}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ ...styles.productItemContainer }}>
            <Box sx={{ ...styles.subContainer }}>
              <Grid container>
                <Grid item sm={12}>
                  <Grid container>
                    <Grid item sm={8}>
                      <Link href={link || ''}>
                        <Typography variant="body1" data-testid="productName" pb={0.375}>
                          {name}
                        </Typography>
                      </Link>
                    </Grid>
                    <Grid item sm={4}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Price
                          variant="body1"
                          fontWeight="500"
                          color="gray.900"
                          price={t('currency', { val: price })}
                          salePrice={salePrice && t('currency', { val: salePrice })}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item sm={12}>
                  <Grid container>
                    <Grid item sm={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'gray.900' }}>
                        {options && options[0]?.value}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      sm={12}
                      md={4}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'gray.900' }}>
                          {productCode}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid
                      item
                      sm={12}
                      md={4}
                      sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}
                    >
                      <Box sx={{ py: '0.5rem' }}>
                        <Typography variant="body2" sx={{ color: 'gray.900' }}>
                          {t('quantity')}: {qty}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Card>
    )
  }

  return (
    <Box key={id}>
      <Box sx={{ display: 'flex', pb: 1, pr: 1, gap: 2, flex: 1 }}>
        <Box sx={{ ...styles.imageContainer }}>
          <Link href={link || ''} passHref>
            <KiboImage
              src={productGetters.handleProtocolRelativeUrl(image) || DefaultImage}
              alt={name}
              style={{ objectFit: 'contain', width: '80px', height: '80px' }}
            />
          </Link>
        </Box>

        <Stack mr={1} flex={1}>
          <CardContent
            sx={{
              py: 0,
              px: 1,
              '&.MuiCardContent-root:last-child': {
                pb: 0,
              },
            }}
          >
            <Typography variant="subtitle2" data-testid="productName" pb={0.375}>
              {name}
            </Typography>
            {isQuickOrder && productCode && (
              <Box data-testid="product-code">
                <KeyValueDisplay
                  option={{ name: 'Code', value: productCode }}
                  variant="body2"
                  fontWeight="bold"
                />
              </Box>
            )}

            {children}

            <Box data-testid="productDetails">
              <Box sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}>
                {((options && options?.length > 0) || price || qty) && (
                  <Box
                    display="flex"
                    alignItems="center"
                    width="fit-content"
                    sx={{ cursor: 'pointer' }}
                    pb={0.125}
                    onClick={() => setExpanded(!expanded)}
                  >
                    <Typography variant="body2" align="left" sx={{ mr: 1 }}>
                      {t('details')}
                    </Typography>
                    {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </Box>
                )}
              </Box>

              <Collapse in={mdScreen ? true : expanded} timeout="auto" unmountOnExit>
                {options && <ProductOptionList options={options} />}

                {qty && <KeyValueDisplay option={{ name: t('qty'), value: qty }} variant="body2" />}
                {(price || salePrice) && (
                  <KeyValueDisplay
                    option={{
                      name: t('price'),
                      value: (
                        <Price
                          variant="body2"
                          fontWeight="normal"
                          price={t('currency', { val: price })}
                          salePrice={salePrice && t('currency', { val: salePrice })}
                        />
                      ),
                    }}
                    variant="body2"
                  />
                )}
                {discounts?.map((discount: any) => (
                  <KeyValueDisplay
                    key={`${discount?.discount?.name}`}
                    color="error.main"
                    option={{
                      name: `${discount?.discount?.name}:`,
                      value: `-${t('currency', { val: discount?.impact })} `,
                    }}
                  />
                ))}
                {subscriptionFrequency && (
                  <Box pb={1}>
                    <KeyValueDisplay
                      option={{
                        name: t('subscription-frequency'),
                        value: subscriptionFrequency,
                      }}
                    />
                  </Box>
                )}
              </Collapse>
              {isPickupItem && expectedDeliveryDate && (
                <Box color={theme.palette.primary.main} data-testid="pickup-info">
                  <KeyValueDisplay
                    option={{ name: t('estimated-pickup'), value: expectedDeliveryDate }}
                    variant="body2"
                    fontWeight="bold"
                  />
                </Box>
              )}
            </Box>
          </CardContent>
        </Stack>
      </Box>

      {isPickupItem && (
        <>
          <Box sx={{ display: 'inline-flex' }} px={2}>
            <KeyValueDisplay
              option={{ name: t('pickup'), value: purchaseLocation }}
              variant="caption"
            />
          </Box>
          {showChangeStoreLink && (
            <Box px={2}>
              <MuiLink
                component="button"
                variant="caption"
                color="text.primary"
                onClick={onStoreLocatorClick}
              >
                {purchaseLocation ? t('change-store') : t('select-store')}
              </MuiLink>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export default ProductItem
