import React, { useEffect, useState } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Divider, FormControl, Grid, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

import { B2BAccountCreateFormStyles } from '@/components/b2b/AccountHierarchy/B2BAccountCreateForm/B2BAccountCreateForm.styles'
import { KiboTextBox } from '@/components/common'

import type { CustomerAccount } from '@/lib/gql/types'

export interface FedexNumberInputData {
  fedexNumber: string
}
export interface UpsNumberInputData {
  upsNumber: string
}

interface MyProfileProps {
  user: CustomerAccount
  setAutoFocus?: boolean
}

interface AuditInfo {
  updateDate: string
  createDate: string
  updateBy: string
  createBy: string
}

interface UserAttribute {
  auditInfo: AuditInfo
  fullyQualifiedName: string
  attributeDefinitionId: number
  values: string[]
}

const ShippingPreferences = (props: MyProfileProps) => {
  const { setAutoFocus = true, user } = props
  const { t } = useTranslation('common')
  const [userAttribute, setUserAttribute] = useState<UserAttribute | null>(null)
  const [fedexNumber, setFedexNumber] = useState('')
  const [editFedexForm, setEditFedexForm] = useState(false)

  const [upsAttribute, setUpsAttribute] = useState<UserAttribute | null>(null)
  const [upsNumber, setUpsNumber] = useState('')
  const [editUpsForm, setEditUpsForm] = useState(false)
  const [fedexTrigger, setFedexTrigger] = useState(0)
  const [upsTrigger, setUpsTrigger] = useState(0)

  // FedEx payload
  const fedexPayload = {
    userId: user?.userId,
    accountId: user?.id,
    attributeFqn: 'tenant~customer-fedex-account-number',
  }
  // UPS payload
  const upsPayload = {
    userId: user?.userId,
    accountId: user?.id,
    attributeFqn: 'tenant~customer-ups-account-number',
  }

  // Fetch FedEx attribute
  useEffect(() => {
    const fetchFedexSettings = async () => {
      if (!user?.id || !user?.userId) return

      const entityResponse = await fetch('/api/user/getCustomerAttribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: fedexPayload }),
      })

      const attributeDetails = await entityResponse.json()
      setFedexNumber(attributeDetails?.data?.values?.[0] || '')
      setUserAttribute(attributeDetails?.data)
    }

    fetchFedexSettings()
  }, [user?.id, fedexTrigger])

  // Fetch UPS attribute
  useEffect(() => {
    const fetchUpsSettings = async () => {
      if (!user?.id || !user?.userId) return

      const entityResponse = await fetch('/api/user/getCustomerAttribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: upsPayload }),
      })

      const attributeDetails = await entityResponse.json()
      setUpsNumber(attributeDetails?.data?.values?.[0] || '')
      setUpsAttribute(attributeDetails?.data)
    }

    fetchUpsSettings()
  }, [user?.id, upsTrigger])

  useEffect(() => {
    setFedexTrigger((prev) => prev + 1)
  }, [fedexNumber])

  useEffect(() => {
    setUpsTrigger((prev) => prev + 1)
  }, [upsNumber])

  // FedEx validation schema
  const useFedexDetailsSchema: any = () => {
    return yup.object().shape({
      fedexNumber: yup
        .string()
        .matches(/^[0-9]*$/, t('please-enter-a-valid-account-number'))
        .test(
          'empty-or-length-9',
          t('please-enter-a-valid-account-number'),
          (value) => !value || value.length === 9
        )
        .matches(/^\S*$/, t('spaces-are-not-allowed')),
    })
  }

  // UPS validation schema
  const useUpsDetailsSchema: any = () => {
    return yup.object().shape({
      upsNumber: yup
        .string()
        .matches(/^[a-zA-Z0-9]*$/, t('please-enter-a-valid-account-number'))
        .test(
          'empty-or-length-6',
          t('please-enter-a-valid-account-number'),
          (value) => !value || value.length === 6
        )
        .matches(/^\S*$/, t('spaces-are-not-allowed')),
    })
  }

  // FedEx form
  const {
    formState: { errors: fedexErrors, isValid: isFedexValid },
    handleSubmit: handleFedexSubmit,
    control: fedexControl,
    reset: fedexReset,
  } = useForm({
    mode: 'all',
    reValidateMode: 'onBlur',
    defaultValues: {
      fedexNumber,
    },
    resolver: yupResolver(useFedexDetailsSchema()),
    shouldFocusError: true,
  })

  // UPS form
  const {
    formState: { errors: upsErrors, isValid: isUpsValid },
    handleSubmit: handleUpsSubmit,
    control: upsControl,
    reset: upsReset,
  } = useForm({
    mode: 'all',
    reValidateMode: 'onBlur',
    defaultValues: {
      upsNumber,
    },
    resolver: yupResolver(useUpsDetailsSchema()),
    shouldFocusError: true,
  })

  useEffect(() => {
    if (fedexNumber) {
      fedexReset({ fedexNumber })
    }
  }, [fedexNumber, fedexReset])

  useEffect(() => {
    if (upsNumber) {
      upsReset({ upsNumber })
    }
  }, [upsNumber, upsReset])

  // Save FedEx
  const handleAddFedexAttribute = async (data: FedexNumberInputData) => {
    const { userId, id: accountId } = user || {}
    const attributePayload = userAttribute
    const payload = {
      userId,
      accountId,
      attributeFqn: attributePayload?.fullyQualifiedName || 'tenant~customer-fedex-account-number',
      attributeDefinitionId: attributePayload?.attributeDefinitionId,
      value: data?.fedexNumber,
    }

    try {
      const apiEndpoint =
        attributePayload?.fullyQualifiedName === payload?.attributeFqn
          ? '/api/user/updateCustomerAttribute'
          : '/api/addCustomerAttribute'
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Payload: payload }),
      })

      const attributeDetails = await response.json()
      const fedexNumber = attributeDetails?.data?.values?.[0] || ''

      setFedexNumber(fedexNumber)
    } catch (error) {
      console.error('Error updating FedEx number:', error)
      setFedexNumber('')
    }

    setEditFedexForm(false)
  }

  // Save UPS
  const handleAddUpsAttribute = async (data: UpsNumberInputData) => {
    const { userId, id: accountId } = user || {}
    const attributePayload = upsAttribute
    const payload = {
      userId,
      accountId,
      attributeFqn: attributePayload?.fullyQualifiedName || 'tenant~customer-ups-account-number',
      attributeDefinitionId: attributePayload?.attributeDefinitionId,
      value: data?.upsNumber,
    }

    try {
      const apiEndpoint =
        attributePayload?.fullyQualifiedName === payload?.attributeFqn
          ? '/api/user/updateCustomerAttribute'
          : '/api/addCustomerAttribute'

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Payload: payload }),
      })

      const attributeDetails = await response.json()
      const upsNumber = attributeDetails?.data?.values?.[0] || ''

      setUpsNumber(upsNumber)
    } catch (error) {
      console.error('Error updating UPS number:', error)
      setUpsNumber('')
    }

    setEditUpsForm(false)
  }

  return (
    <>
      {/* FedEx Shipping Section */}
      <Box width="100%">
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: '500' }}>
            Customer Shipping Accounts
          </Typography>
          <Divider
            sx={{
              borderColor: 'grey.300',
              marginBottom: '20px',
            }}
          />
          {!editFedexForm && (
            <Box>
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: '500', marginBottom: '5px' }}
              >
                FedEx Shipping{' '}
                <Button onClick={() => setEditFedexForm(true)}>
                  <span className="material-symbols-outlined">edit</span>
                </Button>
              </Typography>
              {fedexNumber && (
                <>
                  <Typography variant="body2" sx={{ color: 'gray.900' }}>
                    Fed<span style={{ textTransform: 'capitalize' }}>Ex</span> Account Number
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'gray.900' }}>
                    {fedexNumber}
                  </Typography>
                </>
              )}
            </Box>
          )}

          {editFedexForm && (
            <Box>
              <form onSubmit={handleFedexSubmit(handleAddFedexAttribute)}>
                <FormControl sx={{ width: '100%' }}>
                  <Controller
                    name="fedexNumber"
                    control={fedexControl}
                    render={({ field }) => (
                      <KiboTextBox
                        name="fedexNumber"
                        value={field.value}
                        label={t('FedEx Account Number')}
                        required={false}
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus={setAutoFocus}
                        onBlur={field.onBlur}
                        onChange={(_name, value) => {
                          const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 9)
                          field.onChange(sanitizedValue)
                        }}
                        error={!!fedexErrors?.fedexNumber}
                        helperText={fedexErrors?.fedexNumber?.message}
                        inputProps={{ maxLength: 9 }}
                      />
                    )}
                  />
                  <Grid container columnSpacing={{ md: 5 }} sx={{ marginTop: '30px' }}>
                    <Grid
                      item
                      sm={12}
                      xs={12}
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}
                    >
                      <Button
                        sx={{
                          ...B2BAccountCreateFormStyles.buttonSecondary,
                        }}
                        onClick={() => setEditFedexForm(false)}
                      >
                        {t('cancel')}
                      </Button>
                      <Button
                        variant="contained"
                        type="submit"
                        sx={{
                          width: 'auto',
                          backgroundColor: !isFedexValid ? 'grey.600' : 'primary.main',
                          color: 'secondary.light',
                          textAlign: 'center',
                          fontFamily: 'Poppins',
                          fontSize: '16px',
                          fontStyle: 'normal',
                          fontWeight: '500',
                          lineHeight: '24px',
                          borderRadius: '0px 26px',
                          border: !isFedexValid ? '1px solid grey.600' : '1px solid primary.main',
                          padding: '12px 30px',
                          boxShadow: 'none',
                          '&:hover': {
                            backgroundColor: !isFedexValid ? 'grey.600' : 'primary.light',
                            border: !isFedexValid
                              ? '1px solid grey.600'
                              : '1px solid primary.light',
                          },
                          marginLeft: '20px',
                        }}
                        disabled={!isFedexValid}
                      >
                        {t('save')}
                      </Button>
                    </Grid>
                  </Grid>
                </FormControl>
              </form>
            </Box>
          )}

          {/* UPS Shipping Section */}
          {!editUpsForm && (
            <Box>
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: '500', marginBottom: '5px' }}
              >
                UPS Shipping{' '}
                <Button onClick={() => setEditUpsForm(true)}>
                  <span className="material-symbols-outlined">edit</span>
                </Button>
              </Typography>
              {upsNumber && (
                <>
                  <Typography variant="body2" sx={{ color: 'gray.900' }}>
                    UPS Account Number
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'gray.900' }}>
                    {upsNumber}
                  </Typography>
                </>
              )}
            </Box>
          )}

          {editUpsForm && (
            <Box>
              <form onSubmit={handleUpsSubmit(handleAddUpsAttribute)}>
                <FormControl sx={{ width: '100%' }}>
                  <Controller
                    name="upsNumber"
                    control={upsControl}
                    render={({ field }) => (
                      <KiboTextBox
                        name="upsNumber"
                        value={field.value}
                        label={t('UPS Account Number')}
                        required={false}
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus={setAutoFocus}
                        onBlur={field.onBlur}
                        onChange={(_name, value) => {
                          const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)
                          field.onChange(sanitizedValue)
                        }}
                        error={!!upsErrors?.upsNumber}
                        helperText={upsErrors?.upsNumber?.message}
                        inputProps={{ maxLength: 6 }}
                      />
                    )}
                  />
                  <Grid container columnSpacing={{ md: 5 }} sx={{ marginTop: '30px' }}>
                    <Grid
                      item
                      sm={12}
                      xs={12}
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}
                    >
                      <Button
                        sx={{
                          ...B2BAccountCreateFormStyles.buttonSecondary,
                        }}
                        onClick={() => setEditUpsForm(false)}
                      >
                        {t('cancel')}
                      </Button>
                      <Button
                        variant="contained"
                        type="submit"
                        sx={{
                          width: 'auto',
                          backgroundColor: !isUpsValid ? 'grey.600' : 'primary.main',
                          color: 'secondary.light',
                          textAlign: 'center',
                          fontFamily: 'Poppins',
                          fontSize: '16px',
                          fontStyle: 'normal',
                          fontWeight: '500',
                          lineHeight: '24px',
                          borderRadius: '0px 26px',
                          border: !isUpsValid ? '1px solid grey.600' : '1px solid primary.main',
                          padding: '12px 30px',
                          boxShadow: 'none',
                          '&:hover': {
                            backgroundColor: !isUpsValid ? 'grey.600' : 'primary.light',
                            border: !isUpsValid ? '1px solid grey.600' : '1px solid primary.light',
                          },
                          marginLeft: '20px',
                        }}
                        disabled={!isUpsValid}
                      >
                        {t('save')}
                      </Button>
                    </Grid>
                  </Grid>
                </FormControl>
              </form>
            </Box>
          )}
        </Box>
      </Box>
    </>
  )
}

export default ShippingPreferences
