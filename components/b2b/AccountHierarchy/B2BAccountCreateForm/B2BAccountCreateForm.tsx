import { useEffect, useState } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import { LoadingButton } from '@mui/lab'
import {
  Button,
  FormControl,
  MenuItem,
  Stack,
  Grid,
  Container,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Theme,
  Link,
} from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

import { B2BAccountCreateFormStyles } from './B2BAccountCreateForm.styles'
import { KiboSelect, KiboTextBox } from '@/components/common'
import FullWidthDivider from '@/components/common/FullWidthDivider/FullWidthDivider'
import { LoginDialog } from '@/components/layout'
import { useAuthContext, useModalContext } from '@/context'
import { CreateCustomerB2bAccountParams } from '@/lib/types'

import { B2BAccount, B2BUser } from '@/lib/gql/types'

interface AccountHierarchyFormProps {
  accounts?: B2BAccount[]
  isAddingAccountToChild: boolean
  isRequestAccount?: boolean
  primaryButtonText: string
  b2BAccount?: B2BAccount
  onSave: (data: CreateCustomerB2bAccountParams) => void
  onClose?: () => void
}

const useAccountHierarchySchema = (b2BAccount: B2BAccount, isRequestAccount: boolean) => {
  const { t } = useTranslation('common')
  return yup.object({
    parentAccount:
      b2BAccount || isRequestAccount
        ? yup.string()
        : yup.string().required(t('this-field-is-required')),
    companyOrOrganization: yup.string().required(t('this-field-is-required')),
    firstName: yup.string().required(t('this-field-is-required')),
    lastName: yup.string().required(t('this-field-is-required')),
    emailAddress: yup.string().required(t('this-field-is-required')),
  })
}

