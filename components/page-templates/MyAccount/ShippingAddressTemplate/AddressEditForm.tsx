import React from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'
import { Controller, useForm } from 'react-hook-form'
import { isValidPhoneNumber } from 'react-phone-number-input'
import * as yup from 'yup'

import { getAddressDisplayName } from './AddressDisplayCard'
import { KiboPhoneInput, KiboStateSelect } from '@/components/common'
import { toE164PhoneNumber } from '@/components/common/KiboPhoneInput/KiboPhoneInput'
import {
  accountActionButton,
  accountFormInput,
  accountTextButton,
  accountType,
  accountSelectMenuProps,
} from '@/components/my-account/common'
import { CountryCode } from '@/lib/constants'

import type { CustomerContact } from '@/lib/gql/types'

export interface AddressEditFormValues {
  label: string
  firstName: string
  lastNameOrSurname: string
  email: string
  phoneNumber: string
  companyOrOrganization: string
  address1: string
  address2: string
  countryCode: string
  stateOrProvince: string
  cityOrTown: string
  postalOrZipCode: string
}

interface AddressEditFormProps {
  customerContact?: CustomerContact
  isDefault: boolean
  isNew: boolean
  onSave: (values: AddressEditFormValues, isDefault: boolean) => void
  onCancel: () => void
}

const styles = {
  card: {
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: '0.75rem',
    backgroundColor: 'grey.50',
    padding: { xs: '1.25rem', md: '1.5rem' },
    marginBottom: '1.5rem',
  },
  addressLabel: {
    ...accountType.cardTitle,
    fontWeight: 700,
    color: 'text.primary',
    lineHeight: 1.3,
  },
  defaultChip: {
    marginTop: '0.75rem',
    borderRadius: '1rem',
    borderColor: 'primary.main',
    color: 'primary.main',
    fontWeight: 600,
  },
  sectionTitle: {
    ...accountType.body,
    fontWeight: 700,
    color: 'text.primary',
    marginBottom: '0.75rem',
  },
  fieldLabel: {
    display: 'block',
    fontFamily: 'Poppins',
    fontSize: '15px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '150%',
    letterSpacing: '-0.005em',
    color: '#3B3B3B', // rgb(59, 59, 59)
    marginBottom: '6px',
    padding: 0,
  },
  input: accountFormInput,
  cancelButton: accountTextButton,
}

const useAddressSchema = () => {
  const { t } = useTranslation('common')

  return yup.object().shape({
    firstName: yup
      .string()
      .required(t('this-field-is-required'))
      .test('not-blank', t('this-field-is-required'), (value) => !!value?.trim()),
    lastNameOrSurname: yup
      .string()
      .required(t('this-field-is-required'))
      .test('not-blank', t('this-field-is-required'), (value) => !!value?.trim()),
    email: yup
      .string()
      .trim()
      .email(t('please-enter-a-valid-email-address'))
      .required(t('this-field-is-required')),
    phoneNumber: yup
      .string()
      .required(t('this-field-is-required'))
      .test('is-valid-phone-number', t('enter-valid-phone-number'), (value) =>
        value ? isValidPhoneNumber(value) : false
      ),
    companyOrOrganization: yup
      .string()
      .required(t('this-field-is-required'))
      .test('not-blank', t('this-field-is-required'), (value) => !!value?.trim()),
    address1: yup
      .string()
      .required(t('this-field-is-required'))
      .test('not-blank', t('this-field-is-required'), (value) => !!value?.trim()),
    address2: yup.string().trim().nullable(true).notRequired(),
    countryCode: yup.string().required(t('this-field-is-required')),
    stateOrProvince: yup.string().when('countryCode', {
      is: (value: string) => [CountryCode.US, CountryCode.CA].includes(value),
      then: yup.string().required(t('this-field-is-required')),
    }),
    cityOrTown: yup
      .string()
      .required(t('this-field-is-required'))
      .test('not-blank', t('this-field-is-required'), (value) => !!value?.trim()),
    postalOrZipCode: yup
      .string()
      .trim()
      .required(t('this-field-is-required'))
      .when('countryCode', {
        is: CountryCode.US,
        then: yup.string().matches(/^\d{5}(-\d{4})?$/, t('enter-valid-zip-code')),
      })
      .when('countryCode', {
        is: CountryCode.CA,
        then: yup.string().matches(/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, t('enter-valid-zip-code')),
      }),
  })
}

