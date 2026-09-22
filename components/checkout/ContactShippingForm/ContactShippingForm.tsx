/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import { LoadingButton } from '@mui/lab'
import { Box, Chip, Grid, Stack, Typography } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import uniqBy from 'lodash/uniqBy'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { isValidPhoneNumber } from 'react-phone-number-input'
import * as yup from 'yup'

import { ShippingMethod } from '@/components/checkout'
import { checkoutColors } from '@/components/checkout/checkoutStyles'
import { KiboPhoneInput, KiboSelect, KiboTextBox } from '@/components/common'
import { useUpdateOrderShippingInfo, useGetShippingMethods } from '@/hooks'
import { AddressType, CountryCode, DefaultId } from '@/lib/constants'
import { orderGetters, userGetters } from '@/lib/getters'

import type {
  CrContact,
  CrOrder,
  CustomerContact,
  CustomerContactCollection,
  Maybe,
} from '@/lib/gql/types'

interface ContactShippingFormData {
  firstName: string
  lastNameOrSurname: string
  workEmail: string
  companyOrOrganization: string
  phoneNumbers: { home: string }
  address: {
    address1: string
    address2?: string
    countryCode: string
    stateOrProvince: string
    cityOrTown: string
    postalOrZipCode: string
  }
}

interface Country {
  name: string
  code: string
}

interface Province {
  name: string
  code: string
}

const useContactShippingSchema = () => {
  const { t } = useTranslation('common')
  return yup.object().shape({
    firstName: yup.string().required(t('this-field-is-required')),
    lastNameOrSurname: yup.string().required(t('this-field-is-required')),
    workEmail: yup
      .string()
      .email(t('please-enter-a-valid-email-address'))
      .required(t('this-field-is-required')),
    companyOrOrganization: yup.string().required(t('this-field-is-required')),
    phoneNumbers: yup.object().shape({
      home: yup
        .string()
        .required(t('this-field-is-required'))
        .test('is-valid-phone-number', t('enter-valid-phone-number'), (value) =>
          value ? isValidPhoneNumber(value) : false
        ),
    }),
    address: yup.object().shape({
      address1: yup.string().required(t('this-field-is-required')),
      address2: yup.string().nullable(true).notRequired(),
      cityOrTown: yup.string().required(t('this-field-is-required')),
      stateOrProvince: yup.string().when('countryCode', {
        is: (value: string) => [CountryCode.US, CountryCode.CA].includes(value),
        then: yup.string().required(t('this-field-is-required')),
      }),
      postalOrZipCode: yup
        .string()
        .required(t('this-field-is-required'))
        .when('countryCode', {
          is: CountryCode.US,
          then: yup.string().matches(/^\d{5}(-\d{4})?$/, t('enter-valid-zip-code')),
        })
        .when('countryCode', {
          is: CountryCode.CA,
          then: yup
            .string()
            .matches(/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, t('enter-valid-zip-code')),
        }),
      countryCode: yup.string().required(t('this-field-is-required')),
    }),
  })
}

interface DefaultContact {
  firstName?: string | null
  lastNameOrSurname?: string | null
  email?: string | null
  companyOrOrganization?: string | null
  phoneNumbers?: { home?: string | null } | null
  address?: {
    address1?: string | null
    address2?: string | null
    cityOrTown?: string | null
    stateOrProvince?: string | null
    postalOrZipCode?: string | null
    countryCode?: string | null
  } | null
}

export interface ContactShippingFormProps {
  checkout: CrOrder
  updateCheckoutPersonalInfo: (params: { email: Maybe<string> | undefined }) => Promise<void>
  onContinue: () => void
  continueLabel?: string
  // A logged-in shopper's saved contact/address (e.g. their default shipping address) -
  // when present, the form hydrates from it instead of starting blank.
  defaultContact?: DefaultContact
  // The account's saved shipping addresses - lets a logged-in shopper pick one instead of
  // typing an address from scratch. Omitted (or empty) for guest checkout, which has none.
  addressCollection?: CustomerContactCollection
}

