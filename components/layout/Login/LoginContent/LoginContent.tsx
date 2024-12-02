/* eslint-disable  jsx-a11y/no-autofocus */
import React, { SyntheticEvent, useState } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Box,
  FormControl,
  Button,
  Link,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  Divider,
} from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

import { KiboTextBox } from '@/components/common'

export interface LoginInputs {
  email: string
  password: string
  isRememberMe?: boolean
}

export type LoginData = {
  formData: LoginInputs
  isRememberMe: boolean
}

export interface LoginContentProps {
  onLogin: (data: LoginData) => void
  onForgotPasswordClick: () => void
  onRegisterNow: () => void
}

const styles = {
  contentBox: {
    padding: '0.875rem',
  },
  formInput: {
    maxWidth: '386px',
  },
}

const LoginContent = (props: LoginContentProps) => {
  const { onLogin, onForgotPasswordClick, onRegisterNow } = props

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isRememberMe, setIsRememberMe] = useState<boolean>(false)

  const handleClickShowPassword = () => setShowPassword(!showPassword)

  const loginInputs = {
    email: '',
    password: '',
  }

  const { t } = useTranslation('common')

  const useLoginInputSchema = () => {
    return yup.object().shape({
      email: yup
        .string()
        .email(t('email-must-be-a-valid-email'))
        .required(t('this-field-is-required')),
      password: yup.string().required(t('this-field-is-required')),
    })
  }

  const {
    formState: { errors, isValid },
    handleSubmit,
    control,
  } = useForm({
    mode: 'all',
    reValidateMode: 'onBlur',
    defaultValues: loginInputs,
    resolver: yupResolver(useLoginInputSchema()),
    shouldFocusError: true,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogin = async (formData: LoginInputs, e: any) => {
    e.preventDefault()
    const inputData = { formData, isRememberMe }
    onLogin(inputData)
  }

  const handleForgotPassword = (e: SyntheticEvent<Element, Event>) => {
    e.preventDefault()
    onForgotPasswordClick()
  }
  const registerNow = (e: SyntheticEvent<Element, Event>) => {
    e.preventDefault()
    onRegisterNow()
  }

  return (
    <Box
      sx={{ ...styles.contentBox, padding: '0px' }}
      data-testid="kibo-login-content"
      component="form"
      onSubmit={handleSubmit(handleLogin)}
      id="loginForm"
    >
      <FormControl sx={{ width: '100%', marginBottom: '20px' }}>
        <Controller
          name="email"
          control={control}
          defaultValue={loginInputs?.email}
          render={({ field }) => (
            <KiboTextBox
              name="email"
              value={field.value}
              label={t('email-address')}
              ref={null}
              required
              sx={{ ...styles.formInput }}
              onBlur={field.onBlur}
              onChange={(_name, value) => field.onChange(value)}
              error={!!errors?.email}
              helperText={errors?.email?.message}
              autoFocus={true}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          defaultValue={loginInputs?.password}
          render={({ field }) => (
            <KiboTextBox
              name="password"
              value={field.value}
              label={t('password')}
              ref={null}
              required
              sx={{ ...styles.formInput }}
              onBlur={field.onBlur}
              onChange={(_name, value) => {
                field.onChange(value)
              }}
              error={!!errors?.password}
              helperText={errors?.password?.message}
              type={showPassword ? 'text' : 'password'}
              icon={showPassword ? <Visibility /> : <VisibilityOff />}
              onIconClick={handleClickShowPassword}
            />
          )}
        />
        {/* <FormControlLabel
          sx={{ pb: 2 }}
          control={<Checkbox onChange={(_, checked) => setIsRememberMe(checked)} />}
          label={t('remember-me')}
          labelPlacement="end"
        /> */}
        <Link
          component="button"
          variant="body1"
          color="text.primary"
          onClick={handleForgotPassword}
          sx={{
            color: 'primary.main',
            textDecoration: 'underline',
            fontFamily: 'Poppins',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: '300',
            lineHeight: '25px',
            display: 'flex',
          }}
        >
          {t('forgot-password')}
        </Link>
        <Grid container columnSpacing={{ md: 5 }}>
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
                flexDirection: 'column',
              }}
            >
              <Typography variant="body2" sx={{ color: 'grey.900' }}>
                {t('do-not-have-an-account')}
              </Typography>
              <Link
                component="button"
                variant="body2"
                color="text.primary"
                onClick={registerNow}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'underline',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: '300',
                  lineHeight: '25px',
                  display: 'flex',
                }}
              >
                {t('create-an-account')}
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
              disabled={!isValid}
              type="submit"
              form="loginForm"
            >
              {t('log-in')}
            </Button>
          </Grid>
        </Grid>
      </FormControl>
    </Box>
  )
}

export default LoginContent