const B2BAccountCreateForm = (props: AccountHierarchyFormProps) => {
  const {
    accounts,
    isAddingAccountToChild,
    isRequestAccount = false,
    b2BAccount,
    primaryButtonText,
    onSave,
    onClose,
  } = props
  const [isLoading, setLoading] = useState<boolean>(false)
  const [selectedParentAccount, setSelectedParentAccount] = useState<B2BAccount>()
  const { showModal, closeModal } = useModalContext()
  const { isAuthenticated } = useAuthContext()
  const { t } = useTranslation()
  const accountHierarchySchema = useAccountHierarchySchema(
    b2BAccount as B2BAccount,
    isRequestAccount
  )

  const {
    formState: { errors, isValid },
    control,
    getValues,
    setValue,
    handleSubmit,
  } = useForm({
    defaultValues: {
      parentAccount: '',
      companyOrOrganization: '',
      firstName: '',
      lastName: '',
      emailAddress: '',
      taxId: '',
      mailingList: false,
      termsConditionCheck: false,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
    resolver: yupResolver(accountHierarchySchema),
    shouldFocusError: true,
  })

  const handleAccountIconClick = () => {
    if (!isAuthenticated) {
      showModal({ Component: LoginDialog })
    }
  }

  useEffect(() => {
    const hasMultipleAccounts = accounts?.length && accounts.length > 1
    if (!hasMultipleAccounts && !b2BAccount) {
      setValue('parentAccount', accounts?.[0]?.companyOrOrganization as string)
      setSelectedParentAccount(accounts?.[0])
    }

    if (b2BAccount) {
      const { parentAccountId, companyOrOrganization, taxId, users } = b2BAccount
      const parentAccount = accounts?.find((account) => account.id === parentAccountId)
      setValue('parentAccount', parentAccount?.companyOrOrganization as string)
      setValue('companyOrOrganization', companyOrOrganization as string)
      setValue('taxId', taxId as string)
      if (users?.length) {
        const { firstName, lastName, emailAddress } = users?.[0] as B2BUser
        setValue('firstName', firstName as string)
        setValue('lastName', lastName as string)
        setValue('emailAddress', emailAddress as string)
      }
      setSelectedParentAccount(parentAccount)
    }
  }, [accounts, b2BAccount, setValue])

  const onSubmit = () => {
    if (isLoading || !isValid) return
    setLoading(true)
    const formValues = getValues()
    onSave({
      ...formValues,
      parentAccount: selectedParentAccount,
    })
    setLoading(false)
  }

  const handleParentAccountChange = (name: string, value: string) => {
    const account: B2BAccount | undefined = accounts?.find(
      (account: B2BAccount) => account.id === parseInt(value)
    )
    setValue('parentAccount', account?.companyOrOrganization as string)
    setSelectedParentAccount(account)
  }

  const getParentAccountField = () => {
    if (isAddingAccountToChild)
      return (
        <Controller
          name="parentAccount"
          control={control}
          render={({ field }) => (
            <KiboTextBox
              value={field.value}
              label={t('parent-account')}
              onChange={(_name, value) => field.onChange(value)}
              onBlur={field.onBlur}
              disabled
              error={!!errors?.parentAccount}
              helperText={errors?.parentAccount?.message as string}
            />
          )}
        />
      )
    else
      return (
        <Controller
          name="parentAccount"
          control={control}
          render={({ field }) => (
            <KiboSelect
              sx={{ marginBottom: '20px' }}
              name="parentAccount"
              label={t('parent-account')}
              onChange={handleParentAccountChange}
              placeholder={t('select-parent-account')}
              error={!!errors?.parentAccount}
              helperText={errors?.parentAccount?.message as string}
              value={selectedParentAccount?.id?.toString() ?? ''}
            >
              {accounts?.map((account: B2BAccount) => {
                return (
                  <MenuItem key={account?.id} value={`${account?.id}`}>
                    {account?.companyOrOrganization}
                  </MenuItem>
                )
              })}
            </KiboSelect>
          )}
        />
      )
  }

  const primaryBtnCss = !isValid
    ? { ...B2BAccountCreateFormStyles.buttonDisabled }
    : { ...B2BAccountCreateFormStyles.buttonPrimary }

  return (
    <form data-testid="account-hierarchy-form" onSubmit={handleSubmit(onSubmit)}>
      <FormControl sx={{ width: '100%' }}>
        {!b2BAccount && !isRequestAccount ? getParentAccountField() : null}
        <Grid container columnSpacing={{ md: 5 }}>
          <Grid item sm={12}>
            <Box style={{ paddingBottom: '24px' }}>
              <Typography variant="body1" sx={{ ...B2BAccountCreateFormStyles.textStyle }}>
                {t('b2b-account-paragraph')}
              </Typography>
            </Box>
            <Box style={{ paddingBottom: '28px' }}>
              <Typography variant="body2" sx={{ ...B2BAccountCreateFormStyles.textStyle }}>
                {t('b2b-account-required-field-paragraph')}
              </Typography>
            </Box>
          </Grid>
          <Grid item sm={12} md={6}>
            {/* <Controller
                name="taxId"
                control={control}
                render={({ field }) => (
                  <KiboTextBox
                    value={field.value}
                    label={`${t('tax-id')} (${t('optional')})`}
                    onChange={(_name, value) => field.onChange(value)}
                    onBlur={field.onBlur}
                    error={!!errors?.taxId}
                    helperText={errors?.taxId?.message as string}
                  />
                )}
              /> */}

            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <KiboTextBox
                  value={field.value}
                  label={t('first-name')}
                  onChange={(_name, value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  error={!!errors?.firstName}
                  helperText={errors?.firstName?.message as string}
                  required
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <KiboTextBox
                  value={field.value}
                  label={t('last-name-or-sur-name')}
                  onChange={(_name, value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  error={!!errors?.lastName}
                  helperText={errors?.lastName?.message as string}
                  required
                />
              )}
            />

            <Controller
              name="companyOrOrganization"
              control={control}
              render={({ field }) => (
                <KiboTextBox
                  value={field.value}
                  label={t('company-name-label')}
                  onChange={(_name, value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  error={!!errors?.companyOrOrganization}
                  helperText={errors?.companyOrOrganization?.message as string}
                  required
                />
              )}
            />

            <Controller
              name="emailAddress"
              control={control}
              render={({ field }) => (
                <KiboTextBox
                  type="email"
                  value={field.value}
                  label={t('email-address')}
                  onChange={(_name, value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  error={!!errors?.emailAddress}
                  helperText={errors?.emailAddress?.message as string}
                  required
                />
              )}
            />
          </Grid>
          <Grid item sm={12} md={6}>
            <Box style={{ paddingBottom: '13px' }}>
              <Typography variant="body1" sx={{ ...B2BAccountCreateFormStyles.textStyle }}>
                {t('b2b-account-mailing-paragraph')}
              </Typography>
            </Box>
            <Box>
              <FormGroup>
                <Controller
                  name="mailingList"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      sx={{
                        ...B2BAccountCreateFormStyles.textStyle,
                        paddingBottom: '22px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        '& .MuiFormControlLabel-label': {
                          color: '#020027',
                          fontFamily: 'Poppins',
                          fontSize: '16px',
                          fontStyle: 'normal',
                          fontWeight: '300',
                          lineHeight: '25px',
                        },
                      }}
                      control={
                        <Checkbox
                          {...field} // Bind the field to the Checkbox
                          sx={{
                            padding: '3px 9px',
                            color: '#020027',
                            '&.Mui-checked': {
                              color: '#30299A',
                            },
                          }}
                          onChange={(_name, value) => field.onChange(value)} // Pass value directly to field.onChange
                        />
                      }
                      label={t('mailing-list-checkbox-text')}
                    />
                  )}
                />
                <Controller
                  name="termsConditionCheck"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      sx={{
                        ...B2BAccountCreateFormStyles.textStyle,
                        paddingBottom: '22px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        // Override default styles here
                        '& .MuiFormControlLabel-label': {
                          color: '#020027',
                          fontFamily: 'Poppins',
                          fontSize: '16px',
                          fontStyle: 'normal',
                          fontWeight: '300',
                          lineHeight: '25px',
                          '& a': {
                            fontFamily: 'Poppins',
                            fontSize: '16px',
                            fontWeight: '300',
                            lineHeight: '25px',
                            textAlign: 'left',
                            color: '#30299A',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                          },
                        },
                      }}
                      required
                      control={
                        <Checkbox
                          {...field} // Bind the field to the Checkbox
                          sx={{
                            padding: '3px 9px',
                            color: '#020027',
                            '&.Mui-checked': {
                              color: '#30299A',
                            },
                          }}
                          onChange={(_name, value) => field.onChange(value)} // Pass value directly to field.onChange
                        />
                      }
                      label={
                        <Box
                          dangerouslySetInnerHTML={{
                            __html:
                              t('terms-condition-checkbox-part1') +
                              '<a href="/sale-terms">Sale Terms and Conditions</a> and the <a href="/privacy-policy">Privacy Policy</a>',
                          }}
                        />
                      }
                    />
                  )}
                />
              </FormGroup>
            </Box>
          </Grid>
          <Grid item sm={12} xs={12}>
            <Divider
              sx={{
                borderColor: 'grey.300',
                marginBottom: '20px',
              }}
            />
            {/* <Stack gap={2} sx={{ ...B2BAccountCreateFormStyles.buttonStackStyle }}>

                <Box> <Typography
                    variant="body1"
                    sx={{ ...B2BAccountCreateFormStyles.textStyle }}
                  >
                    {t('already-have-an-account')}
                  </Typography>
                  <Button onClick={handleAccountIconClick} >log in</Button>
                </Box>
                
                <Button
                  sx={{ ...B2BAccountCreateFormStyles.buttonSecondary }}
                  data-testid="cancel-button"
                  variant="contained"
                  color="secondary"
                  type="reset"
                  onClick={onClose}
                >
                  {t('cancel')}
                </Button>
                <LoadingButton
                  sx={primaryBtnCss}
                  data-testid="submit-button"
                  variant="contained"
                  type="submit"
                  loading={isLoading}
                  disabled={!isValid}
                >
                  {primaryButtonText}
                </LoadingButton>
              </Stack> */}
          </Grid>

          <Grid item sm={12}>
            <Grid container columnSpacing={{ md: 5 }}>
              <Grid item sm={12} md={6} xs={12} sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { md: 'flex-start', xs: 'center' },
                  }}
                >
                  <Typography variant="body1" sx={{ ...B2BAccountCreateFormStyles.loginLinksText }}>
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
              </Grid>
              <Grid item sm={12} md={6} xs={12}>
                <Stack gap={2} sx={{ ...B2BAccountCreateFormStyles.buttonStackStyle }}>
                  <Button
                    sx={{ ...B2BAccountCreateFormStyles.buttonSecondary }}
                    data-testid="cancel-button"
                    variant="contained"
                    color="secondary"
                    type="reset"
                    onClick={onClose}
                  >
                    {t('cancel')}
                  </Button>
                  <LoadingButton
                    sx={primaryBtnCss}
                    data-testid="submit-button"
                    variant="contained"
                    type="submit"
                    loading={isLoading}
                    disabled={!isValid}
                  >
                    {primaryButtonText}
                  </LoadingButton>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </FormControl>
    </form>
  )
}

export default B2BAccountCreateForm