const NEW_ADDRESS_OPTION = 'new'

const isPrimaryShippingAddress = (contact: CustomerContact) =>
  contact?.types?.some(
    (type) => type?.name?.toLowerCase() === AddressType.SHIPPING.toLowerCase() && type?.isPrimary
  )

// The account API can return the same address under more than one contact id - dedupe by
// address content rather than id.
const getAddressDedupeKey = (contact: CustomerContact) =>
  [
    contact?.companyOrOrganization,
    contact?.address?.address1,
    contact?.address?.address2,
    contact?.address?.cityOrTown,
    contact?.address?.stateOrProvince,
    contact?.address?.postalOrZipCode,
    contact?.address?.countryCode,
  ]
    .filter(Boolean)
    .join('|')
    .toLowerCase()

// A full-width saved-address row, or the trailing "Add New" row.
const AddressChoiceCard = ({
  selected,
  onClick,
  primary,
  addNew,
  title,
  subtitle,
}: {
  selected: boolean
  onClick: () => void
  primary?: boolean
  addNew?: boolean
  title?: string
  subtitle?: string
}) => {
  const { t } = useTranslation('common')
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        padding: '14px 20px',
        borderRadius: '12px',
        border: `1px solid ${selected ? checkoutColors.selectedBorder : checkoutColors.border}`,
        backgroundColor: selected ? checkoutColors.selectedBg : '#fff',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          flexShrink: 0,
          backgroundColor: selected ? checkoutColors.selectedBorder : '#F0F0F0',
          color: selected ? '#fff' : checkoutColors.placeholder,
        }}
      >
        {addNew ? <AddIcon /> : <LocationOnOutlinedIcon />}
      </Box>
      <Stack gap={0.25} flex={1} sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '15px',
              color: addNew ? checkoutColors.selectedBorder : checkoutColors.subtitle,
            }}
          >
            {addNew ? t('add-new') : title}
          </Typography>
          {primary && (
            <Chip
              label={t('primary')}
              size="small"
              sx={{
                backgroundColor: checkoutColors.selectedBg,
                color: checkoutColors.selectedBorder,
                fontWeight: 600,
                fontSize: '12px',
              }}
            />
          )}
        </Stack>
        {subtitle && (
          <Typography sx={{ fontSize: '13px', color: checkoutColors.placeholder }}>
            {subtitle}
          </Typography>
        )}
      </Stack>
      {selected && <CheckCircleIcon sx={{ color: '#22C55E', flexShrink: 0 }} />}
    </Box>
  )
}

