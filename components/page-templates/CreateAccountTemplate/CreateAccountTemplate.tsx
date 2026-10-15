import React from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { KiboTextBox } from '@/components/common'
import { B2BAccountFormDialog } from '@/components/dialogs'
import { ExistingUserDialog, LoginDialog } from '@/components/layout'
import { useModalContext } from '@/context/ModalContext'
import { useB2BAccountRequest } from '@/hooks'

export interface CreateAccountPrefill {
  firstName?: string
  lastNameOrSurname?: string
  companyOrOrganization?: string
  email?: string
}

interface CreateAccountFormData {
  firstName: string
  lastNameOrSurname: string
  companyOrOrganization: string
  email: string
  acceptsMarketing: boolean
  termsAccepted: boolean
}

const colors = {
  heading: '#070707',
  body: '#454545',
  accent: '#30299A',
}

// Same cut-corner pill treatment used for the order-confirmation page's action buttons.
const actionButtonSx = {
  borderRadius: '0px 26px',
  whiteSpace: 'nowrap' as const,
  textTransform: 'none' as const,
  fontFamily: 'Poppins',
  fontWeight: 600,
  fontSize: '13px',
  lineHeight: '150%',
  letterSpacing: 'normal',
  height: '44px',
  cursor: 'pointer',
}

const useCreateAccountSchema = () => {
  const { t } = useTranslation('common')
  return yup.object().shape({
    firstName: yup.string().required(t('this-field-is-required')),
    lastNameOrSurname: yup.string().required(t('this-field-is-required')),
    companyOrOrganization: yup.string().required(t('this-field-is-required')),
    email: yup
      .string()
      .email(t('please-enter-a-valid-email-address'))
      .required(t('this-field-is-required')),
    acceptsMarketing: yup.boolean(),
    termsAccepted: yup.boolean().oneOf([true], t('please-agree-to-terms')),
  })
}

