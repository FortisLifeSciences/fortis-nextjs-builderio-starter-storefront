import React, { ReactNode } from 'react'

import { Card, Box, SxProps, Theme, Grid, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'next-i18next'

import { Price } from '@/components/common'

import type { CrProductOption } from '@/lib/gql/types'

export interface ProductItemProps {
  id: string
  productCode: string
  name: string
  options?: CrProductOption[]
  price?: string
  salePrice?: string
  qty: number
  children?: ReactNode
}

const styles = {
  card: {
    maxWidth: '100%',
    marginBottom: {
      xs: '1.25rem',
      sm: '1.25rem',
      md: '1.25rem',
    },
    border: {
      xs: `2px solid ${grey[300]}`,
      md: `2px solid ${grey[300]}`,
    },
    boxShadow: 'none',
  },
  cartItemContainer: {
    display: 'flex',
    flexDirection: {
      xs: 'column',
      md: 'row',
    },
    padding: '1.25rem 1.25rem',
    justifyContent: 'space-around',
  },
  subContainer: {
    flex: 1,
    padding: '0',
    paddingTop: {
      xs: 0,
      md: 0,
    },
    paddingLeft: {
      xs: 0,
      md: 0,
    },
  },
  itemSubContainer: {
    marginBottom: '1rem',
  } as SxProps<Theme>,
}

const CheckoutProductItem = (props: ProductItemProps) => {
  const { id, name, price, salePrice, qty, options, productCode } = props
  const { t } = useTranslation('common')
  return (
    <>
      <Card key={id} sx={{ ...styles.card }} role="group">
        <Box sx={{ ...styles.cartItemContainer }}>
          <Box sx={{ ...styles.subContainer }}>
            <Grid container>
              <Grid sx={{ ...styles.itemSubContainer }} item sm={12}>
                <Grid container>
                  <Grid
                    item
                    xs={12}
                    sm={8}
                    md={8}
                    lg={8}
                    sx={{
                      marginBottom: {
                        xs: '8px',
                      },
                    }}
                  >
                    <Typography variant="body1" data-testid="productName">
                      {name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: {
                          md: 'flex-end',
                          sm: 'flex-end',
                        },
                      }}
                    >
                      <Price
                        variant="body1"
                        fontWeight="500"
                        color="gray.900"
                        price={t('currency', {
                          val: price,
                        })}
                        salePrice={
                          salePrice
                            ? t('currency', {
                                val: salePrice,
                              })
                            : undefined
                        }
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sm={12}>
                <Grid container>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={4}
                    lg={4}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: {
                        xs: '8px',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'gray.900' }}>
                      {options && options[0]?.value}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={4}
                    lg={4}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: {
                        sm: 'flex-end',
                        md: 'flex-end',
                        lg: 'flex-end',
                      },
                      marginBottom: {
                        xs: '8px',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'gray.900' }}>
                        {productCode}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={4}
                    lg={4}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: {
                        sm: 'flex-end',
                        md: 'flex-end',
                        lg: 'flex-end',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'gray.900' }}>
                        Quantity: {qty}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Card>
    </>
  )
}

export default CheckoutProductItem