const AddressEditForm = (props: AddressEditFormProps) => {
  const { customerContact, isDefault, isNew, onSave, onCancel } = props
  const { t } = useTranslation('common')
  const { publicRuntimeConfig } = getConfig()

  const countries = publicRuntimeConfig.countries ?? []
  const provinces = publicRuntimeConfig.provinces ?? []

  const [makeDefault, setMakeDefault] = React.useState(isDefault)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AddressEditFormValues>({
    mode: 'onBlur',
    resolver: yupResolver(useAddressSchema()),
    defaultValues: {
      label: customerContact?.label ?? '',
      firstName: customerContact?.firstName ?? '',
      lastNameOrSurname: customerContact?.lastNameOrSurname ?? '',
      email: customerContact?.email ?? '',
      phoneNumber:
        toE164PhoneNumber(
          customerContact?.phoneNumbers?.home ?? customerContact?.phoneNumbers?.work
        ) || '',
      companyOrOrganization: customerContact?.companyOrOrganization ?? '',
      address1: customerContact?.address?.address1 ?? '',
      address2: customerContact?.address?.address2 ?? '',
      countryCode: customerContact?.address?.countryCode ?? countries[0]?.code ?? '',
      stateOrProvince: customerContact?.address?.stateOrProvince ?? '',
      cityOrTown: customerContact?.address?.cityOrTown ?? '',
      postalOrZipCode: customerContact?.address?.postalOrZipCode ?? '',
    },
  })

  const isStateRequired = [CountryCode.US, CountryCode.CA].includes(watch('countryCode'))

  const renderField = (
    name: keyof AddressEditFormValues,
    label: string,
    options?: {
      select?: 'country' | 'province'
      maxLength?: number
      digitsAndHyphen?: boolean
      numeric?: boolean
      required?: boolean
    }
  ) => (
    <>
      <Typography component="label" htmlFor={name} sx={{ ...styles.fieldLabel }}>
        {label}
        {options?.required && (
          <Box component="span" aria-hidden="true" sx={{ color: 'text.secondary', ml: 0.5 }}>
            *
          </Box>
        )}
      </Typography>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            id={name}
            fullWidth
            size="small"
            select={Boolean(options?.select)}
            SelectProps={{ MenuProps: accountSelectMenuProps }}
            error={Boolean(errors?.[name])}
            helperText={errors?.[name]?.message}
            sx={{ ...styles.input }}
            inputProps={{
              maxLength: options?.maxLength,
              'aria-label': label,
              'aria-required': options?.required,
            }}
            onChange={(event) => {
              const value = event.target.value
              field.onChange(
                options?.numeric
                  ? value.replace(/[^0-9]/g, '')
                  : options?.digitsAndHyphen
                  ? value.replace(/[^0-9-]/g, '')
                  : value
              )
            }}
          >
            {options?.select === 'country' &&
              countries.map((country: { name: string; code: string }) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.name}
                </MenuItem>
              ))}
            {options?.select === 'province' &&
              provinces.map((province: { name: string; code: string }) => (
                <MenuItem key={province.code} value={province.code}>
                  {province.name}
                </MenuItem>
              ))}
          </TextField>
        )}
      />
    </>
  )

  return (
    <Box sx={{ ...styles.card }} component="form" noValidate>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={4}>
          <Typography component="h2" sx={{ ...styles.addressLabel }}>
            {isNew
              ? t('add-new-address')
              : getAddressDisplayName(customerContact as CustomerContact)}
          </Typography>
          {isDefault && (
            <Chip
              label={t('default')}
              size="small"
              variant="outlined"
              sx={{ ...styles.defaultChip }}
            />
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography component="h3" sx={{ ...styles.sectionTitle }}>
            {t('contact-information')}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {renderField('firstName', String(t('first-name')), { required: true })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('lastNameOrSurname', String(t('last-name-or-sur-name')), {
                required: true,
              })}
            </Grid>
            <Grid item xs={12}>
              {renderField('email', String(t('invoice-email')), { required: true })}
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <KiboPhoneInput
                    {...field}
                    value={field.value || ''}
                    label={String(t('phone-number'))}
                    error={Boolean(errors?.phoneNumber)}
                    helperText={errors?.phoneNumber?.message}
                    onChange={(_name: string, value: string) => field.onChange(value)}
                    onBlur={field.onBlur}
                    required
                  />
                )}
              />
            </Grid>
          </Grid>

          <Typography component="h3" sx={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>
            {t('shipping-information')}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              {renderField(
                'companyOrOrganization',
                String(t('company-institution-or-organization')),
                { required: true }
              )}
            </Grid>
            <Grid item xs={12}>
              {renderField('address1', String(t('street-address-1')), { required: true })}
            </Grid>
            <Grid item xs={12}>
              {renderField('address2', String(t('street-address-2')))}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('countryCode', String(t('country')), {
                select: 'country',
                required: true,
              })}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="stateOrProvince"
                control={control}
                render={({ field }) => (
                  <KiboStateSelect
                    name="stateOrProvince"
                    label={String(t('state'))}
                    options={provinces}
                    value={field.value}
                    error={Boolean(errors?.stateOrProvince)}
                    helperText={errors?.stateOrProvince?.message}
                    onChange={(_name: string, value: string) => field.onChange(value)}
                    onBlur={field.onBlur}
                    required={isStateRequired}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('cityOrTown', String(t('city')), { required: true })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('postalOrZipCode', String(t('zip-code')), {
                required: true,
                digitsAndHyphen: true,
                maxLength: 10,
              })}
            </Grid>
          </Grid>

          <FormControlLabel
            sx={{ marginTop: '0.75rem' }}
            label={String(t('make-this-my-default-address'))}
            control={
              <Checkbox
                checked={makeDefault}
                onChange={() => setMakeDefault(!makeDefault)}
                inputProps={{ 'aria-label': String(t('make-this-my-default-address')) }}
              />
            }
          />

          <Stack direction="row" alignItems="center" gap={2} sx={{ marginTop: '1rem' }}>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              startIcon={<AddIcon />}
              sx={{ ...accountActionButton }}
              onClick={handleSubmit((values) =>
                onSave(
                  {
                    ...values,
                    firstName: values.firstName.trim().replace(/\s+/g, ' '),
                    lastNameOrSurname: values.lastNameOrSurname.trim().replace(/\s+/g, ' '),
                    companyOrOrganization: values.companyOrOrganization.trim(),
                    address1: values.address1.trim(),
                    address2: values.address2?.trim() ?? '',
                    cityOrTown: values.cityOrTown.trim(),
                  },
                  makeDefault
                )
              )}
            >
              {t('save-changes')}
            </Button>
            <Button variant="text" sx={{ ...styles.cancelButton }} onClick={onCancel}>
              {t('cancel')}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AddressEditForm
