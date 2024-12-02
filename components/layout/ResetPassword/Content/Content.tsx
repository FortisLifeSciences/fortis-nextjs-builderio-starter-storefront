/* eslint-disable  jsx-a11y/no-autofocus */
import React from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import { Box, FormControl, Button, Typography, Grid, Divider, Link } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

import { KiboTextBox } from '@/components/common'
import { LoginDialog } from '@/components/layout'
import { useAuthContext, useModalContext } from '@/context'

export interface ResetPasswordInputData {
  email: string
}

interface ContentProps {
  setAutoFocus?: boolean
  isResetPassword: boolean
  onResetPassword: (formData: ResetPasswordInputData) => void
}

const styles = {
  contentBox: {
    padding: '0.875rem 0',
  },
  formInput: {
    maxWidth: '386px',
  },
}

const Content = (props: ContentProps) => {
  const { setAutoFocus = true, isResetPassword, onResetPassword } = props

  const { t } = useTranslation('common')

  const { showModal } = useModalContext()
  const { isAuthenticated } = useAuthContext()

  const useDetailsSchema = () => {
    return yup.object().shape({
      email: yup.string().email().required(t('this-field-is-required')),
    })
  }

  const resetPasswordFormData = {
    email: '',
  }

  const {
    formState: { errors, isValid },
    handleSubmit,
    control,
  } = useForm({
    mode: 'all',
    reValidateMode: 'onBlur',
    defaultValues: resetPasswordFormData,
    resolver: yupResolver(useDetailsSchema()),
    shouldFocusError: true,
  })

  const handleResetPassword = async (data: ResetPasswordInputData) => {
    onResetPassword(data)
  }

  const handleAccountIconClick = () => {
    if (!isAuthenticated) {
      showModal({ Component: LoginDialog })
    }
  }

  return (
    <Box sx={{ ...styles.contentBox }}>
      <Box>
        <Typography variant="body2" sx={{ color: 'grey.900', paddingBottom: '30px' }}>
          {t('reset-password-paragraph')}
        </Typography>
      </Box>
      <FormControl sx={{ width: '100%' }}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <KiboTextBox
              name="email"
              value={field.value}
              label={t('email')}
              required
              autoFocus={setAutoFocus}
              sx={{ ...styles.formInput }}
              onBlur={field.onBlur}
              onChange={(_name, value) => field.onChange(value)}
              error={!!errors?.email}
              helperText={errors?.email?.message}
            />
          )}
        />

        {isResetPassword && (
          <Typography py={2} color="success.main">
            {t('reset-password-message')}
          </Typography>
        )}

        <Grid container columnSpacing={{ md: 5 }} sx={{ marginTop: '30px' }}>
          <Grid item sm={12} xs={12}>
            <Divider
              sx={{
                borderColor: 'grey.300',
                margin: '20px 0px',
              }}
            />
          </Grid>

          <Grid
            item
            sm={12}
            xs={12}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: { md: 'flex-start', xs: 'center' },
              }}
            >
              <Typography variant="body2" sx={{ color: 'grey.900' }}>
                {t('already-have-an-account')}
              </Typography>
              <Link
                component="button"
                variant="body1"
                sx={{
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontWeight: '300',
                  lineHeight: '25px',
                  textAlign: 'left',
                  color: '#30299A',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
                onClick={handleAccountIconClick}
              >
                {t('log-in')}
              </Link>
            </Box>
            <Button
              variant="contained"
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
              {t('reset-password')}
            </Button>
          </Grid>
        </Grid>
      </FormControl>
    </Box>
  )
}

export default Content
