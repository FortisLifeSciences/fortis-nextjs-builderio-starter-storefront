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
  const [userAttribute, setUserAttribute] = useState<UserAttribute[]>([])
  const [fedexNumber, setFedexNumber] = useState('')
  const [editForm, setEditForm] = useState(false)

  const payload = {
    userId: user?.userId,
    accountId: user?.id,
  }
  useEffect(() => {
    const fetchSettings = async () => {
      const entityResponse = await fetch('/api/user/getCustomerAttribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      })

      const attributeDetails = await entityResponse.json()
      const hasFQN = attributeDetails?.data?.items.filter(
        (item: { fullyQualifiedName: string }) =>
          item.fullyQualifiedName === 'tenant~customer-fedex-account-number'
      )
      setFedexNumber(hasFQN[0]?.values[0])
      setUserAttribute(hasFQN)
    }
    fetchSettings()
  }, [])

  const useDetailsSchema = () => {
    return yup.object().shape({
      fedexNumber: yup
        .string()
        .test(
          'empty-or-length-9',
          t('please-enter-a-valid-account-number'),
          (value) => !value || value.length === 9 // Allow empty or length 9
        )
        .matches(/^\S*$/, t('spaces-are-not-allowed')), // Disallow spaces
    })
  }

  // const fedexNumber = userAttribute ? userAttribute[0]?.values[0] : ''; // Fallback to an empty string

  const {
    formState: { errors, isValid },
    handleSubmit,
    control,
    reset,
  } = useForm({
    mode: 'all',
    reValidateMode: 'onBlur',
    defaultValues: {
      fedexNumber,
    },
    resolver: yupResolver(useDetailsSchema()),
    shouldFocusError: true,
  })

  useEffect(() => {
    if (fedexNumber) {
      reset({ fedexNumber }) // Dynamically update form values when fedexNumber changes
    }
  }, [fedexNumber, reset])

  const handleResetPassword = async (data: FedexNumberInputData) => {
    const Payload = {
      userId: user?.userId,
      accountId: user?.id,
      attributeDefinitionId: userAttribute[0]?.attributeDefinitionId,
      attributeFqn: userAttribute[0]?.fullyQualifiedName,
      value: data?.fedexNumber,
    }
    const attributeData = await fetch('/api/user/updateCustomerAttribute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Payload }),
    })

    const attributeDetails = await attributeData.json()
    if (attributeDetails?.data?.values[0]) {
      setFedexNumber(attributeDetails?.data?.values[0])
    } else {
      setFedexNumber('')
    }
    setEditForm(false)
  }

  useEffect(() => {
    const handleKeyPress = (event: { key: string; preventDefault: () => void }) => {
      if (event.key === 'Enter') {
        event.preventDefault() // Prevent default behavior
        handleSubmit(handleResetPassword)() // Explicitly call the handler
      }
    }
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <Box width="100%">
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: '500' }}>
          Fedex Shipping
        </Typography>
        <Divider
          sx={{
            borderColor: 'grey.300',
            marginBottom: '20px',
          }}
        />
        {!editForm && (
          <Box>
            <Typography
              variant="body2"
              sx={{ color: 'primary.main', fontWeight: '500', marginBottom: '5px' }}
            >
              Fedex Shipping{' '}
              <Button onClick={() => setEditForm(true)}>
                <span className="material-symbols-outlined">edit</span>
              </Button>
            </Typography>
            {fedexNumber && (
              <>
                <Typography variant="body2" sx={{ color: 'gray.900' }}>
                  Customer Fedex Account Number
                </Typography>
                <Typography variant="body2" sx={{ color: 'gray.900' }}>
                  {fedexNumber}
                </Typography>
              </>
            )}
          </Box>
        )}

        {editForm && (
          <Box>
            <Typography
              variant="body2"
              sx={{ color: 'primary.main', fontWeight: '500', marginBottom: '5px' }}
            >
              Fedex Shipping{' '}
            </Typography>
            <Typography variant="body2" sx={{ color: 'gray.900' }}>
              Customer Fedex Account Number
            </Typography>
            <form onSubmit={handleSubmit(handleResetPassword)}>
              <FormControl sx={{ width: '100%' }}>
                <Controller
                  name="fedexNumber"
                  control={control}
                  render={({ field }) => (
                    <KiboTextBox
                      name="fedexNumber"
                      value={field.value}
                      label={t('fedexNumber')}
                      required={false}
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus={setAutoFocus}
                      onBlur={field.onBlur}
                      onChange={(_name, value) => {
                        // Remove spaces dynamically as the user types
                        const sanitizedValue = value.replace(/\s/g, '')
                        field.onChange(sanitizedValue)
                      }}
                      error={!!errors?.fedexNumber}
                      helperText={errors?.fedexNumber?.message}
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
                      onClick={() => setEditForm(false)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{
                        width: 'auto',
                        backgroundColor: !isValid ? 'grey.600' : 'primary.main',
                        color: 'secondary.light',
                        textAlign: 'center',
                        fontFamily: 'Poppins',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: '500',
                        lineHeight: '24px',
                        borderRadius: '0px 26px',
                        border: !isValid ? '1px solid grey.600' : '1px solid primary.main',
                        padding: '12px 30px',
                        '&:hover': {
                          backgroundColor: !isValid ? 'grey.600' : 'primary.light',
                          border: !isValid ? '1px solid grey.600' : '1px solid primary.light',
                        },
                        marginLeft: '20px',
                      }}
                      onClick={() => handleSubmit(handleResetPassword)()}
                      disabled={!isValid}
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
  )
}

export default ShippingPreferences
