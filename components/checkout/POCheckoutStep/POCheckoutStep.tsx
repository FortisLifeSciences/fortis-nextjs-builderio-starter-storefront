/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'

import CreditCardIcon from '@mui/icons-material/CreditCard'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'

import {
  CardDetailsForm,
  ContactShippingForm,
  ContactShippingSummary,
  PaymentOptionCard,
} from '@/components/checkout'
import {
  checkoutColors,
  checkoutCheckboxLabelSx,
  checkoutPrimaryButtonSx,
} from '@/components/checkout/checkoutStyles'
import { KiboPhoneInput, KiboSelect, KiboTextBox } from '@/components/common'
import { useAuthContext } from '@/context'
import { useUpdateOrder } from '@/hooks'
import { CurrencyCode, PaymentType, PaymentWorkflow } from '@/lib/constants'
import { orderGetters } from '@/lib/getters'
import {
  buildCardPaymentActionForCheckoutParams,
  buildPurchaseOrderPaymentActionForCheckoutParams,
  tokenizeCreditCardPayment,
} from '@/lib/helpers'
import type { CardForm, CardTypeForCheckout, TokenizedCard } from '@/lib/types'

import type {
  CrContact,
  CrOrder,
  CrPurchaseOrderPayment,
  CustomerContactCollection,
  CustomerPurchaseOrderAccount,
  Maybe,
  PaymentActionInput,
} from '@/lib/gql/types'

interface POCheckoutStepProps {
  checkout: CrOrder
  addressCollection?: CustomerContactCollection
  customerPurchaseOrderAccount?: CustomerPurchaseOrderAccount
  updateCheckoutPersonalInfo: (params: { email: Maybe<string> | undefined }) => Promise<void>
  onVoidPayment: (id: string, paymentId: string, paymentAction: PaymentActionInput) => Promise<void>
  onAddPayment: (id: string, paymentAction: PaymentActionInput) => Promise<void>
  onCreateOrder: (checkout: CrOrder) => Promise<void>
}

interface BillingContactOverride {
  firstName: string
  lastNameOrSurname: string
  email: string
  phone: string
}

interface BillingAddressOverride {
  companyOrOrganization: string
  address1: string
  address2: string
  countryCode: string
  stateOrProvince: string
  cityOrTown: string
  postalOrZipCode: string
}

const emptyBillingContactOverride: BillingContactOverride = {
  firstName: '',
  lastNameOrSurname: '',
  email: '',
  phone: '',
}

const emptyBillingAddressOverride: BillingAddressOverride = {
  companyOrOrganization: '',
  address1: '',
  address2: '',
  countryCode: '',
  stateOrProvince: '',
  cityOrTown: '',
  postalOrZipCode: '',
}

const specialInstructionMaxLength = 500

