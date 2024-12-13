import React from 'react'

import { Box, Card, Grid, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'next-i18next'

import { CrOrderItem, Maybe } from '@/lib/gql/types'

export interface ConfirmationDetailsProps {
  detailsData?: any
}

const styles = {
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
  detailItemContainer: {
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
}

const ConfirmationDetails = (props: ConfirmationDetailsProps) => {
  const { detailsData } = props

  const { t } = useTranslation('common')

  const detailType = detailsData?.detailType

  if (detailType === 'shipping') {
    return (
      <Card sx={{ ...styles.card }} role="group">
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ ...styles.detailItemContainer }}>
            <Box sx={{ ...styles.subContainer }}>
              <Grid container>
                <Grid item xs={12} sx={{ display: 'flex' }}>
                  <Grid item md={6} xs={12} sx={{ flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      {t('shipping-method')}
                    </Typography>
                    <Typography variant="body2">
                      {detailsData?.shippingMethod?.shippingMethodName}
                    </Typography>
                    {detailsData?.shippingMethod?.shippingMethodCode && (
                      <Typography variant="body2">
                        #{detailsData?.shippingMethod?.shippingMethodCode}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item md={6} xs={12} sx={{ flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      {t('shipping-address')}
                    </Typography>
                    <Typography variant="body2">
                      {detailsData?.firstName} {detailsData?.lastNameOrSurname}
                    </Typography>
                    <Typography variant="body2">{detailsData?.companyOrOrganization}</Typography>
                    <Typography variant="body2">
                      {detailsData?.shippingAddress?.address1}
                    </Typography>
                    <Typography variant="body2">
                      {detailsData?.shippingAddress?.address2}
                    </Typography>
                    <Typography variant="body2">
                      {detailsData?.shippingAddress?.cityOrTown},{' '}
                      {detailsData?.shippingAddress?.stateOrProvince}{' '}
                      {detailsData?.shippingAddress?.postalOrZipCode}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Card>
    )
  }

  if (detailType === 'billing') {
    return (
      <Card sx={{ ...styles.card }} role="group">
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ ...styles.detailItemContainer }}>
            <Box sx={{ ...styles.subContainer }}>
              <Grid container>
                <Grid item xs={12} sx={{ display: 'flex' }}>
                  <Grid item md={6} sm={12} sx={{ flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      {t('payment-method')}
                    </Typography>
                    <Typography variant="body2">
                      {detailsData?.payment?.payment?.paymentType}
                    </Typography>
                    {detailsData?.payment?.payment?.billingInfo?.card && (
                      <Typography variant="body2">
                        {detailsData?.payment?.payment?.billingInfo?.card?.paymentOrCardType}{' '}
                        {detailsData?.payment?.payment?.billingInfo?.card?.cardNumberPartOrMask}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {t('authorizer-name')}: {detailsData?.firstName}{' '}
                      {detailsData?.lastNameOrSurname}
                    </Typography>
                    <Typography variant="body2">
                      {t('authorizer-phone')}:{' '}
                      {detailsData?.payment?.payment?.billingInfo?.billingContact?.phoneNumbers
                        ?.work ??
                        detailsData?.payment?.payment?.billingInfo?.billingContact?.phoneNumbers
                          ?.home ??
                        t('no-phone-available')}
                    </Typography>
                  </Grid>
                  <Grid item md={6} sm={12} sx={{ flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      {t('shipping-address')}
                    </Typography>
                    <Typography variant="body2">
                      {detailsData?.firstName} {detailsData?.lastNameOrSurname}
                    </Typography>
                    <Typography variant="body2">{detailsData?.companyOrOrganization}</Typography>
                    <Typography variant="body2">{detailsData?.billingAddress?.address1}</Typography>
                    <Typography variant="body2">{detailsData?.billingAddress?.address2}</Typography>
                    <Typography variant="body2">
                      {detailsData?.billingAddress?.cityOrTown},{' '}
                      {detailsData?.billingAddress?.stateOrProvince}{' '}
                      {detailsData?.billingAddress?.postalOrZipCode}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Card>
    )
  }

  return null
}

export default ConfirmationDetails
