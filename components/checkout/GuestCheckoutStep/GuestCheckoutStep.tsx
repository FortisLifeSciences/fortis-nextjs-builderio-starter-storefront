/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react'

import CreditCardIcon from '@mui/icons-material/CreditCard'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material'
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
import { AddressForm, KiboTextBox } from '@/components/common'
import { LoginDialog } from '@/components/layout'
import { useModalContext } from '@/context'
import { useUpdateOrder } from '@/hooks'
import { CurrencyCode, PaymentType, PaymentWorkflow } from '@/lib/constants'
import { orderGetters } from '@/lib/getters'
import { buildCardPaymentActionForCheckoutParams, tokenizeCreditCardPayment } from '@/lib/helpers'
import type { CardForm, CardTypeForCheckout, TokenizedCard } from '@/lib/types'

import type { CrContact, CrOrder, Maybe, PaymentActionInput } from '@/lib/gql/types'

interface GuestCheckoutStepProps {
  checkout: CrOrder
  updateCheckoutPersonalInfo: (params: { email: Maybe<string> | undefined }) => Promise<void>
  onVoidPayment: (id: string, paymentId: string, paymentAction: PaymentActionInput) => Promise<void>
  onAddPayment: (id: string, paymentAction: PaymentActionInput) => Promise<void>
  onCreateOrder: (checkout: CrOrder) => Promise<void>
}

const specialInstructionMaxLength = 500

