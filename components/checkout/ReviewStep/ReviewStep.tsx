import React, { MouseEvent, useState } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import { LoadingButton } from '@mui/lab'
import {
  Typography,
  Box,
  Divider,
  Button,
  Stack,
  Theme,
  useTheme,
  Checkbox,
  FormControlLabel,
  FormControl,
  SxProps,
  Grid,
  TextField,
  Link,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

import {
  OrderPrice,
  ProductItem,
  ProductItemList,
  PasswordValidation,
  KiboTextBox,
  CheckoutProductItem,
  KiboImage,
} from '@/components/common'
import type { OrderPriceProps } from '@/components/common/OrderPrice/OrderPrice'
import { useCheckoutStepContext, useAuthContext } from '@/context'
import { useUpdateOrder, useUpdateUserOrder } from '@/hooks'
import { addressGetters, checkoutGetters, orderGetters, productGetters } from '@/lib/getters'
import { isPasswordValid } from '@/lib/helpers/validations/validations'

import type {
  CrOrder,
  Maybe,
  Checkout,
  CrOrderItem,
  CrProduct,
  CrContact,
  CrPurchaseOrderCustomField,
} from '@/lib/gql/types'

export interface PersonalDetails {
  email: Maybe<string> | undefined
  showAccountFields: boolean
  firstName: string
  lastNameOrSurname: string
  password: string
}

interface ReviewStepProps {
  checkout: CrOrder | Checkout
  shipItems?: Maybe<CrOrderItem>[]
  pickupItems?: Maybe<CrOrderItem>[]
  digitalItems?: Maybe<CrOrderItem>[]
  personalDetails?: any
  orderSummaryProps: any
  isMultiShipEnabled: boolean
  onCreateOrder: (params: any) => Promise<void>
}

const buttonStyle = {
  height: '2.625rem',
  maxWidth: '23.5rem',
  fontSize: (theme: Theme) => theme.typography.subtitle1,
} as SxProps<Theme> | undefined

const commonStyle = {
  width: '100%',
  maxWidth: '421px',
}

const styles = {
  confirmAndPayButtonStyle: {
    ...buttonStyle,
    marginBottom: '0.75rem',
    borderRadius: '0px 26px',
    padding: '24px 44px',
    fontSize: '16px',
    fontWeight: 500,
    '&:disabled': {
      color: '#FFFFFF !important',
      backgroundColor: '#8D8D8D !important',
    },
  },
  goBackButtonStyle: {
    ...buttonStyle,
  },
  shippingInfoContainerStyle: {
    maxWidth: '100%',
    padding: '1.25rem 1.25rem',
    marginBottom: {
      xs: 0,
      sm: 0,
      md: 0,
    },
    border: {
      xs: `2px solid ${grey[300]}`,
      md: `2px solid ${grey[300]}`,
    },
    boxShadow: 'none',
  },
  billingInfoContainerStyle: {
    maxWidth: '100%',
    padding: '1.25rem 1.25rem',
    marginBottom: {
      xs: 0,
      sm: 0,
      md: 0,
    },
    border: {
      xs: `2px solid ${grey[300]}`,
      md: `2px solid ${grey[300]}`,
    },
    boxShadow: 'none',
  },
}

const StyledActions = styled(Link)(({ theme }: { theme: Theme }) => ({
  textAlign: 'right',
  flex: '25%',
  textDecoration: 'underline',
  '&:hover': {
    textDecoration: 'none',
  },
}))

const useDetailsSchema = () => {
  const { t } = useTranslation('common')

  return yup.object().shape({
    email: yup.string().email().required(t('this-field-is-required')),
    showAccountFields: yup.boolean(),
    firstName: yup.string().when('showAccountFields', {
      is: true,
      then: yup.string().required(t('this-field-is-required')),
    }),
    lastNameOrSurname: yup.string().when('showAccountFields', {
      is: true,
      then: yup.string().required(t('this-field-is-required')),
    }),
    password: yup.string().when('showAccountFields', {
      is: true,
      then: yup.string().required(t('this-field-is-required')),
    }),
  })
}

const ReviewStep = (props: ReviewStepProps) => {
  const {
    checkout,
    personalDetails,
    orderSummaryProps,
    shipItems,
    pickupItems,
    digitalItems,
    onCreateOrder,
    isMultiShipEnabled,
  } = props

  const { t } = useTranslation('common')
  const theme = useTheme()
  const { isAuthenticated, createAccount } = useAuthContext()
  const { updateUserOrder } = useUpdateUserOrder()
  const { updateOrder } = useUpdateOrder()
  const [isAgreeWithTermsAndConditions, setAgreeWithTermsAndConditions] = useState<boolean>(false)
  const { publicRuntimeConfig } = getConfig()

  const { setStepNext, setStepBack, setStepStatusComplete, steps, setActiveStep } =
    useCheckoutStepContext()
  const {
    shippingDetails,
    billingDetails,
    paymentMethods,
    shippingMethod,
    purchaseOrderPaymentMethods,
  } = orderSummaryProps

  const { shippingPhoneHome, shippingAddress, companyOrOrganization } = shippingDetails
  const { billingAddress, billingCompanyOrOrganization } = billingDetails

  const countries = publicRuntimeConfig.countries
  const shippingCountryName =
    countries.find(
      (country: { code: Maybe<string> }) => country.code === shippingAddress?.countryCode
    )?.name || 'Not found'

  const billingCountryName =
    countries.find(
      (country: { code: Maybe<string> }) => country.code === billingAddress?.countryCode
    )?.name || 'Not found'
  const shippingPersonalDetails = {
    firstName: shippingDetails?.firstName,
    lastNameOrSurname: shippingDetails?.lastNameOrSurname,
  }

  const billingPersonalDetails = {
    firstName: billingDetails?.firstName,
    lastNameOrSurname: billingDetails?.lastNameOrSurname,
  }

  const {
    formState: { errors, isValid },
    handleSubmit,
    control,
    watch,
    getValues,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: personalDetails
      ? { ...personalDetails, email: checkout?.email }
      : { email: checkout?.email },
    resolver: yupResolver(useDetailsSchema()),
    shouldFocusError: true,
  })

  const showAccountFields: boolean = watch(['showAccountFields']).join('') === 'true'
  const userEnteredPassword: string = watch(['password']).join('')

  const [instructionsValue, setInstructionsValue] = useState<string>('')

  const handleInstChange = (event: any) => {
    setInstructionsValue(event.target.value)
  }

  const isEnabled = () => {
    if (showAccountFields && !isAuthenticated) {
      const isUserEnteredPasswordValid = showAccountFields
        ? isPasswordValid(userEnteredPassword)
        : true

      const isFormValid = showAccountFields ? isValid && isUserEnteredPasswordValid : true

      return isAgreeWithTermsAndConditions && isFormValid
    }
    return isAgreeWithTermsAndConditions
  }

  const handleAgreeTermsConditions = (event: React.ChangeEvent<HTMLInputElement>) =>
    setAgreeWithTermsAndConditions(event.target.checked)

  const onValid = async (formData: PersonalDetails) => {
    try {
      if (formData?.showAccountFields) {
        const account = await createAccount({
          email: checkout.email as string,
          firstName: formData.firstName,
          lastNameOrSurname: formData.lastNameOrSurname,
          password: formData.password,
        })

        if (account?.customerAccount.userId) {
          updateUserOrder.mutateAsync(checkout.id as string)
        }
      }

      if (instructionsValue) {
        checkout.shopperNotes = checkout.shopperNotes || {}
        checkout.shopperNotes.comments = instructionsValue
        await updateOrder.mutateAsync(checkout as CrOrder)
      }
      await onCreateOrder(checkout)

      setStepStatusComplete()
      setStepNext()
    } catch (e) {
      console.log('error', e)
    }
  }

  const onInvalidForm = (error: any) => {
    console.log('Invalid Form', error)
  }
  const handleComplete = () => handleSubmit(onValid, onInvalidForm)()

  const handleEditAction = (event: MouseEvent<HTMLElement>) => {
    const redirectStepIndex = steps.findIndex(
      (step: string) => step === event.currentTarget.getAttribute('data-step')
    )
    setActiveStep(redirectStepIndex)
  }

  const orderPriceProps = {
    subTotalLabel: t('subtotal'),
    shippingTotalLabel: t('shipping'),
    handlingLabel: t('handling'),
    totalLabel: t('total'),
    orderDetails: checkout,
  }

  return (
    <Box data-testid={'review-step-component'}>
      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        sx={{ color: 'primary.main', marginBottom: '20px' }}
      >
        {t('Review Order')}
      </Typography>

      {/*<Divider color={theme.palette.primary.main} sx={{ mt: '1.688rem', mb: '1.438rem' }} />*/}

      {/* MultiShip Checkout */}
      {isMultiShipEnabled && shipItems && shipItems.length > 0 && (
        <Stack gap={4}>
          <Typography variant="h3" component="h3" fontWeight={600} color="text.primary">
            {t('shipping-to-address')}
          </Typography>

          <Stack
            direction="column"
            divider={<Divider orientation="horizontal" flexItem />}
            spacing={2}
            data-testid="product-item-stack-multi-ship"
          >
            {shipItems?.map((item: Maybe<CrOrderItem>) => {
              const product = item?.product as CrProduct
              const destination = (checkout as unknown as Checkout).destinations?.find(
                (destination) => destination?.id === item?.destinationId
              )
              const formattedAddress = destination
                ? addressGetters.getFormattedAddress(destination?.destinationContact as CrContact)
                : ''
              return (
                <>
                  <Typography
                    variant="subtitle2"
                    component="h4"
                    fontWeight={'bold'}
                    color="text.primary"
                  >
                    {t('ship-to')}
                    <Typography
                      variant="subtitle2"
                      component="span"
                      color="text.primary"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {`${formattedAddress}`}
                    </Typography>
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    component="h4"
                    marginTop="0"
                    fontWeight="bold"
                    color="primary"
                  >
                    {t('est-arrival')}{' '}
                    {checkoutGetters.getFormattedDate(item?.expectedDeliveryDate)}
                  </Typography>

                  <Stack key={item?.id}>
                    <ProductItem
                      id={orderGetters.getCartItemId(item as CrOrderItem)}
                      qty={orderGetters.getProductQuantity(item as CrOrderItem)}
                      purchaseLocation={orderGetters.getPurchaseLocation(item as CrOrderItem)}
                      productCode={productGetters.getProductId(product)}
                      image={productGetters.getProductImage(product)}
                      name={productGetters.getName(product)}
                      options={productGetters.getOptions(product)}
                      price={productGetters.getPrice(product).regular?.toString()}
                      salePrice={productGetters.getPrice(product).special?.toString()}
                      expectedDeliveryDate={item?.expectedDeliveryDate}
                      discounts={item?.productDiscounts}
                    />
                  </Stack>
                </>
              )
            })}
          </Stack>

          <Divider sx={{ mb: '1.438rem' }} />
        </Stack>
      )}

      {/* Standard Checkout */}
      {!isMultiShipEnabled && shipItems && shipItems.length > 0 && (
        <Box sx={{ mb: '30px' }}>
          {shipItems.map((item: Maybe<CrOrderItem>) => {
            const product = item?.product as CrProduct
            return (
              <Box key={item?.id}>
                <CheckoutProductItem
                  id={'1'}
                  productCode={productGetters.getProductId(product)}
                  name={productGetters.getName(product)}
                  options={productGetters.getOptions(product)}
                  price={productGetters.getPrice(product).regular?.toString()}
                  salePrice={productGetters.getPrice(product).special?.toString()}
                  qty={orderGetters.getProductQuantity(item as CrOrderItem)}
                />
              </Box>
            )
          })}
        </Box>
      )}

      {/* Standard and MultiShip Checkout */}
      {pickupItems && pickupItems.length > 0 && (
        <Stack gap={4}>
          <Typography variant="h3" component="h3" sx={{ fontWeight: 'bold' }} color="text.primary">
            {t('pickup-in-store')}
          </Typography>
          <ProductItemList items={pickupItems} testId={'review-pickup-items'} />
          <Divider sx={{ mt: '1.ZZ438rem', mb: '1.188rem' }} />
        </Stack>
      )}

      {digitalItems && digitalItems.length > 0 && (
        <Stack gap={4}>
          <Typography variant="h3" component="h3" sx={{ fontWeight: 'bold' }} color="text.primary">
            {t('digital-products')}
          </Typography>
          <ProductItemList items={digitalItems} testId={'review-digital-items'} />
          <Divider sx={{ mb: '1.438rem' }} />
        </Stack>
      )}

      {/*<OrderPrice {...orderPriceProps} />*/}

      {/* Shipping Information */}
      <Box sx={{ marginBottom: '30px' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: {
              xs: 'start',
              sm: 'center',
              md: 'center',
            },
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="h3"
            component="h3"
            sx={{ color: 'primary.main', marginBottom: '10px' }}
          >
            {t('Shipping Information')}
          </Typography>
          <StyledActions data-step={'Shipping'} onClick={handleEditAction}>
            <Typography
              sx={{ cursor: 'pointer', fontSize: '16px', color: '#30299A', fontWeight: '500' }}
              component="span"
              variant="caption"
            >
              {t('Change')}
            </Typography>
          </StyledActions>
        </Box>
        <Box sx={{ ...styles.shippingInfoContainerStyle }}>
          <Grid container>
            <Grid
              item
              sm={6}
              sx={{
                marginBottom: {
                  xs: '16px',
                },
              }}
            >
              <Typography variant="body2" data-testid="shippingMethod" sx={{ fontWeight: 500 }}>
                {t('Shipping Method')}
              </Typography>
              <Typography variant="body2">{t(shippingMethod)}</Typography>
            </Grid>
            <Grid item sm={6}>
              <Typography variant="body2" data-testid="shippingAddress" sx={{ fontWeight: 500 }}>
                {t('Shipping Address')}
              </Typography>
              <Typography variant="body2">
                {t(
                  `${shippingPersonalDetails.firstName} ${shippingPersonalDetails.lastNameOrSurname}`
                )}
              </Typography>
              {companyOrOrganization && (
                <Typography variant="body2">{t(companyOrOrganization)}</Typography>
              )}
              {shippingAddress.address1 && (
                <Typography variant="body2">{t(shippingAddress.address1)}</Typography>
              )}
              {shippingAddress.address2 && (
                <Typography variant="body2">{t(shippingAddress.address2)}</Typography>
              )}
              {shippingAddress.cityOrTown &&
                shippingAddress.stateOrProvince &&
                shippingAddress.postalOrZipCode && (
                  <Typography variant="body2">
                    {t(shippingAddress.cityOrTown)}, {t(shippingAddress.stateOrProvince)}{' '}
                    {t(shippingAddress.postalOrZipCode)}
                  </Typography>
                )}
              {shippingAddress.countryCode && (
                <Typography variant="body2">{t(shippingCountryName)}</Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Billing Information */}
      <Box sx={{ marginBottom: '30px' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: {
              xs: 'start',
              sm: 'center',
              md: 'center',
            },
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="h3"
            component="h3"
            sx={{ color: 'primary.main', marginBottom: '10px' }}
          >
            {t('Billing Information')}
          </Typography>
          <StyledActions data-step={'Payment'} onClick={handleEditAction}>
            <Typography
              sx={{ cursor: 'pointer', fontSize: '16px', color: '#30299A', fontWeight: '500' }}
              component="span"
              variant="caption"
            >
              {t('Change')}
            </Typography>
          </StyledActions>
        </Box>
        <Box sx={{ ...styles.billingInfoContainerStyle }}>
          <Grid container>
            <Grid
              item
              sm={6}
              sx={{
                marginBottom: {
                  xs: '16px',
                },
              }}
            >
              <Typography variant="body2" data-testid="shippingMethod" sx={{ fontWeight: 500 }}>
                {t('Payment Method')}
              </Typography>
              {paymentMethods?.map((method: any, index: number) => (
                <Box display={'flex'} key={index}>
                  <Typography variant="body2">
                    {method?.cardType} ending {method?.cardNumberPartOrMask.slice(-4)} ({'expires'}{' '}
                    {method?.expiry})
                  </Typography>
                </Box>
              ))}
              {purchaseOrderPaymentMethods?.map((method: any, index: number) => (
                <Box display={'flex'} flexDirection={'column'} key={'po_payment_summary_' + index}>
                  <Typography variant="body2">{`${t('po-number')} : ${
                    method.purchaseOrderNumber
                  }`}</Typography>
                  {method?.customFields?.map((customField: CrPurchaseOrderCustomField) => {
                    return (
                      <Typography
                        variant="body2"
                        key={'po_payment_summ_ custom_field_' + customField?.code}
                      >{`${customField?.label} : ${customField?.value}`}</Typography>
                    )
                  })}
                </Box>
              ))}
            </Grid>
            <Grid item sm={6}>
              <Typography variant="body2" data-testid="shippingAddress" sx={{ fontWeight: 500 }}>
                {t('Billing Address')}
              </Typography>
              <Typography variant="body2">
                {t(
                  `${billingPersonalDetails.firstName} ${billingPersonalDetails.lastNameOrSurname}`
                )}
              </Typography>
              {billingCompanyOrOrganization && (
                <Typography variant="body2">{t(billingCompanyOrOrganization)}</Typography>
              )}
              {billingAddress.address1 && (
                <Typography variant="body2">{t(billingAddress.address1)}</Typography>
              )}
              {billingAddress.address2 && (
                <Typography variant="body2">{t(billingAddress.address2)}</Typography>
              )}
              {billingAddress.cityOrTown &&
                billingAddress.stateOrProvince &&
                billingAddress.postalOrZipCode && (
                  <Typography variant="body2">
                    {t(billingAddress.cityOrTown)}, {t(billingAddress.stateOrProvince)}{' '}
                    {t(billingAddress.postalOrZipCode)}
                  </Typography>
                )}
              {billingAddress.countryCode && (
                <Typography variant="body2">{t(billingCountryName)}</Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box sx={{ marginBottom: '10px' }}>
        <Typography variant="body2" sx={{ marginBottom: '10px' }}>
          {t('Special Instructions')}
        </Typography>
        <Box>
          <TextField
            id="mui-textarea"
            label=""
            multiline
            rows={1}
            variant="outlined"
            fullWidth
            value={instructionsValue}
            onChange={handleInstChange}
          />
        </Box>
      </Box>

      <Box>
        <Typography variant="body2">
          If you have received a Quote, please include the Quote Reference # in the Special
          Instructions section above. Quoted pricing will be reflected in your final invoice.
        </Typography>
      </Box>

      <Box sx={{ mt: '31px', mb: '35px' }}>
        <FormControlLabel
          control={
            <Checkbox
              inputProps={{
                'aria-label': 'termsConditions',
              }}
              data-testid="termsConditions"
              size="medium"
              color="primary"
              checked={isAgreeWithTermsAndConditions}
              onChange={handleAgreeTermsConditions}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: 32,
                },
              }}
            />
          }
          label={
            <>
              {t('I agree to Fortis')}{' '}
              <Link
                href={'/sales-terms'}
                target="_blank"
                style={{ textDecoration: 'underline', color: '#30299A', fontWeight: 500 }}
              >
                {t('Sales Terms & Conditions.')}
              </Link>
            </>
          }
        />

        <Box>
          <FormControl>
            <Controller
              name="showAccountFields"
              control={control}
              defaultValue={isAuthenticated ? false : personalDetails?.showAccountFields}
              render={({ field }) => (
                <FormControlLabel
                  sx={{ display: isAuthenticated ? 'none' : 'none' }}
                  control={
                    <Checkbox
                      inputProps={{
                        'aria-label': 'showAccountFields',
                      }}
                      data-testid="showAccountFields"
                      size="medium"
                      color="primary"
                      disabled={isAuthenticated}
                      value={field.value || false}
                      onChange={(_name, value) => field.onChange(value)}
                    />
                  }
                  label={t('i-want-to-create-an-account').toString()}
                />
              )}
            />
          </FormControl>
        </Box>

        {getValues()?.showAccountFields && (
          <FormControl>
            <Controller
              name="firstName"
              control={control}
              defaultValue={personalDetails?.firstName || ''}
              render={({ field }) => (
                <KiboTextBox
                  value={field.value}
                  label={t('first-name')}
                  required
                  sx={{ ...commonStyle }}
                  onBlur={field.onBlur}
                  onChange={(_name, value) => field.onChange(value)}
                  error={!!errors?.firstName}
                  helperText={errors?.firstName?.message as string}
                />
              )}
            />
            <Controller
              name="lastNameOrSurname"
              control={control}
              defaultValue={personalDetails?.lastNameOrSurname || ''}
              render={({ field }) => (
                <KiboTextBox
                  value={field.value}
                  label={t('last-name-or-sur-name')}
                  required
                  sx={{ ...commonStyle }}
                  onBlur={field.onBlur}
                  onChange={(_name, value) => field.onChange(value)}
                  error={!!errors?.lastNameOrSurname}
                  helperText={errors?.lastNameOrSurname?.message as string}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              defaultValue={personalDetails?.password || ''}
              render={({ field }) => (
                <KiboTextBox
                  value={field.value}
                  label={t('password')}
                  required
                  sx={{ ...commonStyle }}
                  onBlur={field.onBlur}
                  onChange={(_name, value) => field.onChange(value)}
                  error={!!errors?.password}
                  helperText={errors?.password?.message as string}
                  type="password"
                  placeholder="password"
                />
              )}
            />

            <PasswordValidation password={userEnteredPassword} />
          </FormControl>
        )}
      </Box>

      <Stack direction="row" justifyContent="flex-end" alignItems="center">
        <LoadingButton
          variant="contained"
          color="primary"
          sx={{
            ...styles.confirmAndPayButtonStyle,
          }}
          disabled={!isEnabled()}
          onClick={handleComplete}
        >
          {t('Place Order')}
        </LoadingButton>
        {/* <Button
          variant="contained"
          color="secondary"
          sx={{
            ...styles.goBackButtonStyle,
            display: 'none',
          }}
          onClick={() => setStepBack()}
        >
          {t('go-back')}
        </Button> */}
      </Stack>
    </Box>
  )
}

export default ReviewStep
