import React, { useCallback, useEffect } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Stack, Button, SxProps, Typography, Divider } from '@mui/material'
import { Theme } from '@mui/material/styles'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import * as yup from 'yup'

import { KiboStepper, OrderReview } from '@/components/checkout'
import { OrderSummary, PromoCodeBadge } from '@/components/common'
import { useCheckoutStepContext, STEP_STATUS } from '@/context'
import { checkoutGetters, orderGetters } from '@/lib/getters'

import type { Checkout, CrOrder } from '@/lib/gql/types'

interface CheckoutUITemplateProps<T> {
  checkout: T
  promoError: string
  isMultiShipEnabled?: boolean
  handleApplyCouponCode: (couponCode: string) => void
  handleRemoveCouponCode: (couponCode: string) => void
  children?: React.ReactNode
  builderContent?: any
}
const buttonStyle = {
  height: '48px',
  width: '188px',
  background: 'primary.main',
  color: '#ffffff',
  border: 0,
  borderRadius: '0px 26px',
  padding: '12px 16px',
  textAlign: 'center',
  fontFamily: 'Poppins',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: '500',
  lineHeight: '24px',
  cursor: 'pointer',
  boxShadow: 'none', // Remove box shadow
  '&:hover': {
    background: '#4C47C4',
  },
  '&:disabled': {
    backgroundColor: '#8D8D8D !important',
  },
} as SxProps<Theme> | undefined

export const useFedExSchema = () => {
  const { t } = useTranslation('common')
  return yup.object().shape({
    fedExAccountNumber: yup
      .string()
      .matches(/^[0-9]+$/, t('this-field-is-min-max-length')) // Ensure only digits
      .required(t('this-field-is-min-max-length')) // Ensure it's not empty
      .test(
        'length-9',
        t('this-field-is-min-max-length'), // Error message
        (value) => value?.length === 9 // Allow only length 9
      ),
  })
}

const useUpsSchema = () => {
  const { t } = useTranslation('common')
  return yup.object().shape({
    upsAccountNumber: yup
      .string()
      .matches(/^[a-zA-Z0-9]+$/, t('this-field-is-min-max-length-6'))
      .required(t('this-field-is-min-max-length-6'))
      .test('length-6', t('this-field-is-min-max-length-6'), (value) => value?.length === 6),
  })
}

