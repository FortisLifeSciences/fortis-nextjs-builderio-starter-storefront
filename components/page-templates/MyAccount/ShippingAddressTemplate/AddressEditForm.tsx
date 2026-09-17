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
import * as yup from 'yup'

import { getAddressDisplayName } from './AddressDisplayCard'
import {
  accountActionButton,
  accountFormInput,
  accountTextButton,
  accountType,
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
    typography: 'caption',
    color: 'text.secondary',
    display: 'block',
    marginBottom: '0.25rem',
  },
  input: accountFormInput,
  cancelButton: accountTextButton,
}

const useAddressSchema = () => {
  const { t } = useTranslation('common')

  return yup.object().shape({
    firstName: yup.string().required(t('this-field-is-required')),
    lastNameOrSurname: yup.string().required(t('this-field-is-required')),
    email: yup
      .string()
      .email(t('please-enter-a-valid-email-address'))
      .required(t('this-field-is-required')),
    phoneNumber: yup
      .string()
      .required(t('this-field-is-required'))
      .matches(/^[0-9\s\-()+]{10,}$/, t('enter-valid-phone-number')),
    companyOrOrganization: yup.string().required(t('this-field-is-required')),
    address1: yup.string().required(t('this-field-is-required')),
    address2: yup.string().nullable(true).notRequired(),
    countryCode: yup.string().required(t('this-field-is-required')),
    stateOrProvince: yup.string().when('countryCode', {
      is: (value: string) => [CountryCode.US, CountryCode.CA].includes(value),
      then: yup.string().required(t('this-field-is-required')),
    }),
    cityOrTown: yup.string().required(t('this-field-is-required')),
    postalOrZipCode: yup
      .string()
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
    formState: { errors },
  } = useForm<AddressEditFormValues>({
    mode: 'onBlur',
    resolver: yupResolver(useAddressSchema()),
    defaultValues: {
      label: customerContact?.label ?? '',
      firstName: customerContact?.firstName ?? '',
      lastNameOrSurname: customerContact?.lastNameOrSurname ?? '',
      email: customerContact?.email ?? '',
      phoneNumber: customerContact?.phoneNumbers?.home ?? customerContact?.phoneNumbers?.work ?? '',
      companyOrOrganization: customerContact?.companyOrOrganization ?? '',
      address1: customerContact?.address?.address1 ?? '',
      address2: customerContact?.address?.address2 ?? '',
      countryCode: customerContact?.address?.countryCode ?? countries[0]?.code ?? '',
      stateOrProvince: customerContact?.address?.stateOrProvince ?? '',
      cityOrTown: customerContact?.address?.cityOrTown ?? '',
      postalOrZipCode: customerContact?.address?.postalOrZipCode ?? '',
    },
  })

  const renderField = (
    name: keyof AddressEditFormValues,
    label: string,
    options?: { select?: 'country' | 'province'; maxLength?: number; numeric?: boolean }
  ) => (
    <>
      <Typography component="label" htmlFor={name} sx={{ ...styles.fieldLabel }}>
        {label}
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
            error={Boolean(errors?.[name])}
            helperText={errors?.[name]?.message}
            sx={{ ...styles.input }}
            inputProps={{ maxLength: options?.maxLength, 'aria-label': label }}
            onChange={(event) =>
              field.onChange(
                options?.numeric ? event.target.value.replace(/[^0-9]/g, '') : event.target.value
              )
            }
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
              {renderField('firstName', String(t('first-name')))}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('lastNameOrSurname', String(t('last-name-or-sur-name')))}
            </Grid>
            <Grid item xs={12}>
              {renderField('email', String(t('invoice-email')))}
            </Grid>
            <Grid item xs={12}>
              {renderField('phoneNumber', String(t('phone-number')), {
                maxLength: 15,
                numeric: true,
              })}
            </Grid>
          </Grid>

          <Typography component="h3" sx={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>
            {t('shipping-information')}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              {renderField(
                'companyOrOrganization',
                String(t('company-institution-or-organization'))
              )}
            </Grid>
            <Grid item xs={12}>
              {renderField('address1', String(t('street-address-1')))}
            </Grid>
            <Grid item xs={12}>
              {renderField('address2', String(t('street-address-2')))}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('countryCode', String(t('country')), { select: 'country' })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('stateOrProvince', String(t('state')), { select: 'province' })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('cityOrTown', String(t('city')))}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('postalOrZipCode', String(t('zip-code')))}
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
              onClick={handleSubmit((values) => onSave(values, makeDefault))}
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