const GuestCheckoutStep = (props: GuestCheckoutStepProps) => {
  const { checkout, updateCheckoutPersonalInfo, onVoidPayment, onAddPayment, onCreateOrder } = props
  const { t } = useTranslation('common')
  const { publicRuntimeConfig } = getConfig()
  const pciHost = publicRuntimeConfig?.pciHost
  const apiHost = publicRuntimeConfig?.apiHost as string
  const { showModal, closeModal } = useModalContext()
  const { updateOrder } = useUpdateOrder()

  // Payment is the last step of guest checkout (no separate Review step) - it places
  // the order itself, so its state lives here rather than behind the shared step context.
  const [phase, setPhase] = useState<'shipping' | 'payment'>('shipping')

  const [cardFormData, setCardFormData] = useState<CardForm>({})
  const [isCardFormValid, setIsCardFormValid] = useState(false)
  const [cardholderName, setCardholderName] = useState('')
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [billingContactForm, setBillingContactForm] = useState<CrContact | undefined>()
  const [isBillingFormValid, setIsBillingFormValid] = useState(false)
  const [quoteReferenceValue, setQuoteReferenceValue] = useState('')
  const [instructionsValue, setInstructionsValue] = useState('')
  const [agreeWithTerms, setAgreeWithTerms] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [placeOrderError, setPlaceOrderError] = useState('')
  const [wantsAccount, setWantsAccount] = useState(false)

  // Purchase Order is a login-required option - opening the login dialog from here (rather
  // than a plain link) lets the shopper come straight back into checkout once they're signed
  // in. `checkoutPaymentIntent` tells the post-login PO checkout to default to the PO tab.
  const openLoginModal = () =>
    showModal({
      Component: LoginDialog,
      props: {
        onLoginSuccess: () => {
          sessionStorage.setItem('checkoutPaymentIntent', PaymentType.PURCHASEORDER)
          closeModal()
        },
      },
    })

  const isShippingLocked = phase !== 'shipping'

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return

    // The button used to be `disabled` until every condition was met, which silently ate the
    // click and never told the shopper why - surface the specific reason instead.
    if (!agreeWithTerms) {
      setPlaceOrderError(t('please-agree-to-terms'))
      return
    }
    if (!isCardFormValid) {
      setPlaceOrderError(t('please-complete-card-details'))
      return
    }
    if (!billingSameAsShipping && !isBillingFormValid) {
      setPlaceOrderError(t('please-complete-billing-information'))
      return
    }

    setIsPlacingOrder(true)
    setPlaceOrderError('')
    try {
      const billingContact = billingSameAsShipping
        ? orderGetters.getShippingContact(checkout)
        : (billingContactForm as CrContact)

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

      const paymentAction = buildCardPaymentActionForCheckoutParams(
        CurrencyCode.US,
        checkout,
        cardDetails,
        tokenizedData,
        billingContact,
        billingSameAsShipping
      )
      await onAddPayment(checkout.id as string, paymentAction)

      const comments = [
        quoteReferenceValue ? `${t('quote-reference-number')}: ${quoteReferenceValue}` : '',
        instructionsValue,
      ]
        .filter(Boolean)
        .join('\n')
      if (comments) {
        checkout.shopperNotes = checkout.shopperNotes || {}
        checkout.shopperNotes.comments = comments
        await updateOrder.mutateAsync(checkout)
      }

      // Persisted (rather than passed as component state) because placing the order navigates
      // to a fresh page (/order-confirmation) that has to know this after the fact.
      if (wantsAccount) {
        const shippingContact = orderGetters.getShippingContact(checkout)
        localStorage.setItem(
          'wantsAccountCreation',
          JSON.stringify({
            firstName: shippingContact?.firstName || '',
            lastName: shippingContact?.lastNameOrSurname || '',
            company: shippingContact?.companyOrOrganization || '',
            email: checkout?.email || '',
          })
        )
      } else {
        localStorage.removeItem('wantsAccountCreation')
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
    <Stack gap={5} data-testid="guest-checkout-step">
      <Stack gap={1.5}>
        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: checkoutColors.subtitle }}>
          {t('options')}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <PaymentOptionCard
            icon={<CreditCardIcon />}
            title={t('credit-card')}
            description={t('credit-card-option-description')}
            selected
          />
          <PaymentOptionCard
            icon={<RequestQuoteOutlinedIcon />}
            title={t('purchase-order')}
            description={t('purchase-order-option-description')}
            disabled
            onClick={openLoginModal}
          />
        </Stack>
      </Stack>

      {isShippingLocked ? (
        <ContactShippingSummary checkout={checkout} onEdit={() => setPhase('shipping')} />
      ) : (
        <ContactShippingForm
          checkout={checkout}
          updateCheckoutPersonalInfo={updateCheckoutPersonalInfo}
          onContinue={() => setPhase('payment')}
        />
      )}

      <Stack gap={2} sx={phase !== 'payment' ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
        <Divider />
        <Typography sx={{ fontWeight: 700, fontSize: '28px', color: checkoutColors.heading }}>
          {t('payment-information')}
        </Typography>
        <Divider />
        {phase === 'payment' && (
          <Stack gap={4}>
            <Typography sx={{ fontSize: '15px', color: checkoutColors.body }}>
              {t('enter-your-card-information-to-complete-your-order')}
            </Typography>

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

            <Stack gap={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography
                  sx={{ fontWeight: 600, fontSize: '18px', color: checkoutColors.subtitle }}
                >
                  {t('billing-information')}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={billingSameAsShipping}
                      onChange={(_e, checked) => {
                        setBillingSameAsShipping(checked)
                        if (checked) setPlaceOrderError('')
                      }}
                      inputProps={{ 'aria-label': t('same-as-shipping') }}
                    />
                  }
                  label={t('same-as-shipping')}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontFamily: 'Poppins',
                      fontWeight: 400,
                      fontSize: '13px',
                      lineHeight: '150%',
                      letterSpacing: '-0.065px',
                    },
                  }}
                />
              </Stack>

              {billingSameAsShipping ? (
                (() => {
                  const shippingContact = orderGetters.getShippingContact(checkout)
                  const shippingAddress = shippingContact?.address
                  return (
                    <Stack gap={0.25}>
                      <Typography
                        sx={{ fontWeight: 600, fontSize: '15px', color: checkoutColors.subtitle }}
                      >
                        {shippingContact?.firstName} {shippingContact?.lastNameOrSurname}
                      </Typography>
                      {shippingContact?.companyOrOrganization && (
                        <Typography sx={{ fontSize: '14px', color: checkoutColors.body }}>
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
                  )
                })()
              ) : (
                <AddressForm
                  isUserLoggedIn={false}
                  setAutoFocus={false}
                  validateForm={true}
                  onSaveAddress={({ contact }) => setBillingContactForm(contact as CrContact)}
                  onFormStatusChange={(isValid) => {
                    setIsBillingFormValid(isValid)
                    if (isValid) setPlaceOrderError('')
                  }}
                />
              )}
            </Stack>

            <Divider />

            <Stack gap={1.5}>
              <Typography
                sx={{ fontWeight: 600, fontSize: '18px', color: checkoutColors.subtitle }}
              >
                {t('do-you-have-a-quote')}
              </Typography>
              <KiboTextBox
                value={quoteReferenceValue}
                label={t('quote-reference-number')}
                onChange={(_name, value) => setQuoteReferenceValue(value)}
              />
            </Stack>

            <Stack gap={1.5}>
              <Typography
                sx={{ fontWeight: 600, fontSize: '18px', color: checkoutColors.subtitle }}
              >
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={wantsAccount}
                    onChange={(_e, checked) => setWantsAccount(checked)}
                    inputProps={{ 'aria-label': 'saveInformation' }}
                  />
                }
                label={
                  <>
                    {t('save-info-for-next-time')}{' '}
                    <Typography component="span" sx={{ fontWeight: 700, fontSize: 'inherit' }}>
                      {t('i-want-to-create-an-account')}
                    </Typography>
                  </>
                }
                sx={{ ...checkoutCheckboxLabelSx }}
              />
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
    </Stack>
  )
}

export default GuestCheckoutStep