// Single-page checkout for logged-in B2B shoppers whose account has Purchase Order
// enabled - lets them place an order on a PO instead of a card, alongside the same
// Contact & Shipping / Billing Information flow used by guest checkout. Reached either
// by an already-signed-in PO account holder, or by a guest who picked "Purchase Order"
// (which requires signing in first, see GuestCheckoutStep).
const POCheckoutStep = (props: POCheckoutStepProps) => {
  const {
    checkout,
    addressCollection,
    customerPurchaseOrderAccount,
    updateCheckoutPersonalInfo,
    onVoidPayment,
    onAddPayment,
    onCreateOrder,
  } = props
  const { t } = useTranslation('common')
  const { publicRuntimeConfig } = getConfig()
  const pciHost = publicRuntimeConfig?.pciHost
  const apiHost = publicRuntimeConfig?.apiHost as string
  const { user } = useAuthContext()
  const { updateOrder } = useUpdateOrder()

  const shippingContact = orderGetters.getShippingContact(checkout)
  const shippingAddress = shippingContact?.address
  const [phase, setPhase] = useState<'shipping' | 'payment'>(
    shippingContact?.email ? 'payment' : 'shipping'
  )
  const isShippingLocked = phase !== 'shipping'

  // Prefill Contact & Shipping from the logged-in user's own account record only - never
  // from the account's saved address book, which is shared across everyone on the B2B
  // account and can belong to a colleague. Whatever the user's account doesn't have is
  // left blank for them to fill in themselves.
  const contactShippingDefaults = {
    firstName: user?.firstName,
    lastNameOrSurname: user?.lastName,
    email: user?.emailAddress,
    companyOrOrganization: user?.companyOrOrganization,
  }

  const [selectedOption, setSelectedOption] = useState<string>(PaymentType.CREDITCARD)
  useEffect(() => {
    // A guest who picked "Purchase Order" before signing in gets dropped back here with
    // that choice remembered - honor it once, then clear it so it doesn't stick around.
    const intent = sessionStorage.getItem('checkoutPaymentIntent')
    sessionStorage.removeItem('checkoutPaymentIntent')
    if (intent === PaymentType.PURCHASEORDER && customerPurchaseOrderAccount?.isEnabled) {
      setSelectedOption(PaymentType.PURCHASEORDER)
    }
  }, [])

  const [cardFormData, setCardFormData] = useState<CardForm>({})
  const [isCardFormValid, setIsCardFormValid] = useState(false)
  const [cardholderName, setCardholderName] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [poNumberError, setPoNumberError] = useState('')
  // Billing Contact (who the invoice is addressed to) and Billing Address (where it's billed)
  // are independent choices in this design - a shopper might invoice a different person at
  // the same address, or the same person at a different address.
  const [billingContactSameAsContact, setBillingContactSameAsContact] = useState(true)
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [billingContactOverride, setBillingContactOverride] = useState<BillingContactOverride>(
    emptyBillingContactOverride
  )
  const [billingAddressOverride, setBillingAddressOverride] = useState<BillingAddressOverride>(
    emptyBillingAddressOverride
  )
  const [instructionsValue, setInstructionsValue] = useState('')
  const [agreeWithTerms, setAgreeWithTerms] = useState(false)
  const [agreePOAuthorization, setAgreePOAuthorization] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [placeOrderError, setPlaceOrderError] = useState('')

  const countries = publicRuntimeConfig.countries
  const provinces = publicRuntimeConfig.provinces

  const accountName = user?.companyOrOrganization || shippingContact?.companyOrOrganization || ''
  const paymentTermDescription =
    customerPurchaseOrderAccount?.customerPurchaseOrderPaymentTerms?.[0]?.description

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return

    if (!agreeWithTerms) {
      setPlaceOrderError(t('please-agree-to-terms'))
      return
    }
    if (selectedOption === PaymentType.PURCHASEORDER && !agreePOAuthorization) {
      setPlaceOrderError(t('please-confirm-po-authorization'))
      return
    }
    if (selectedOption === PaymentType.PURCHASEORDER) {
      if (!poNumber.trim()) {
        setPoNumberError(t('this-field-is-required'))
        setPlaceOrderError(t('please-complete-billing-information'))
        return
      }
    } else if (!isCardFormValid) {
      setPlaceOrderError(t('please-complete-card-details'))
      return
    }
    if (
      (!billingContactSameAsContact &&
        (!billingContactOverride.firstName ||
          !billingContactOverride.lastNameOrSurname ||
          !billingContactOverride.email)) ||
      (!billingAddressSameAsShipping &&
        (!billingAddressOverride.address1 ||
          !billingAddressOverride.cityOrTown ||
          !billingAddressOverride.postalOrZipCode ||
          !billingAddressOverride.countryCode))
    ) {
      setPlaceOrderError(t('please-complete-billing-information'))
      return
    }

    setIsPlacingOrder(true)
    setPlaceOrderError('')
    try {
      const billingContact: CrContact = {
        firstName: billingContactSameAsContact
          ? shippingContact?.firstName
          : billingContactOverride.firstName,
        lastNameOrSurname: billingContactSameAsContact
          ? shippingContact?.lastNameOrSurname
          : billingContactOverride.lastNameOrSurname,
        email: billingContactSameAsContact ? shippingContact?.email : billingContactOverride.email,
        phoneNumbers: {
          home: billingContactSameAsContact
            ? shippingContact?.phoneNumbers?.home
            : billingContactOverride.phone,
        },
        companyOrOrganization: billingAddressSameAsShipping
          ? shippingContact?.companyOrOrganization
          : billingAddressOverride.companyOrOrganization,
        address: billingAddressSameAsShipping
          ? shippingAddress
          : {
              address1: billingAddressOverride.address1,
              address2: billingAddressOverride.address2,
              countryCode: billingAddressOverride.countryCode,
              stateOrProvince: billingAddressOverride.stateOrProvince,
              cityOrTown: billingAddressOverride.cityOrTown,
              postalOrZipCode: billingAddressOverride.postalOrZipCode,
            },
      }

      let paymentAction: PaymentActionInput
      if (selectedOption === PaymentType.PURCHASEORDER) {
        paymentAction = buildPurchaseOrderPaymentActionForCheckoutParams(
          CurrencyCode.US,
          checkout,
          { purchaseOrderNumber: poNumber, customFields: [] } as CrPurchaseOrderPayment,
          billingContact,
          billingAddressSameAsShipping
        )
      } else {
        const tokenizedCardResponse: TokenizedCard | undefined = await tokenizeCreditCardPayment(
          { ...cardFormData, cardholderName },
          pciHost,
          apiHost
        )
        if (!tokenizedCardResponse) {
          throw new Error('Card tokenization failed')
        }

        const cardDetails: CardTypeForCheckout = {
          cardType: cardFormData.cardType as string,
          expireMonth: cardFormData.expireMonth as number,
          expireYear: cardFormData.expireYear as number,
          isCardInfoSaved: false,
          paymentType: PaymentType.CREDITCARD,
          paymentWorkflow: PaymentWorkflow.MOZU,
        }
        const tokenizedData: TokenizedCard = {
          id: tokenizedCardResponse.id,
          numberPart: tokenizedCardResponse.numberPart,
        }

        paymentAction = buildCardPaymentActionForCheckoutParams(
          CurrencyCode.US,
          checkout,
          cardDetails,
          tokenizedData,
          billingContact,
          billingAddressSameAsShipping
        )
      }
      await onAddPayment(checkout.id as string, paymentAction)

      if (instructionsValue) {
        checkout.shopperNotes = checkout.shopperNotes || {}
        checkout.shopperNotes.comments = instructionsValue
        await updateOrder.mutateAsync(checkout)
      }

      await onCreateOrder(checkout)
    } catch (error) {
      console.error(error)
      setPlaceOrderError(t('something-went-wrong'))
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <Stack gap={5} data-testid="po-checkout-step">
      <Stack gap={1.5}>
        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: checkoutColors.subtitle }}>
          {t('options')}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <PaymentOptionCard
            icon={<CreditCardIcon />}
            title={t('credit-card')}
            description={t('card-payment-description')}
            selected={selectedOption === PaymentType.CREDITCARD}
            onClick={() => setSelectedOption(PaymentType.CREDITCARD)}
          />
          <PaymentOptionCard
            icon={<RequestQuoteOutlinedIcon />}
            title={t('purchase-order')}
            description={t('direct-orders')}
            selected={selectedOption === PaymentType.PURCHASEORDER}
            disabled={!customerPurchaseOrderAccount?.isEnabled}
            onClick={() =>
              customerPurchaseOrderAccount?.isEnabled &&
              setSelectedOption(PaymentType.PURCHASEORDER)
            }
          />
        </Stack>
      </Stack>

      {selectedOption === PaymentType.PURCHASEORDER && (
        <>
          <Stack gap={1.5}>
            <Typography sx={{ fontWeight: 700, fontSize: '28px', color: checkoutColors.heading }}>
              {t('billing-account')}
            </Typography>
            <Typography sx={{ fontSize: '15px', color: checkoutColors.body }}>
              {t('po-orders-invoiced-description')}
            </Typography>
            <Box
              sx={{
                border: `1px solid ${checkoutColors.border}`,
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={4}>
                <Stack gap={0.5}>
                  <Typography sx={{ fontSize: '13px', color: checkoutColors.placeholder }}>
                    {t('account')}
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 600, fontSize: '15px', color: checkoutColors.subtitle }}
                  >
                    {accountName}
                  </Typography>
                </Stack>
                {paymentTermDescription && (
                  <Stack gap={0.5}>
                    <Typography sx={{ fontSize: '13px', color: checkoutColors.placeholder }}>
                      {t('payment-terms')}
                    </Typography>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: '15px', color: checkoutColors.subtitle }}
                    >
                      {paymentTermDescription}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        color: checkoutColors.placeholder,
                        textDecoration: 'underline',
                      }}
                    >
                      {t('set-by-fortis-credit')}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Stack>

          <Stack gap={1.5}>
            <Typography sx={{ fontWeight: 700, fontSize: '28px', color: checkoutColors.heading }}>
              {t('purchase-order')}
            </Typography>
            <Typography sx={{ fontSize: '15px', color: checkoutColors.body }}>
              {t('enter-po-number-description')}
            </Typography>
            <KiboTextBox
              value={poNumber}
              label={t('po-number')}
              placeholder={t('po-number-placeholder')}
              required
              error={!!poNumberError}
              helperText={poNumberError}
              onChange={(_name, value) => {
                setPoNumber(value)
                setPoNumberError('')
              }}
            />
          </Stack>
        </>
      )}

      {isShippingLocked ? (
        <ContactShippingSummary checkout={checkout} onEdit={() => setPhase('shipping')} />
      ) : (
        <ContactShippingForm
          checkout={checkout}
          updateCheckoutPersonalInfo={updateCheckoutPersonalInfo}
          onContinue={() => setPhase('payment')}
          continueLabel={t('continue')}
          defaultContact={contactShippingDefaults}
          addressCollection={addressCollection}
        />
      )}

      {phase === 'payment' && (
        <Stack gap={4}>
          <Divider />

          <Stack gap={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 700, fontSize: '28px', color: checkoutColors.heading }}>
                {t('billing-contact')}
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={billingContactSameAsContact}
                    onChange={(_e, checked) => {
                      setBillingContactSameAsContact(checked)
                      if (checked) setPlaceOrderError('')
                    }}
                    inputProps={{ 'aria-label': t('same-as-contact') }}
                  />
                }
                label={t('same-as-contact')}
                sx={{ ...checkoutCheckboxLabelSx }}
              />
            </Stack>
            <Typography sx={{ fontSize: '15px', color: checkoutColors.body }}>
              {t('billing-contact-description')}
            </Typography>

            {billingContactSameAsContact ? (
              <Stack gap={0.25}>
                <Typography
                  sx={{ fontWeight: 600, fontSize: '15px', color: checkoutColors.subtitle }}
                >
                  {shippingContact?.firstName} {shippingContact?.lastNameOrSurname}
                </Typography>
                <Typography sx={{ fontSize: '14px', color: checkoutColors.body }}>
                  {shippingContact?.email}
                </Typography>
                <Typography sx={{ fontSize: '14px', color: checkoutColors.body }}>
                  {shippingContact?.phoneNumbers?.home}
                </Typography>
              </Stack>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <KiboTextBox
                    value={billingContactOverride.firstName}
                    label={t('first-name')}
                    required
                    onChange={(_name, value) =>
                      setBillingContactOverride((prev) => ({ ...prev, firstName: value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <KiboTextBox
                    value={billingContactOverride.lastNameOrSurname}
                    label={t('last-name-or-sur-name')}
                    required
                    onChange={(_name, value) =>
                      setBillingContactOverride((prev) => ({ ...prev, lastNameOrSurname: value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <KiboTextBox
                    value={billingContactOverride.email}
                    label={t('invoice-email')}
                    required
                    onChange={(_name, value) =>
                      setBillingContactOverride((prev) => ({ ...prev, email: value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <KiboPhoneInput
                    value={billingContactOverride.phone}
                    label={t('phone-number-home')}
                    onChange={(_name, value) =>
                      setBillingContactOverride((prev) => ({ ...prev, phone: value }))
                    }
                  />
                </Grid>
              </Grid>
            )}
          </Stack>

          <Stack gap={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 700, fontSize: '28px', color: checkoutColors.heading }}>
                {t('billing-address')}
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={billingAddressSameAsShipping}
                    onChange={(_e, checked) => {
                      setBillingAddressSameAsShipping(checked)
                      if (checked) setPlaceOrderError('')
                    }}
                    inputProps={{ 'aria-label': t('same-as-shipping') }}
                  />
                }
                label={t('same-as-shipping')}
                sx={{ ...checkoutCheckboxLabelSx }}
              />
            </Stack>

            {billingAddressSameAsShipping ? (
              <Stack gap={0.25}>
                {shippingContact?.companyOrOrganization && (
                  <Typography
                    sx={{ fontWeight: 600, fontSize: '15px', color: checkoutColors.subtitle }}
                  >
                    {shippingContact.companyOrOrganization}
                  </Typography>
                )}
                {shippingAddress?.address1 && (
                  <Typography sx={{ fontSize: '14px', color: checkoutColors.body }}>
                    {shippingAddress.address1}
                  </Typography>
                )}
                {(shippingAddress?.cityOrTown ||
                  shippingAddress?.stateOrProvince ||
                  shippingAddress?.postalOrZipCode) && (
                  <Typography sx={{ fontSize: '14px', color: checkoutColors.placeholder }}>
                    {[
                      shippingAddress?.cityOrTown,
                      shippingAddress?.stateOrProvince,
                      shippingAddress?.countryCode,
                    ]
                      .filter(Boolean)
                      .join(', ')}{' '}
                    {shippingAddress?.postalOrZipCode}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <KiboTextBox
                    value={billingAddressOverride.companyOrOrganization}
                    label={t('company-or-organization')}
                    required
                    onChange={(_name, value) =>
                      setBillingAddressOverride((prev) => ({
                        ...prev,
                        companyOrOrganization: value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <KiboTextBox
                    value={billingAddressOverride.address1}
                    label={t('street-address-1')}
                    required
                    onChange={(_name, value) =>
                      setBillingAddressOverride((prev) => ({ ...prev, address1: value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <KiboTextBox
                    value={billingAddressOverride.address2}
                    label={t('street-address-2')}
                    onChange={(_name, value) =>
                      setBillingAddressOverride((prev) => ({ ...prev, address2: value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <KiboSelect
                    name="billing-country-code"
                    label={t('country-code')}
                    value={billingAddressOverride.countryCode}
                    required
                    onChange={(_name, value) =>
                      setBillingAddressOverride((prev) => ({ ...prev, countryCode: value }))
                    }
                  >
                    {countries?.map((country: { name: string; code: string }) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </KiboSelect>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <KiboSelect
                    name="billing-state-or-province"
                    label={t('state-or-province')}
                    value={billingAddressOverride.stateOrProvince}
                    onChange={(_name, value) =>
                      setBillingAddressOverride((prev) => ({ ...prev, stateOrProvince: value }))
                    }
                  >
                    {provinces?.map((province: { name: string; code: string }) => (
                      <MenuItem key={province.code} value={province.code}>
                        {province.name}
                      </MenuItem>
                    ))}
                  </KiboSelect>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <KiboTextBox
                    value={billingAddressOverride.cityOrTown}
                    label={t('city-or-town')}
                    required
                    onChange={(_name, value) =>
                      setBillingAddressOverride((prev) => ({ ...prev, cityOrTown: value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <KiboTextBox
                    value={billingAddressOverride.postalOrZipCode}
                    label={t('postal-or-zip-code')}
                    required
                    onChange={(_name, value) =>
                      setBillingAddressOverride((prev) => ({ ...prev, postalOrZipCode: value }))
                    }
                  />
                </Grid>
              </Grid>
            )}
          </Stack>

          {selectedOption === PaymentType.CREDITCARD && (
            <Stack gap={2}>
              <Typography
                sx={{ fontWeight: 600, fontSize: '18px', color: checkoutColors.subtitle }}
              >
                {t('card-details')}
              </Typography>
              <KiboTextBox
                value={cardholderName}
                label={t('cardholder-name')}
                onChange={(_name, value) => setCardholderName(value)}
              />
              <CardDetailsForm
                validateForm={false}
                fullWidth
                showCardTypeIcon={false}
                onSaveCardData={(cardData) => setCardFormData(cardData)}
                onFormStatusChange={(isValid, cardData) => {
                  setIsCardFormValid(isValid)
                  if (isValid) setPlaceOrderError('')
                  if (cardData) setCardFormData(cardData)
                }}
              />
            </Stack>
          )}

          <Stack gap={1.5}>
            <Typography sx={{ fontWeight: 600, fontSize: '18px', color: checkoutColors.subtitle }}>
              {t('special-instructions')}
            </Typography>
            <KiboTextBox
              value={instructionsValue}
              multiline
              rows={4}
              inputProps={{ maxLength: specialInstructionMaxLength }}
              onChange={(_name, value) =>
                setInstructionsValue(value.slice(0, specialInstructionMaxLength))
              }
              helperText={`${instructionsValue.length}/${specialInstructionMaxLength}`}
            />
          </Stack>

          <Stack gap={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeWithTerms}
                  onChange={(_e, checked) => {
                    setAgreeWithTerms(checked)
                    setPlaceOrderError('')
                  }}
                  inputProps={{ 'aria-label': 'termsConditions' }}
                />
              }
              label={
                <>
                  {t("I agree to Fortis'")}{' '}
                  <MuiLink
                    href="/sales-terms"
                    target="_blank"
                    sx={{ textDecoration: 'underline', color: checkoutColors.selectedBorder }}
                  >
                    {t('Sales Terms & Conditions.')}
                  </MuiLink>
                  *
                </>
              }
              sx={{ ...checkoutCheckboxLabelSx }}
            />

            {selectedOption === PaymentType.PURCHASEORDER && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreePOAuthorization}
                    onChange={(_e, checked) => {
                      setAgreePOAuthorization(checked)
                      setPlaceOrderError('')
                    }}
                    inputProps={{ 'aria-label': 'poAuthorization' }}
                  />
                }
                label={
                  <>
                    {t('i-am-authorized-to-commit-po-on-behalf-of')}{' '}
                    <Typography component="span" sx={{ fontWeight: 700, fontSize: 'inherit' }}>
                      {accountName}
                    </Typography>
                    *
                  </>
                }
                sx={{ ...checkoutCheckboxLabelSx }}
              />
            )}
          </Stack>

          {placeOrderError && (
            <Typography sx={{ color: 'error.main', fontSize: '14px' }}>
              {placeOrderError}
            </Typography>
          )}

          <Box>
            <LoadingButton
              variant="contained"
              color="primary"
              loading={isPlacingOrder}
              onClick={handlePlaceOrder}
              sx={{ ...checkoutPrimaryButtonSx }}
            >
              {t('Place Order')}
            </LoadingButton>
          </Box>
        </Stack>
      )}
    </Stack>
  )
}

export default POCheckoutStep