const CreateAccountTemplate = ({ prefill }: { prefill?: CreateAccountPrefill }) => {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { showModal, closeModal } = useModalContext()
  const { submitAccountRequest, isSubmitting } = useB2BAccountRequest()

  const schema = useCreateAccountSchema()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<CreateAccountFormData>({
    mode: 'onChange',
    reValidateMode: 'onBlur',
    defaultValues: {
      firstName: prefill?.firstName ?? '',
      lastNameOrSurname: prefill?.lastNameOrSurname ?? '',
      companyOrOrganization: prefill?.companyOrOrganization ?? '',
      email: prefill?.email ?? '',
      acceptsMarketing: false,
      termsAccepted: false,
    },
    resolver: yupResolver(schema),
    shouldFocusError: true,
  })

  const openLoginModal = () => showModal({ Component: LoginDialog })

  const onSubmit = (formData: CreateAccountFormData) =>
    submitAccountRequest(
      {
        firstName: formData.firstName,
        lastName: formData.lastNameOrSurname,
        companyOrOrganization: formData.companyOrOrganization,
        emailAddress: formData.email,
        acceptsMarketing: formData.acceptsMarketing,
      },
      {
        onExistingUser: () => showModal({ Component: ExistingUserDialog }),
        onSuccess: () => router.push({ pathname: '/account-success' }),
        onError: () =>
          showModal({
            Component: B2BAccountFormDialog,
            props: {
              primaryButtonText: t('contact-us'),
              formTitle: t('b2b-account-request'),
              isAccountCreationError: true,
              onClose: () => closeModal(),
            },
          }),
      }
    )

  return (
    <Container maxWidth="lg">
      <Box sx={{ maxWidth: '860px', mx: 'auto', py: 6 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '28px', color: colors.accent, mb: 1.5 }}>
          {t('create-an-account')}
        </Typography>
        <Typography sx={{ fontSize: '15px', color: colors.body, mb: 2 }}>
          {t('create-account-description')}
        </Typography>
        <Typography sx={{ fontSize: '13px', color: colors.body, mb: 3 }}>
          {t('indicates-a-required-field')}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack gap={2}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <KiboTextBox
                    {...field}
                    value={field.value}
                    label={t('first-name')}
                    required
                    onChange={(_name, value) => field.onChange(value)}
                    onBlur={field.onBlur}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
              <Controller
                name="lastNameOrSurname"
                control={control}
                render={({ field }) => (
                  <KiboTextBox
                    {...field}
                    value={field.value}
                    label={t('last-name-or-sur-name')}
                    required
                    onChange={(_name, value) => field.onChange(value)}
                    onBlur={field.onBlur}
                    error={!!errors.lastNameOrSurname}
                    helperText={errors.lastNameOrSurname?.message}
                  />
                )}
              />
              <Controller
                name="companyOrOrganization"
                control={control}
                render={({ field }) => (
                  <KiboTextBox
                    {...field}
                    value={field.value}
                    label={t('company-or-organization')}
                    required
                    onChange={(_name, value) => field.onChange(value)}
                    onBlur={field.onBlur}
                    error={!!errors.companyOrOrganization}
                    helperText={errors.companyOrOrganization?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <KiboTextBox
                    {...field}
                    value={field.value}
                    label={t('email-address')}
                    required
                    onChange={(_name, value) => field.onChange(value)}
                    onBlur={field.onBlur}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography sx={{ fontSize: '14px', color: colors.body, mb: 1.5 }}>
              {t('mailing-list-description')}
            </Typography>
            <Controller
              name="acceptsMarketing"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  sx={{
                    alignItems: 'flex-start',
                    mb: 1,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '14px',
                      color: colors.body,
                      fontFamily: 'Poppins',
                    },
                  }}
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(_e, checked) => field.onChange(checked)}
                    />
                  }
                  label={t('mailing-list-checkbox-text')}
                />
              )}
            />
            <Controller
              name="termsAccepted"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  // Not using the `required` prop - MUI renders that asterisk as a separate
                  // flex item trailing the whole row, so with a wrapping multi-line label it
                  // lands far to the right instead of right after the text. Appended into the
                  // label string itself instead, below.
                  sx={{ alignItems: 'flex-start' }}
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(_e, checked) => field.onChange(checked)}
                    />
                  }
                  label={
                    <Box
                      component="span"
                      sx={{
                        fontSize: '14px',
                        color: colors.body,
                        fontFamily: 'Poppins',
                        '& a': { color: colors.accent, textDecoration: 'underline' },
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          t('terms-condition-checkbox-part1') +
                          `<a href="/sales-terms" target="_blank">${t(
                            'sales-terms-and-conditions'
                          )}</a> ${t('and-the')} <a href="/privacy-policy" target="_blank">${t(
                            'privacy-policy'
                          )}</a>*`,
                      }}
                    />
                  }
                />
              )}
            />
            {/* yup validates the whole form on every field's change (not just this checkbox),
                so this error would otherwise flash on while the user is still typing elsewhere.
                Only show it once they've actually tried to submit. */}
            {isSubmitted && errors.termsAccepted && (
              <Typography sx={{ color: 'error.main', fontSize: '12px', ml: '31px' }}>
                {errors.termsAccepted.message}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Typography sx={{ fontSize: '14px', color: colors.body }}>
            {t('already-have-an-account')}
            <MuiLink
              component="button"
              type="button"
              onClick={openLoginModal}
              sx={{ color: colors.accent, textDecoration: 'underline', ml: 0.5 }}
            >
              {t('log-in')}
            </MuiLink>
          </Typography>

          <Stack direction="row" gap={2}>
            <Button
              variant="outlined"
              component="a"
              href="/"
              sx={{
                ...actionButtonSx,
                borderColor: colors.accent,
                color: colors.accent,
                px: 3,
              }}
            >
              {t('cancel')}
            </Button>
            <LoadingButton
              variant="contained"
              color="primary"
              loading={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              sx={{
                ...actionButtonSx,
                backgroundColor: colors.accent,
                px: 3,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#4C47C4' },
              }}
            >
              {t('create-an-account')}
            </LoadingButton>
          </Stack>
        </Stack>
      </Box>
    </Container>
  )
}

export default CreateAccountTemplate