const CheckoutUITemplate = <T extends CrOrder | Checkout>(props: CheckoutUITemplateProps<T>) => {
  // Utility to determine method type from shippingMethodName
  const getShippingMethodType = (shippingMethodName?: string): 'fortis' | 'fedex' | 'ups' => {
    if (!shippingMethodName) return 'fortis'
    if (shippingMethodName.toLowerCase().includes('fedex account')) return 'fedex'
    if (shippingMethodName.toLowerCase().includes('ups account')) return 'ups'
    return 'fortis'
  }

  // Get validation schemas once at component level
  const fedexSchema = useFedExSchema()
  const upsSchema = useUpsSchema()
  const {
    checkout,
    handleApplyCouponCode,
    handleRemoveCouponCode,
    promoError,
    isMultiShipEnabled = false,
    children,
    builderContent,
  } = props

  const { t } = useTranslation('common')
  const { activeStep, stepStatus, steps, setStepStatusSubmit, setStepBack } =
    useCheckoutStepContext()
  const buttonLabels = [t('go-to-payment'), t('review-order')] //t('go-to-shipping'),
  const shippingStepIndex = steps.findIndex(
    (step: string) => step.toLowerCase() === t('shipping').toLowerCase()
  )
  const paymentStepIndex = steps.findIndex(
    (step: string) => step.toLowerCase() === t('payment').toLowerCase()
  )
  const reviewStepIndex = steps.findIndex(
    (step: string) => step.toLowerCase() === t('review').toLowerCase()
  )

  // Shipping method and attribute validation for button disabling
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleBack = () => setStepBack()

  // Handle form submission based on the active step
  const handleSubmit = useCallback(() => {
    setIsSubmitting(true)
    if (activeStep === shippingStepIndex) {
      setTimeout(() => {
        const localSelectedShippingMethod = localStorage.getItem('selectedShippingMethod')
        const localSelectedFedexAccountNumber = localStorage.getItem('fedExAccountNumber')
        const localSelectedUpsAccountNumber = localStorage.getItem('upsAccountNumber')

        let validationError = ''
        if (localSelectedShippingMethod === 'fedex') {
          try {
            fedexSchema.validateSync({ fedExAccountNumber: localSelectedFedexAccountNumber })
          } catch (err) {
            validationError =
              'Please enter a valid FedEx customer account number, ' + (err as Error).message
          }
        } else if (localSelectedShippingMethod === 'ups') {
          try {
            upsSchema.validateSync({ upsAccountNumber: localSelectedUpsAccountNumber })
          } catch (err) {
            validationError =
              'Please enter a valid UPS customer account number, ' + (err as Error).message
          }
        }
        if (validationError) {
          // Show error or prevent step
          alert(validationError || t('Please select a shipping method before continuing.'))
          setIsSubmitting(false)
          return
        }
        setIsSubmitting(false)
        setStepStatusSubmit()
      }, 2000)
    } else if (activeStep === reviewStepIndex) {
      const localSelectedShippingMethod = localStorage.getItem('selectedShippingMethod')
      let attributeFqn = ''
      if (localSelectedShippingMethod === 'fedex')
        attributeFqn = 'tenant~customerFedexAccountNumber'
      else if (localSelectedShippingMethod === 'ups')
        attributeFqn = 'tenant~customerUpsAccountNumber'
      let attributeValue = ''
      if (Array.isArray(checkout.attributes)) {
        const attr = checkout.attributes.find(
          (a) => a != null && a.fullyQualifiedName === attributeFqn
        )
        if (attr && Array.isArray(attr.values) && attr.values.length > 0) {
          attributeValue = attr.values[0]
        }
      }
      let validationError = ''
      if (localSelectedShippingMethod === 'fedex') {
        try {
          fedexSchema.validateSync({ fedExAccountNumber: attributeValue })
        } catch (err) {
          validationError = (err as Error).message
        }
      } else if (localSelectedShippingMethod === 'ups') {
        try {
          upsSchema.validateSync({ upsAccountNumber: attributeValue })
        } catch (err) {
          validationError = (err as Error).message
        }
      }
      let shippingMethodName: string | undefined
      if ('fulfillmentInfo' in checkout && checkout.fulfillmentInfo) {
        shippingMethodName = checkout.fulfillmentInfo.shippingMethodName ?? undefined
      }
      if (validationError) {
        // Show error or prevent step
        alert(
          'there is some issue with your selected shipping method-' +
            shippingMethodName +
            ', please check and try again.'
        )
        setIsSubmitting(false)
        return
      }
      setIsSubmitting(false)
      setStepStatusSubmit()
    } else {
      setIsSubmitting(false)
      setStepStatusSubmit()
    }
  }, [
    activeStep,
    shippingStepIndex,
    reviewStepIndex,
    setStepStatusSubmit,
    fedexSchema,
    upsSchema,
    t,
    checkout,
  ])

  const orderSummaryArgs = {
    nameLabel: t('Order Summary'),
    subTotalLabel: `Subtotal`,
    shippingTotalLabel: t('estimated-shipping'),
    taxLabel: t('Estimated Tax'),
    totalLabel: t('Total'),
    handlingLabel: t('Handling'),
    orderDetails: checkout,
    checkoutLabel: t('go-to-checkout'),
    shippingLabel: t('go-to-shipping'),
    backLabel: t('go-back'),
    promoComponent: (
      <PromoCodeBadge
        onApplyCouponCode={handleApplyCouponCode}
        onRemoveCouponCode={handleRemoveCouponCode}
        promoList={checkout?.couponCodes as string[]}
        promoError={!!promoError}
        helpText={promoError}
        discountThresholdMessages={
          checkout?.discountThresholdMessages ? checkout?.discountThresholdMessages : []
        }
      />
    ),
  }
  const showCheckoutSteps = activeStep !== steps.length

  const { publicRuntimeConfig } = getConfig()
  const reCaptchaKey = publicRuntimeConfig.recaptcha.reCaptchaKey

  const commonElements = showCheckoutSteps ? (
    <Stack
      sx={{ paddingTop: '20px', paddingBottom: { md: '40px' } }}
      direction={{ xs: 'column', md: 'row' }}
      gap={0}
    >
      <Stack sx={{ width: '100%', maxWidth: '920' }} gap={1}>
        <Typography variant="h1" sx={{ color: 'primary.main' }}>
          {t('checkout')}
        </Typography>

        <KiboStepper isSticky={true}>{children}</KiboStepper>

        {activeStep < buttonLabels.length && (
          <Stack direction="column" gap={2} justifyContent={'end'} alignItems={'flex-end'}>
            <Divider orientation="horizontal" flexItem sx={{ mt: 2 }} />
            <Button
              variant="contained"
              color="primary"
              sx={{ ...buttonStyle }}
              fullWidth
              onClick={handleSubmit}
              disabled={
                stepStatus !== STEP_STATUS.VALID || activeStep === steps.length - 1 || isSubmitting
              }
            >
              {isSubmitting ? t('loading') : t('continue') || buttonLabels[activeStep]}
            </Button>
            {/* <Button
              variant="contained"
              color="secondary"
              sx={{ ...buttonStyle, display: 'none' }}
              fullWidth
              onClick={handleBack}
              disabled={activeStep === shippingStepIndex}
            >
              {t('go-back')}
            </Button> */}
          </Stack>
        )}
      </Stack>
      <Box
        sx={{
          width: '100%',
          maxWidth: {
            xm: '100%',
            sm: '100%',
            md: '380px',
            lg: '380px',
          },
          height: 'fit-content',
          marginLeft: { lg: '1rem' },
          position: { md: 'sticky' },
          top: '80px',
          marginTop: '82px',
        }}
      >
        <OrderSummary {...orderSummaryArgs}></OrderSummary>

        {/* {activeStep === reviewStepIndex && (
          <OrderReview
            checkout={checkout as CrOrder}
            isMultiShipEnabled={isMultiShipEnabled}
            handleApplyCouponCode={handleApplyCouponCode}
            handleRemoveCouponCode={handleRemoveCouponCode}
            promoError={promoError}
          />
        )} */}

        {/* <Box>
          <p>{builderContent?.data?.emailAddress}</p>
        </Box> */}
      </Box>
    </Stack>
  ) : null

  return (
    <React.Fragment>
      {reCaptchaKey ? (
        <ReCaptchaProvider reCaptchaKey={reCaptchaKey}>{commonElements}</ReCaptchaProvider>
      ) : (
        commonElements
      )}
    </React.Fragment>
  )
}

export default CheckoutUITemplate