// Contact & shipping collection form shared by guest checkout and the logged-in PO
// checkout - identical fields/validation/mutations, only what happens on a valid
// "Continue" differs per caller.
const ContactShippingForm = (props: ContactShippingFormProps) => {
  const {
    checkout,
    updateCheckoutPersonalInfo,
    onContinue,
    continueLabel,
    defaultContact,
    addressCollection,
  } = props
  const { t } = useTranslation('common')
  const { publicRuntimeConfig } = getConfig()
  const countries = publicRuntimeConfig.countries
  const provinces = publicRuntimeConfig.provinces

  const [isNewAddressAdded, setIsNewAddressAdded] = useState(false)
  const [shippingMethodError, setShippingMethodError] = useState('')
  const [contactSaveError, setContactSaveError] = useState('')
  const [isValidatingShipping, setIsValidatingShipping] = useState(false)
  // Signature of the contact fields last successfully saved - lets a re-selected saved address
  // (valid before and after, so `isValid` never flips) still trigger a fresh save.
  const lastSavedContactSignatureRef = useRef<string | null>(null)

  // Primary sorted first, deduped by address content.
  const savedShippingAddresses = uniqBy(
    userGetters.getUserShippingAddress(
      (addressCollection?.items as CustomerContact[]) || []
    ) as CustomerContact[],
    getAddressDedupeKey
  )
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedShippingAddresses?.length ? String(savedShippingAddresses[0].id) : NEW_ADDRESS_OPTION
  )

  const shipItems = orderGetters.getShipItems(checkout)
  const pickupItems = orderGetters.getPickupItems(checkout)
  const checkoutShippingMethodCode = orderGetters.getShippingMethodCode(checkout)

  // A destination address may already be on the checkout from an earlier visit or an
  // auto-applied saved address - don't wait on `isNewAddressAdded`, a purely local flag.
  const hasDestinationAddress =
    isNewAddressAdded || Boolean(checkout?.fulfillmentInfo?.fulfillmentContact?.address?.address1)

  const { updateOrderShippingInfo } = useUpdateOrderShippingInfo()
  const { data: shippingMethods, isLoading: isLoadingShippingMethods } = useGetShippingMethods(
    checkout?.id,
    hasDestinationAddress,
    hasDestinationAddress ? DefaultId.ADDRESSID : undefined
  )

  const {
    control,
    handleSubmit,
    trigger,
    reset,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<ContactShippingFormData>({
    mode: 'onChange',
    reValidateMode: 'onBlur',
    defaultValues: {
      workEmail: checkout?.email ?? '',
      address: { countryCode: countries?.[0]?.code },
    },
    resolver: yupResolver(useContactShippingSchema()),
    shouldFocusError: true,
  })

  const watchedContactFields = useWatch({ control })
  const contactSignature = JSON.stringify(watchedContactFields)

  useEffect(() => {
    // `defaultContact` (a logged-in shopper's saved address) can arrive after this form has
    // already mounted and rendered with blank defaults - hydrate it in once it shows up.
    // Skip once the shopper has actually started editing, so this can't clobber their input.
    if (!defaultContact || isDirty) return
    reset({
      firstName: defaultContact.firstName || '',
      lastNameOrSurname: defaultContact.lastNameOrSurname || '',
      workEmail: defaultContact.email || checkout?.email || '',
      companyOrOrganization: defaultContact.companyOrOrganization || '',
      phoneNumbers: { home: defaultContact.phoneNumbers?.home || '' },
      address: {
        address1: defaultContact.address?.address1 || '',
        address2: defaultContact.address?.address2 || '',
        countryCode: defaultContact.address?.countryCode || countries?.[0]?.code,
        stateOrProvince: defaultContact.address?.stateOrProvince || '',
        cityOrTown: defaultContact.address?.cityOrTown || '',
        postalOrZipCode: defaultContact.address?.postalOrZipCode || '',
      },
    })
  }, [defaultContact])

  const applySavedAddress = (address: CustomerContact) => {
    setValue('companyOrOrganization', address.companyOrOrganization || '', {
      shouldValidate: true,
    })
    setValue('address.address1', address.address?.address1 || '', { shouldValidate: true })
    setValue('address.address2', address.address?.address2 || '', { shouldValidate: true })
    setValue('address.countryCode', address.address?.countryCode || countries?.[0]?.code, {
      shouldValidate: true,
    })
    setValue('address.stateOrProvince', address.address?.stateOrProvince || '', {
      shouldValidate: true,
    })
    setValue('address.cityOrTown', address.address?.cityOrTown || '', { shouldValidate: true })
    setValue('address.postalOrZipCode', address.address?.postalOrZipCode || '', {
      shouldValidate: true,
    })
  }

  useEffect(() => {
    // Saved addresses load asynchronously - once the primary one shows up, select and apply
    // it automatically (the shopper can still pick a different saved address, or "Add New").
    if (!savedShippingAddresses?.length) return
    setSelectedAddressId(String(savedShippingAddresses[0].id))
    applySavedAddress(savedShippingAddresses[0])
  }, [savedShippingAddresses?.length])

  const handleSelectSavedAddress = (address: CustomerContact) => {
    setSelectedAddressId(String(address.id))
    applySavedAddress(address)
  }

  const handleSelectNewAddress = () => {
    setSelectedAddressId(NEW_ADDRESS_OPTION)
    setValue('companyOrOrganization', '')
    setValue('address.address1', '')
    setValue('address.address2', '')
    setValue('address.countryCode', countries?.[0]?.code)
    setValue('address.stateOrProvince', '')
    setValue('address.cityOrTown', '')
    setValue('address.postalOrZipCode', '')
  }

  const buildContact = (formData: ContactShippingFormData): CrContact => ({
    firstName: formData.firstName,
    lastNameOrSurname: formData.lastNameOrSurname,
    email: formData.workEmail,
    companyOrOrganization: formData.companyOrOrganization,
    address: { ...formData.address, addressType: 'Commercial' },
    phoneNumbers: { home: formData.phoneNumbers.home, work: formData.phoneNumbers.home },
  })

  const onValidContact = async (formData: ContactShippingFormData, signature: string) => {
    try {
      setContactSaveError('')
      await updateCheckoutPersonalInfo({ email: formData.workEmail })
      await updateOrderShippingInfo.mutateAsync({
        checkout,
        contact: buildContact(formData),
        email: formData.workEmail,
      })
      lastSavedContactSignatureRef.current = signature
      setIsNewAddressAdded(true)
    } catch (error) {
      console.error(error)
      // /api/graphql proxies the backend error as either `{ errors: [...] }` or `{ message }`.
      const backendMessage =
        (error as any)?.response?.errors?.[0]?.message ||
        (error as any)?.response?.message ||
        (error as any)?.message
      setContactSaveError(
        backendMessage
          ? `${t('unable-to-save-shipping-address')} (${backendMessage})`
          : t('unable-to-save-shipping-address')
      )
    }
  }

  useEffect(() => {
    if (!isValid || contactSignature === lastSavedContactSignatureRef.current) return
    handleSubmit((formData) => onValidContact(formData, contactSignature))()
  }, [isValid, contactSignature])

  const handleSaveShippingMethod = async (shippingMethodCode: string) => {
    const shippingMethodName =
      shippingMethods.find((method) => method.shippingMethodCode === shippingMethodCode)
        ?.shippingMethodName ?? ''

    try {
      await updateOrderShippingInfo.mutateAsync({
        checkout,
        contact: undefined,
        email: checkout?.email as string,
        shippingMethodCode,
        shippingMethodName,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleContinue = async () => {
    if (isValidatingShipping) return
    setIsValidatingShipping(true)
    try {
      // Force-validate on submit (mode: 'onChange' skips untouched fields otherwise). Only
      // validate the "Add New Address" fields when that's the active mode - they stay mounted
      // but hidden when a saved address is selected instead.
      const isFormValid =
        selectedAddressId === NEW_ADDRESS_OPTION
          ? await trigger()
          : await trigger(['firstName', 'lastNameOrSurname', 'workEmail', 'phoneNumbers.home'])

      // A shipping method is only choosable (and thus only required) when the order actually
      // has ship items - a pickup-only order has nothing to select and shouldn't be blocked on it.
      const needsShippingMethod = shipItems.length > 0
      const hasShippingMethod = !needsShippingMethod || !!checkoutShippingMethodCode
      setShippingMethodError(hasShippingMethod ? '' : t('please-select-shipping-method'))

      if (isFormValid && hasShippingMethod) onContinue()
    } finally {
      setIsValidatingShipping(false)
    }
  }

  return (
    <Stack gap={4}>
      <Stack gap={0.5}>
        <Typography sx={{ fontWeight: 700, fontSize: '28px', color: checkoutColors.heading }}>
          {t('contact-and-shipping')}
        </Typography>
        <Typography sx={{ fontSize: '15px', color: checkoutColors.body }}>
          {t('contact-and-shipping-description')}
        </Typography>
      </Stack>

      <Stack gap={2}>
        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: checkoutColors.subtitle }}>
          {t('contact-information')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <KiboTextBox
                  {...field}
                  value={field.value || ''}
                  label={t('first-name')}
                  error={!!errors?.firstName}
                  helperText={errors?.firstName?.message}
                  onChange={(_name: string, value: string) => field.onChange(value)}
                  onBlur={field.onBlur}
                  required
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="lastNameOrSurname"
              control={control}
              render={({ field }) => (
                <KiboTextBox
                  {...field}
                  value={field.value || ''}
                  label={t('last-name-or-sur-name')}
                  error={!!errors?.lastNameOrSurname}
                  helperText={errors?.lastNameOrSurname?.message}
                  onChange={(_name: string, value: string) => field.onChange(value)}
                  onBlur={field.onBlur}
                  required
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="workEmail"
              control={control}
              render={({ field }) => (
                <KiboTextBox
                  {...field}
                  value={field.value || ''}
                  label={t('work-email')}
                  error={!!errors?.workEmail}
                  helperText={errors?.workEmail?.message}
                  onChange={(_name: string, value: string) => field.onChange(value)}
                  onBlur={field.onBlur}
                  required
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="phoneNumbers.home"
              control={control}
              render={({ field }) => (
                <KiboPhoneInput
                  {...field}
                  value={field.value || ''}
                  label={t('phone-number-home')}
                  error={!!errors?.phoneNumbers?.home}
                  helperText={errors?.phoneNumbers?.home?.message}
                  onChange={(_name: string, value: string) => field.onChange(value)}
                  onBlur={field.onBlur}
                  required
                />
              )}
            />
          </Grid>
        </Grid>
      </Stack>

      <Stack gap={2}>
        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: checkoutColors.subtitle }}>
          {savedShippingAddresses?.length ? t('shipping-address') : t('shipping-information')}
        </Typography>

        {savedShippingAddresses?.length > 0 && (
          <Stack gap={1.5}>
            {savedShippingAddresses.map((address) => (
              <AddressChoiceCard
                key={address.id}
                selected={selectedAddressId === String(address.id)}
                onClick={() => handleSelectSavedAddress(address)}
                primary={isPrimaryShippingAddress(address)}
                title={[address.companyOrOrganization, address.address?.address1]
                  .filter(Boolean)
                  .join(' - ')}
                subtitle={[
                  [
                    address.address?.cityOrTown,
                    address.address?.stateOrProvince,
                    address.address?.countryCode,
                  ]
                    .filter(Boolean)
                    .join(', '),
                  address.address?.postalOrZipCode,
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
            <AddressChoiceCard
              selected={selectedAddressId === NEW_ADDRESS_OPTION}
              onClick={handleSelectNewAddress}
              addNew
            />
          </Stack>
        )}

        {contactSaveError && (
          <Typography sx={{ fontSize: '13px', color: 'error.main' }}>{contactSaveError}</Typography>
        )}

        {selectedAddressId === NEW_ADDRESS_OPTION && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="companyOrOrganization"
                control={control}
                render={({ field }) => (
                  <KiboTextBox
                    {...field}
                    value={field.value || ''}
                    label={t('company-or-organization')}
                    error={!!errors?.companyOrOrganization}
                    helperText={errors?.companyOrOrganization?.message}
                    onChange={(_name: string, value: string) => field.onChange(value)}
                    onBlur={field.onBlur}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address.address1"
                control={control}
                render={({ field }) => (
                  <KiboTextBox
                    {...field}
                    value={field.value || ''}
                    label={t('street-address-1')}
                    error={!!errors?.address?.address1}
                    helperText={errors?.address?.address1?.message}
                    onChange={(_name: string, value: string) => field.onChange(value)}
                    onBlur={field.onBlur}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address.address2"
                control={control}
                render={({ field }) => (
                  <KiboTextBox
                    {...field}
                    value={field.value || ''}
                    label={t('street-address-2')}
                    error={!!errors?.address?.address2}
                    helperText={errors?.address?.address2?.message}
                    onChange={(_name: string, value: string) => field.onChange(value)}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="address.countryCode"
                control={control}
                render={({ field }) => (
                  <KiboSelect
                    name="country-code"
                    label={t('country-code')}
                    value={field.value}
                    error={!!errors?.address?.countryCode}
                    helperText={errors?.address?.countryCode?.message}
                    onChange={(_name: string, value: string) => field.onChange(value)}
                    onBlur={field.onBlur}
                    required
                  >
                    {countries?.map((country: Country) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </KiboSelect>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="address.stateOrProvince"
                control={control}
                render={({ field }) => (
                  <KiboSelect
                    name="state-or-province"
                    label={t('state-or-province')}
                    value={field.value}
                    error={!!errors?.address?.stateOrProvince}
                    helperText={errors?.address?.stateOrProvince?.message}
                    onChange={(_name: string, value: string) => field.onChange(value)}
                    onBlur={field.onBlur}
                    required
                  >
                    {provinces?.map((province: Province) => (
                      <MenuItem key={province.code} value={province.code}>
                        {province.name}
                      </MenuItem>
                    ))}
                  </KiboSelect>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="address.cityOrTown"
                control={control}
                render={({ field }) => (
                  <KiboTextBox
                    {...field}
                    value={field.value || ''}
                    label={t('city-or-town')}
                    error={!!errors?.address?.cityOrTown}
                    helperText={errors?.address?.cityOrTown?.message}
                    onChange={(_name: string, value: string) => field.onChange(value)}
                    onBlur={field.onBlur}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="address.postalOrZipCode"
                control={control}
                render={({ field }) => (
                  <KiboTextBox
                    {...field}
                    value={field.value || ''}
                    label={t('postal-or-zip-code')}
                    error={!!errors?.address?.postalOrZipCode}
                    helperText={errors?.address?.postalOrZipCode?.message}
                    onChange={(_name: string, value: string) => {
                      field.onChange(value.replace(/[^A-Za-z0-9-]/g, ''))
                    }}
                    onBlur={field.onBlur}
                    required
                    inputProps={{ minLength: 5, maxLength: 10 }}
                  />
                )}
              />
            </Grid>
          </Grid>
        )}
      </Stack>

      {shipItems.length > 0 && hasDestinationAddress && (
        <Stack gap={1.5}>
          <Typography sx={{ fontWeight: 600, fontSize: '18px', color: checkoutColors.subtitle }}>
            {t('shipping-method')}
          </Typography>
          {isLoadingShippingMethods ? (
            <Typography sx={{ fontSize: '14px', color: checkoutColors.placeholder }}>
              {t('loading-shipping-methods')}
            </Typography>
          ) : shippingMethods?.length > 0 ? (
            <ShippingMethod
              checkout={checkout}
              shipItems={shipItems}
              pickupItems={pickupItems}
              orderShipmentMethods={[...shippingMethods]}
              selectedShippingMethodCode={checkoutShippingMethodCode}
              onShippingMethodChange={handleSaveShippingMethod}
              showTitle={false}
            />
          ) : (
            <Typography sx={{ fontSize: '14px', color: 'error.main' }}>
              {t('no-shipping-methods-available')}
            </Typography>
          )}
          {shippingMethodError && (
            <Typography sx={{ fontSize: '13px', color: 'error.main' }}>
              {shippingMethodError}
            </Typography>
          )}
        </Stack>
      )}

      <Box>
        <LoadingButton
          variant="contained"
          color="primary"
          loading={isValidatingShipping}
          onClick={handleContinue}
          sx={{
            borderRadius: '0px 26px',
            padding: '12px 30px',
            boxShadow: 'none',
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '100%',
            letterSpacing: 'normal',
            textTransform: 'capitalize',
            cursor: 'pointer',
            '&.Mui-disabled': { cursor: 'not-allowed' },
          }}
        >
          {continueLabel ?? t('continue-to-payment')}
        </LoadingButton>
      </Box>
    </Stack>
  )
}

export default ContactShippingForm
