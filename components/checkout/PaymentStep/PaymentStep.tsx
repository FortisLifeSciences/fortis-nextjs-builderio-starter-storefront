/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import Help from '@mui/icons-material/Help'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import { TabContext, TabList } from '@mui/lab'
import {
  Stack,
  Checkbox,
  FormControlLabel,
  styled,
  FormControl,
  Typography,
  Button,
  Box,
  Tooltip,
  Tab,
  Divider,
  NoSsr,
  Grid,
} from '@mui/material'
import { find } from 'lodash'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'
import { useReCaptcha } from 'next-recaptcha-v3'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { StandardShippingStepStyle } from '../StandardShippingStep/standardShippingStep.style'
import { CardDetailsForm, PurchaseOrderForm } from '@/components/checkout'
import {
  AddressForm,
  KiboTextBox,
  KiboRadio,
  PaymentBillingCard,
  AddressCard,
} from '@/components/common'
import { useCheckoutStepContext, STEP_STATUS, useAuthContext, useSnackbarContext } from '@/context'
import {
  useCreateCustomerAddress,
  usePaymentTypes,
  useUpdateOrderBillingInfo,
  useValidateCustomerAddress,
} from '@/hooks'
import {
  AddressType,
  CountryCode,
  CurrencyCode,
  DefaultId,
  PageType,
  PaymentType,
  PaymentWorkflow,
} from '@/lib/constants'
import { addressGetters, cardGetters, orderGetters, userGetters } from '@/lib/getters'
import {
  actions,
  buildAddressParams,
  buildCardPaymentActionForCheckoutParams,
  buildPurchaseOrderPaymentActionForCheckoutParams,
  hasPermission,
  tokenizeCreditCardPayment,
  validateGoogleReCaptcha,
} from '@/lib/helpers'
import type {
  Address,
  CardForm,
  ContactForm,
  SavedCard,
  TokenizedCard,
  PaymentAndBilling,
  CardTypeForCheckout,
  SavedBillingAddress,
} from '@/lib/types'

import type {
  CrContact,
  CrAddress,
  CrOrder,
  PaymentActionInput,
  Checkout,
  CuAddress,
  CustomerPurchaseOrderPaymentTerm,
  CrPurchaseOrderPayment,
  CrPurchaseOrderPaymentTerm,
  CardCollection,
  CustomerContactCollection,
  CustomerPurchaseOrderAccount,
  CheckoutGrouping,
  CustomerContact,
  CrPurchaseOrderCustomField,
  CrPaymentCardInput,
} from '@/lib/gql/types'

interface PaymentStepProps {
  checkout: CrOrder | Checkout
  contact?: ContactForm
  isMultiShipEnabled?: boolean
  addressCollection?: CustomerContactCollection
  cardCollection?: CardCollection
  customerPurchaseOrderAccount?: CustomerPurchaseOrderAccount
  onVoidPayment: (id: string, paymentId: string, paymentAction: PaymentActionInput) => Promise<void>
  onAddPayment: (id: string, paymentAction: PaymentActionInput) => Promise<void>
}

interface PaymentsType {
  id: string
  name: string
}

const StyledHeadings = styled(Typography)(() => ({
  width: '100%',
  paddingLeft: '0.5rem',
  fontWeight: 'bold',
}))

const formControlLabelStyle = {
  backgroundColor: 'grey.100',
  height: '3.313rem',
  width: '100%',
  marginLeft: '0',
  marginBottom: '1.75rem',
  maxWidth: '26.313rem',
}

const radioStyle = {
  color: 'primary',
  '& .Mui-checked': {
    color: 'primary',
  },
}

const initialCardFormData: CardForm = {
  cardNumber: '',
  cardType: '',
  expireMonth: 0,
  expireYear: 0,
  cvv: '',
  isCardDetailsValidated: false,
  isCardInfoSaved: false,
}

const initialPurchaseOrderFormData: any = {
  poNumber: '',
  purchaseOrderPaymentTerms: '',
  isPurchaseOrderFormValidated: false,
  customFields: [],
}

const initialBillingAddressData: Address = {
  contact: {
    firstName: '',
    lastNameOrSurname: '',
    email: '',
    address: {
      address1: '',
      address2: '',
      cityOrTown: '',
      stateOrProvince: '',
      postalOrZipCode: '',
      countryCode: 'US',
    },
    phoneNumbers: {
      home: '',
    },
  },
  isSameBillingShippingAddress: false,
  isAddressValid: false,
  isDataUpdated: false,
}

type SavedPODetails = {
  purchaseOrder: CrPurchaseOrderPayment
  billingAddressInfo: SavedBillingAddress
} | null

const PaymentStep = (props: PaymentStepProps) => {
  const {
    checkout,
    isMultiShipEnabled = false,
    cardCollection,
    addressCollection,
    customerPurchaseOrderAccount,
    onVoidPayment,
    onAddPayment,
  } = props

  const { t } = useTranslation('common')
  const { isAuthenticated, user } = useAuthContext()
  const { loadPaymentTypes } = usePaymentTypes()
  const paymentTypes = loadPaymentTypes()
  const { validateCustomerAddress } = useValidateCustomerAddress()

  const newPaymentTypes = paymentTypes
    .map((paymentType: PaymentsType) =>
      paymentType.id === PaymentType.CREDITCARD ||
      (hasPermission(actions.VIEW_PO) &&
        paymentType.id === PaymentType.PURCHASEORDER &&
        user?.id &&
        customerPurchaseOrderAccount?.isEnabled)
        ? paymentType
        : null
    )
    .filter(Boolean)

  const {
    stepStatus,
    setStepNext,
    setStepStatusValid,
    setStepStatusComplete,
    setStepStatusIncomplete,
  } = useCheckoutStepContext()

  const { executeRecaptcha } = useReCaptcha()
  const { showSnackbar } = useSnackbarContext()

  const { publicRuntimeConfig } = getConfig()
  const reCaptchaKey = publicRuntimeConfig.recaptcha.reCaptchaKey
  const allowInvalidAddresses = publicRuntimeConfig.allowInvalidAddresses

  // getting the selected Payment type from checkout.payments
  const checkoutPayment = orderGetters.getSelectedPaymentType(checkout)
  const checkoutPaymentType = checkoutPayment?.paymentType?.toString() ?? ''

  const [selectedPaymentTypeRadio, setSelectedPaymentTypeRadio] = useState<string>(
    checkoutPaymentType ? checkoutPaymentType : PaymentType.CREDITCARD
  )

  const [isAddingNewPayment, setIsAddingNewPayment] = useState<boolean>(false)

  const handlePaymentTypeRadioChange = (value: string) => {
    setSelectedPaymentTypeRadio(value)
    setIsAddingNewPayment(false)
    setBillingFormAddress(initialBillingAddressData)
  }
  // Purchase Order details
  const handleInitialPODetails: SavedPODetails | null = useMemo(() => {
    return checkoutPaymentType === PaymentType.PURCHASEORDER
      ? {
          purchaseOrder: checkoutPayment?.billingInfo?.purchaseOrder as CrPurchaseOrderPayment,
          billingAddressInfo: {
            contact: checkoutPayment?.billingInfo?.billingContact as CrContact,
          },
        }
      : null
  }, [checkoutPaymentType, checkoutPayment])

  const [
    savedPaymentBillingDetailsForPurchaseOrder,
    setSavedPaymentBillingDetailsForPurchaseOrder,
  ] = useState<SavedPODetails | null>(handleInitialPODetails)

  const creditLimit = customerPurchaseOrderAccount?.creditLimit ?? 0
  const availableBalance = customerPurchaseOrderAccount?.availableBalance ?? 0
  const customerPurchaseOrderPaymentTerms = (
    customerPurchaseOrderAccount?.customerPurchaseOrderPaymentTerms as CustomerPurchaseOrderPaymentTerm[]
  )?.filter(
    (purchaseOrderTerm: CustomerPurchaseOrderPaymentTerm) =>
      purchaseOrderTerm.siteId === checkout.siteId
  )

  const shouldShowPreviouslySavedPaymentsForPurchaseOrder =
    selectedPaymentTypeRadio === PaymentType.PURCHASEORDER &&
    savedPaymentBillingDetailsForPurchaseOrder?.purchaseOrder &&
    !isAddingNewPayment

  // Credit Card
  const [cardOptions, setCardOptions] = useState<PaymentAndBilling[]>([])
  const [selectedCardRadio, setSelectedCardRadio] = useState('')
  const [isCVVAddedForNewPayment, setIsCVVAddedForNewPayment] = useState<boolean>(false)
  const [cvv, setCvv] = useState<string>('')

  const useDetailsSchema = () => {
    return yup.object().shape({
      cvv: yup
        .string()
        .required(t('cvv-is-required'))
        .matches(/^\d{3,4}$/g, t('invalid-cvv')),
    })
  }

  const defaultCvv = {
    cvv: '',
  }
  const {
    formState: { errors, isValid: isCvvValid },
    control,
    resetField,
  } = useForm({
    mode: 'all',
    reValidateMode: 'onBlur',
    defaultValues: defaultCvv,
    resolver: yupResolver(useDetailsSchema()),
    shouldFocusError: true,
  })

  // default card details if payment method is card
  const defaultCustomerAccountCard = userGetters.getDefaultPaymentBillingMethod(cardOptions)

  const shouldShowCardForm =
    selectedPaymentTypeRadio === PaymentType.CREDITCARD && isAddingNewPayment

  const shouldShowPurchaseOrderForm = selectedPaymentTypeRadio === PaymentType.PURCHASEORDER

  const shouldShowBillingAddressForm = shouldShowCardForm || shouldShowPurchaseOrderForm

  const shouldShowPreviouslySavedCards =
    selectedPaymentTypeRadio === PaymentType.CREDITCARD && cardOptions.length && !isAddingNewPayment

  // Form Data
  const [cardFormDetails, setCardFormDetails] = useState<CardForm>({})

  const handleCardFormData = (cardData: CardForm) => {
    setCardFormDetails({
      ...cardFormDetails,
      ...cardData,
    })

    setCvv(cardData.cvv as string)
  }

  const handleCardFormValidDetails = (isValid: boolean) => {
    setCardFormDetails({ ...cardFormDetails, isCardDetailsValidated: isValid })
  }

  const handleSavePaymentMethodCheckbox = () => {
    setCardFormDetails({
      ...cardFormDetails,
      isCardInfoSaved: !cardFormDetails.isCardInfoSaved,
    })
  }

  // purchase order form values
  const [purchaseOrderFormDetails, setPurchaseOrderFormDetails] = useState<
    CrPurchaseOrderPayment & { isPurchaseOrderFormValidated?: boolean }
  >({})

  const handlePurchaseOrderFormData = (purchaseOrderFormData: any) => {
    setPurchaseOrderFormDetails({
      ...purchaseOrderFormDetails,
      ...purchaseOrderFormData,
    })
  }

  const handlePurchaseOrderFormValidDetails = (isValid: boolean) => {
    setPurchaseOrderFormDetails({
      ...purchaseOrderFormDetails,
      isPurchaseOrderFormValidated: isValid,
    })
  }

  // Address
  const [billingFormAddress, setBillingFormAddress] = useState<Address>(initialBillingAddressData)

  const [validateForm, setValidateForm] = useState<boolean>(false)

  const checkoutBillingContact = orderGetters.getBillingContact(checkout as CrOrder)

  // getting billing address from all addresses returned from server
  const userBillingAddress = isAuthenticated
    ? userGetters.getUserBillingAddresses(addressCollection?.items as CustomerContact[])
    : []
  if (checkoutBillingContact && checkoutBillingContact.id === null) {
    checkoutBillingContact.id = DefaultId.ADDRESSID
  }
  const [savedBillingAddresses, setSavedBillingAddresses] = useState<CustomerContact[] | undefined>(
    userGetters.getAllBillingAddresses(checkoutBillingContact, userBillingAddress)
  )
  const defaultBillingAddress = userGetters.getDefaultBillingAddress(
    savedBillingAddresses as CustomerContact[]
  )
  const previouslySavedBillingAddress = userGetters.getOtherBillingAddress(
    savedBillingAddresses as CustomerContact[],
    defaultBillingAddress?.id as number
  )
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<number>(
    checkoutBillingContact?.id as number
  )
  const [isAddressFormValid, setIsAddressFormValid] = useState<boolean>(false)

  const handleBillingFormAddress = (address: Address) => {
    const updatedAddress = {
      contact: {
        ...address.contact,
        email: checkout?.email,
      },
      isAddressValid: true,
      isDataUpdated: address.isDataUpdated,
    } as Address
    setBillingFormAddress({
      ...billingFormAddress,
      ...updatedAddress,
    })
    // handleSaveAddressToCheckout(updatedAddress)
  }

  const handleBillingFormValidDetails = (isValid: boolean) => {
    setIsAddressFormValid(isValid)
    setBillingFormAddress({ ...billingFormAddress, isAddressValid: isValid })
  }

  const handleSameAsShippingAddressCheckbox = (value: boolean) => {
    let address = initialBillingAddressData
    if (value) {
      setSelectedBillingAddressId(-1)
      address = {
        contact: (checkout as CrOrder)?.fulfillmentInfo?.fulfillmentContact as ContactForm,
        isSameBillingShippingAddress: value,
      }
    }

    setBillingFormAddress({
      ...address,
      isAddressValid: true,
    })

    if (!value && selectedBillingAddressId !== -1) {
      setSelectedBillingAddressId(
        (checkoutBillingContact?.id ?? defaultBillingAddress?.id) as number
      )
      setBillingFormAddress({
        contact: (checkoutBillingContact?.id
          ? { ...checkoutBillingContact, email: checkout?.email }
          : { ...defaultBillingAddress, email: checkout?.email }) as ContactForm,
        isSameBillingShippingAddress: value,
        isAddressValid: true,
      })
    }
  }

  const cancelAddingNewPaymentMethod = () => {
    setIsAddingNewPayment(false)
    // setNewPaymentMethod('')
    setBillingFormAddress(initialBillingAddressData)
    // setCardFormDetails(initialCardFormData)
  }

  const handleSaveNewPaymentMethod = async () => {
    setValidateForm(true)
  }

  const handleInitialCardDetailsLoad = () => {
    setStepStatusIncomplete()

    if (!cardCollection || !addressCollection) return

    // get card and billing address formatted data from server
    const accountPaymentDetails =
      userGetters.getSavedCardsAndBillingDetails(cardCollection, addressCollection) || []

    // find default payment details from server data
    const defaultCard = userGetters.getDefaultPaymentBillingMethod(accountPaymentDetails)

    // get previously saved checkout payments
    const checkoutPaymentWithNewStatus = orderGetters.getSelectedPaymentType(checkout)

    // if checkoutPayment details are not present in accountPaymentDetails, push it and set it as selected radio
    if (checkoutPaymentWithNewStatus?.paymentType === PaymentType.CREDITCARD) {
      const cardDetails = checkoutPaymentWithNewStatus?.billingInfo?.card
      const billingAddress = checkoutPaymentWithNewStatus?.billingInfo?.billingContact
      Boolean(
        !accountPaymentDetails?.length ||
          !accountPaymentDetails?.some(
            (each) => each.cardInfo?.id === cardDetails?.paymentServiceCardId
          )
      ) &&
        accountPaymentDetails?.push({
          cardInfo: {
            cardNumberPart: cardDetails?.cardNumberPartOrMask as string,
            id: cardDetails?.paymentServiceCardId as string,
            expireMonth: cardDetails?.expireMonth,
            expireYear: cardDetails?.expireYear,
            paymentType: PaymentType.CREDITCARD,
            cardType: cardDetails?.paymentOrCardType as string,
          },
          billingAddressInfo: {
            contact: {
              ...billingAddress,
            },
          },
        })

      setSelectedCardRadio(cardDetails?.paymentServiceCardId as string)
    } else {
      // if defaultCard is available, set as selected radio
      cardGetters.getCardId(defaultCard?.cardInfo) &&
        selectedCardRadio === '' &&
        setSelectedCardRadio(defaultCard.cardInfo?.id as string)
    }

    if (accountPaymentDetails?.length) {
      setCardOptions(accountPaymentDetails)
    }
  }

  // handle saved payment method radio selection to select different payment method
  const handleRadioSavedCardSelection = (value: string) => {
    setStepStatusIncomplete()
    setSelectedCardRadio(value)
    setIsCVVAddedForNewPayment(false)
    resetField('cvv')
  }

  const handleAddPaymentMethod = () => {
    setBillingFormAddress(initialBillingAddressData)
    setIsAddingNewPayment(true)
  }

  const handleTokenization = async (card: CardForm) => {
    const pciHost = publicRuntimeConfig?.pciHost
    const apiHost = publicRuntimeConfig?.apiHost as string
    const tokenizedCardResponse: TokenizedCard = await tokenizeCreditCardPayment(
      card,
      pciHost,
      apiHost
    )

    if (!tokenizedCardResponse) return

    setIsAddingNewPayment(false)
    if (!isAddingNewPayment) {
      setCardOptions([
        ...cardOptions,
        {
          cardInfo: {
            id: tokenizedCardResponse.id,
            cardNumberPart: tokenizedCardResponse.numberPart,
            paymentType: PaymentType.CREDITCARD,
            expireMonth: card.expireMonth,
            expireYear: card.expireYear,
            isCardInfoSaved: card.isCardInfoSaved,
            cardType: card.cardType,
          },
          billingAddressInfo: {
            ...billingFormAddress,
            isSameBillingShippingAddress: billingFormAddress.isSameBillingShippingAddress,
          },
        },
      ])
    }

    setSelectedCardRadio(tokenizedCardResponse.id as string)
    setValidateForm(false)
    setIsCVVAddedForNewPayment(true)
  }

  const handlePurchaseOrderValidation = async (purchaseOrderFormData: any) => {
    setIsAddingNewPayment(false)
    setSavedPaymentBillingDetailsForPurchaseOrder({
      purchaseOrder: {
        purchaseOrderNumber: purchaseOrderFormData?.purchaseOrderNumber,
        paymentTerm: purchaseOrderFormData?.paymentTerm,
        customFields: purchaseOrderFormData?.customFields,
      },
      billingAddressInfo: {
        ...billingFormAddress,
        isSameBillingShippingAddress: billingFormAddress.isSameBillingShippingAddress,
      },
    })
    setValidateForm(false)
  }

  const handleValidateBillingAddress = async (address: CuAddress) => {
    try {
      if (!allowInvalidAddresses && address?.countryCode === CountryCode.US) {
        await validateCustomerAddress.mutateAsync({
          addressValidationRequestInput: {
            address,
          },
        })
      }

      if (selectedPaymentTypeRadio === PaymentType.CREDITCARD) {
        handleTokenization({ ...cardFormDetails })
      }

      if (selectedPaymentTypeRadio === PaymentType.PURCHASEORDER) {
        handlePurchaseOrderValidation({ ...purchaseOrderFormDetails })
      }
    } catch (error) {
      setValidateForm(false)
      console.error(error)
    }
  }

  const submitFormWithRecaptcha = () => {
    if (!executeRecaptcha) {
      console.log('Execute recaptcha not yet available')
      return
    }
    executeRecaptcha('enquiryFormSubmit').then(async (gReCaptchaToken: any) => {
      const captcha = await validateGoogleReCaptcha(gReCaptchaToken)

      if (captcha?.status === 'success') {
        await handlePayment()
      } else {
        showSnackbar(captcha.message, 'error')
      }
    })
  }

  const getCardPaymentAction = async () => {
    let paymentActionToBeAdded: PaymentActionInput = {}
    let paymentActionToBeVoided: PaymentActionInput = {}

    const selectedPaymentMethod = cardOptions.find(
      (each) => each?.cardInfo?.id === selectedCardRadio
    )

    const {
      cardType,
      expireMonth,
      expireYear,
      isCardInfoSaved,
      paymentType,
      cardNumberPart,
      id,
      cardholderName,
    } = cardGetters.getCardDetails(selectedPaymentMethod?.cardInfo as SavedCard)

    if (!isCVVAddedForNewPayment) {
      await handleTokenization({
        id,
        cardType,
        cvv,
        cardNumber: cardNumberPart,
        cardholderName,
      })
    }

    const cardDetails: CardTypeForCheckout = {
      cardType,
      expireMonth,
      expireYear,
      isCardInfoSaved,
      paymentType,
      paymentWorkflow: PaymentWorkflow.MOZU,
    }

    const tokenizedData: TokenizedCard = {
      id,
      numberPart: cardNumberPart,
    }

    const isSameAsShipping = addressGetters.getIsBillingShippingAddressSame(
      selectedPaymentMethod?.billingAddressInfo
    )

    const paymentWithNewStatus = orderGetters.getSelectedPaymentType(checkout)

    if (paymentWithNewStatus?.billingInfo?.card?.paymentServiceCardId === selectedCardRadio) {
      setStepStatusComplete()
      setStepNext()
      return
    }
    paymentActionToBeAdded = {
      ...buildCardPaymentActionForCheckoutParams(
        CurrencyCode.US,
        checkout,
        { ...cardDetails },
        tokenizedData,
        selectedPaymentMethod?.billingAddressInfo?.contact as CrContact,
        isSameAsShipping
      ),
      actionName: '',
    }

    if (paymentWithNewStatus?.paymentType === PaymentType.CREDITCARD) {
      const card = paymentWithNewStatus?.billingInfo?.card
      const voidedCard = {
        paymentWorkflow: paymentWithNewStatus?.paymentWorkflow as string,
        isCardInfoSaved: card?.isCardInfoSaved as boolean,
        cardType: card?.paymentOrCardType as string,
        expireMonth: card?.expireMonth as number,
        expireYear: card?.expireYear as number,
        paymentType: paymentWithNewStatus?.paymentType as string,
      }

      paymentActionToBeVoided = buildCardPaymentActionForCheckoutParams(
        CurrencyCode.US,
        checkout,
        voidedCard,
        tokenizedData,
        paymentWithNewStatus?.billingInfo?.billingContact as CrContact,
        isSameAsShipping
      )

      paymentActionToBeVoided = { ...paymentActionToBeVoided, actionName: 'VoidPayment' }
    }

    return {
      paymentActionToBeAdded,
      paymentActionToBeVoided,
      paymentId: paymentWithNewStatus?.id as string,
    }
  }

  const getPurchaseOrderPaymentAction = () => {
    let paymentActionToBeAdded: PaymentActionInput = {}
    let paymentActionToBeVoided: PaymentActionInput = {}

    const isSameAsShipping = addressGetters.getIsBillingShippingAddressSame(
      savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo
    )
    const purchaseOrderData = savedPaymentBillingDetailsForPurchaseOrder?.purchaseOrder ?? {}

    const paymentWithNewStatus = orderGetters.getSelectedPaymentType(checkout)

    if (paymentWithNewStatus?.paymentType === PaymentType.PURCHASEORDER) {
      const purchaseOrderDataWithNewStatus = {
        purchaseOrderNumber: paymentWithNewStatus?.billingInfo?.purchaseOrder?.purchaseOrderNumber,
        purchaseOrderPaymentTerms: paymentWithNewStatus?.billingInfo?.purchaseOrder?.paymentTerm,
        customFields: paymentWithNewStatus?.billingInfo?.purchaseOrder?.customFields,
      }

      paymentActionToBeVoided = buildPurchaseOrderPaymentActionForCheckoutParams(
        CurrencyCode.US,
        checkout,
        purchaseOrderDataWithNewStatus,
        paymentWithNewStatus?.billingInfo?.billingContact as CrContact,
        isSameAsShipping
      )

      paymentActionToBeVoided = { ...paymentActionToBeVoided, actionName: 'VoidPayment' }
    }

    paymentActionToBeAdded = {
      ...buildPurchaseOrderPaymentActionForCheckoutParams(
        CurrencyCode.US,
        checkout,
        {
          ...purchaseOrderData,
          customFields: purchaseOrderData?.customFields?.length
            ? purchaseOrderData?.customFields
            : purchaseOrderFormDetails?.customFields,
        },
        {
          ...savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo?.contact,
          email:
            savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo?.contact?.email ||
            checkout?.email,
        } as CrContact,
        isSameAsShipping
      ),
      actionName: '',
    }

    return {
      paymentActionToBeAdded,
      paymentActionToBeVoided,
      paymentId: paymentWithNewStatus?.id as string,
    }
  }

  const handlePayment = async () => {
    const paymentMethodSelection: any = {
      [PaymentType.PURCHASEORDER]: getPurchaseOrderPaymentAction,
      [PaymentType.CREDITCARD]: getCardPaymentAction,
    }

    const responseForVoid =
      checkoutPaymentType && (await paymentMethodSelection[checkoutPaymentType]())

    if (responseForVoid?.paymentActionToBeVoided?.actionName) {
      await onVoidPayment(
        checkout?.id as string,
        responseForVoid.paymentId,
        responseForVoid.paymentActionToBeVoided
      )
    }

    const responseForAdd =
      selectedPaymentTypeRadio && (await paymentMethodSelection[selectedPaymentTypeRadio]())
    if (checkout?.id && responseForAdd?.paymentActionToBeAdded) {
      await onAddPayment(checkout.id, responseForAdd?.paymentActionToBeAdded)
      setStepStatusComplete()
      setStepNext()
    }
  }

  const showBillingSameAsShippingAddressCheckbox = () => {
    if (isMultiShipEnabled) {
      if (((checkout as Checkout)?.groupings as CheckoutGrouping[])?.length > 1) {
        const destinations: string[] = []
        return checkout.items?.some((item) => {
          const isSameDestination = destinations?.includes(item?.destinationId as string)
          if (!isSameDestination) {
            destinations.push(item?.destinationId as string)
          }
          return isSameDestination
        })
      } else {
        return true
      }
    } else {
      return (
        (checkout as CrOrder)?.fulfillmentInfo?.shippingMethodCode &&
        (checkout as CrOrder)?.fulfillmentInfo?.shippingMethodName
      )
    }
  }

  const [isAddressSavedToAccount, setIsAddressSavedToAccount] = useState<boolean>(true)
  const [isNewAddressAdded, setIsNewAddressAdded] = useState<boolean>(false)
  const [shouldShowAddBillingAddressButton, setShouldShowAddBillingAddressButton] =
    useState<boolean>(Boolean(savedBillingAddresses?.length))

  const { createCustomerAddress } = useCreateCustomerAddress()
  const { updateOrderBillingInfo } = useUpdateOrderBillingInfo()
  const handleSaveBilingAddressToAccount = async (contact: CrContact) => {
    const address = {
      contact: {
        ...contact,
        email: checkout?.email ?? (user?.emailAddress as string),
      },
    } as Address

    const params = buildAddressParams({
      accountId: user?.id as number,
      address,
      isDefaultAddress: false,
      addressType: AddressType.BILLING,
    })

    return createCustomerAddress.mutateAsync(params)
  }

  const handleSaveBillingAddressToCheckout = async ({ contact }: { contact: CrContact }) => {
    try {
      // Directly modify the properties of `contact`
      contact.phoneNumbers = {
        ...contact.phoneNumbers,
        work: contact?.phoneNumbers?.home, // Add work with the value of home
      }
      contact.address = {
        ...contact.address,
        addressType: 'Commercial', // Add addressType with value commercial
      }
      contact.email = checkout?.email || user?.emailAddress
      if (!allowInvalidAddresses && contact?.address?.countryCode === CountryCode.US) {
        await validateCustomerAddress.mutateAsync({
          addressValidationRequestInput: { address: contact?.address as CuAddress },
        })
      }

      if (isAddressSavedToAccount) {
        const customerSavedAddress = await handleSaveBilingAddressToAccount(contact)
        setSelectedBillingAddressId(customerSavedAddress?.id as number)
        handleValidateBillingAddress(customerSavedAddress)
      } else {
        setSelectedBillingAddressId((contact?.id as number) || DefaultId.ADDRESSID)
        handleValidateBillingAddress(contact as CuAddress)
      }
      setIsAddressSavedToAccount(false)
      setShouldShowAddBillingAddressButton(true)
      setIsNewAddressAdded(true)
      setValidateForm(false)
      setStepStatusIncomplete()
    } catch (error: any) {
      setValidateForm(false)
      console.error(error)
    }
  }

  const handleBilingAddressSelect = (addressId: string) => {
    const selectedAddress = savedBillingAddresses?.find(
      (address) => address?.id === Number(addressId)
    )
    if (selectedAddress?.id) {
      const contact: CrContact = {
        id: selectedAddress?.id,
        firstName: selectedAddress?.firstName || '',
        lastNameOrSurname: selectedAddress?.lastNameOrSurname || '',
        middleNameOrInitial: selectedAddress?.middleNameOrInitial || '',
        email: selectedAddress?.email || checkout?.email,
        address: {
          ...(selectedAddress?.address as any),
        },
        phoneNumbers: {
          ...(selectedAddress?.phoneNumbers as any),
        },
      }

      handleSaveBillingAddressToCheckout({ contact: { ...contact, email: checkout?.email } })
      handleBillingFormValidDetails(true)
      handleBillingFormAddress({
        contact: { ...contact, email: checkout?.email } as ContactForm,
        isSameBillingShippingAddress: false,
        isDataUpdated: true,
      })
    }
  }

  const handleAddNewBillingAddress = () => {
    setValidateForm(false)
    setShouldShowAddBillingAddressButton(false)
    setIsNewAddressAdded(false)
    setSelectedBillingAddressId(0)
    setBillingFormAddress({
      contact: { ...initialBillingAddressData?.contact, email: checkout?.email } as ContactForm,
      isSameBillingShippingAddress: false,
      isAddressValid: false,
    })
  }

  useEffect(() => {
    setSavedBillingAddresses(
      userGetters.getAllShippingAddresses(
        checkoutBillingContact,
        savedBillingAddresses as CustomerContact[]
      )
    )
  }, [
    JSON.stringify(checkoutBillingContact),
    JSON.stringify(savedBillingAddresses),
    isNewAddressAdded,
  ])

  useEffect(() => {
    if (isAuthenticated) {
      setIsAddressSavedToAccount(true)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (selectedPaymentTypeRadio === PaymentType.CREDITCARD) {
      handleInitialCardDetailsLoad()
    }
  }, [selectedPaymentTypeRadio])

  // when payment card and billing address info is available, handleTokenization
  useEffect(() => {
    if (
      (cardFormDetails.isDataUpdated || purchaseOrderFormDetails.isPurchaseOrderFormValidated) &&
      billingFormAddress.isDataUpdated
    ) {
      handleValidateBillingAddress({ ...billingFormAddress.contact.address })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cardFormDetails.isDataUpdated,
    billingFormAddress.isDataUpdated,
    purchaseOrderFormDetails.isPurchaseOrderFormValidated,
    isAddressFormValid,
    purchaseOrderFormDetails?.customFields?.length,
    validateForm,
  ])

  useEffect(() => {
    if (selectedPaymentTypeRadio === PaymentType.CREDITCARD) {
      if (isAddingNewPayment || (!isCVVAddedForNewPayment && !isCvvValid)) setStepStatusIncomplete()
      else setStepStatusValid()
    } else if (selectedPaymentTypeRadio === PaymentType.PURCHASEORDER) {
      if (isAddingNewPayment || !savedPaymentBillingDetailsForPurchaseOrder)
        setStepStatusIncomplete()
      else setStepStatusValid()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isCvvValid,
    isAddingNewPayment,
    savedPaymentBillingDetailsForPurchaseOrder,
    selectedPaymentTypeRadio,
  ])

  useEffect(() => {
    if (stepStatus === STEP_STATUS.SUBMIT) {
      if (reCaptchaKey) {
        submitFormWithRecaptcha()
      } else {
        handlePayment()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepStatus])

  const isAddPaymentMethodButtonDisabled = () => {
    return !(
      billingFormAddress.isAddressValid &&
      (cardFormDetails.isCardDetailsValidated ||
        purchaseOrderFormDetails.isPurchaseOrderFormValidated)
    )
  }
  const uniqueCards = cardOptions.filter(
    (card, index, self) => index === self.findIndex((c) => c?.cardInfo?.id === card?.cardInfo?.id)
  )

  return (
    <Stack data-testid="checkout-payment">
      <Typography
        variant="h2"
        component="h2"
        sx={{ fontWeight: '500', pb: 3, color: 'primary.main' }}
      >
        {t('payment-method')}
      </Typography>

      <FormControl>
        <TabContext value={selectedPaymentTypeRadio}>
          <TabList
            onChange={(_, value: string) => handlePaymentTypeRadioChange(value)}
            aria-labelledby="payment-types-tab"
            aria-label="payment-types"
            data-testid="payment-types"
            TabIndicatorProps={{
              sx: {
                borderRadius: 2,
                bottom: 0,
                top: 0,
                left: 0,
                height: 'auto',
                background: 'transparent',
                border: '3px solid #30299A',
                borderBottom: 'none',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                transition: 'all 0ms linear',
              },
            }}
          >
            <Tab
              label={t('credit-card')}
              value={PaymentType.CREDITCARD}
              icon={<CreditCardIcon />}
              iconPosition="start"
              color={'primary.main'}
              sx={{
                maxWidth: '50%',
                width: '100%',
                color: '#30299A',
                borderBottom:
                  selectedPaymentTypeRadio !== PaymentType.CREDITCARD
                    ? '3px solid #30299A'
                    : '3px solid #ffffff',
              }}
            />
            <Tab
              label={
                find(
                  newPaymentTypes,
                  (paymentType: PaymentsType) => paymentType?.id === PaymentType.PURCHASEORDER
                )?.name
              }
              value={PaymentType.PURCHASEORDER}
              icon={customerPurchaseOrderAccount?.isEnabled ? <RequestQuoteOutlinedIcon /> : <></>}
              iconPosition="start"
              color={'primary.main'}
              disabled={!customerPurchaseOrderAccount?.isEnabled}
              sx={{
                maxWidth: '50%',
                width: '100%',
                color: '#30299A',
                borderBottom:
                  selectedPaymentTypeRadio !== PaymentType.PURCHASEORDER
                    ? '3px solid #30299A'
                    : '3px solid #ffffff',
              }}
            />
          </TabList>

          {newPaymentTypes.map((paymentType: PaymentsType) => {
            return (
              <Box key={paymentType.id}>
                {paymentType.id === selectedPaymentTypeRadio ? (
                  <Box sx={{ maxWidth: '100%', mb: 1, pl: 0 }}>
                    {shouldShowPreviouslySavedCards ? (
                      <Stack gap={2} width="100%" data-testid="saved-payment-methods">
                        {cardOptions?.length ? (
                          <>
                            <KiboRadio
                              boxSx={{ p: 2 }}
                              sx={{ width: '100% !important' }}
                              radioOptions={uniqueCards?.map((card) => {
                                const address = addressGetters.getAddress(
                                  card?.billingAddressInfo?.contact.address as CrAddress
                                )
                                return {
                                  sx: { width: '100%' },
                                  value: cardGetters.getCardId(card?.cardInfo),
                                  name: cardGetters.getCardId(card?.cardInfo),
                                  label: (
                                    <>
                                      <PaymentBillingCard
                                        showAddress={selectedCardRadio === card?.cardInfo?.id}
                                        pageType={PageType.CHECKOUT}
                                        cardNumberPart={cardGetters.getCardNumberPart(
                                          card?.cardInfo
                                        )}
                                        expireMonth={cardGetters.getExpireMonth(card?.cardInfo)}
                                        expireYear={cardGetters.getExpireYear(card?.cardInfo)}
                                        paymentType={cardGetters.getPaymentType(card?.cardInfo)}
                                        cardType={cardGetters
                                          .getCardType(card?.cardInfo)
                                          ?.toUpperCase()}
                                        firstName={
                                          card?.billingAddressInfo?.contact?.firstName as string
                                        }
                                        lastNameOrSurname={
                                          card?.billingAddressInfo?.contact
                                            ?.lastNameOrSurname as string
                                        }
                                        companyOrOrganization={
                                          card?.billingAddressInfo?.contact
                                            ?.companyOrOrganization as string
                                        }
                                        address1={addressGetters.getAddress1(address)}
                                        address2={addressGetters.getAddress2(address)}
                                        cityOrTown={addressGetters.getCityOrTown(address)}
                                        postalOrZipCode={addressGetters.getPostalOrZipCode(address)}
                                        stateOrProvince={addressGetters.getStateOrProvince(address)}
                                        countryCode={addressGetters.getCountryCode(address)}
                                      />
                                      {selectedCardRadio === card?.cardInfo?.id &&
                                        !isCVVAddedForNewPayment && (
                                          <Box pt={2} width={'50%'}>
                                            <FormControl sx={{ width: '50%' }}>
                                              <Controller
                                                name="cvv"
                                                control={control}
                                                defaultValue={defaultCvv?.cvv}
                                                render={({ field }) => {
                                                  return (
                                                    <KiboTextBox
                                                      sx={{ background: '#ffffff' }}
                                                      type="password"
                                                      value={field.value || ''}
                                                      label={t('cvv-code')}
                                                      placeholder={t('security-code-placeholder')}
                                                      required={true}
                                                      onChange={(_, value) => {
                                                        field.onChange(value)
                                                        setCvv(value)
                                                      }}
                                                      onBlur={field.onBlur}
                                                      error={!!errors?.cvv}
                                                      helperText={
                                                        errors?.cvv?.message as unknown as string
                                                      }
                                                      icon={
                                                        <Box
                                                          pr={1}
                                                          pt={1}
                                                          sx={{ cursor: 'pointer' }}
                                                        >
                                                          <Tooltip
                                                            title={t('cvv-tooltip-text')}
                                                            placement="top"
                                                          >
                                                            <Help color="disabled" />
                                                          </Tooltip>
                                                        </Box>
                                                      }
                                                    />
                                                  )
                                                }}
                                              />
                                            </FormControl>
                                          </Box>
                                        )}
                                    </>
                                  ),
                                }
                              })}
                              selected={selectedCardRadio}
                              align="flex-start"
                              onChange={handleRadioSavedCardSelection}
                            />
                          </>
                        ) : (
                          <Typography variant="subtitle2">
                            {t('no-previously-saved-payment-methods')}
                          </Typography>
                        )}
                      </Stack>
                    ) : null}
                    {shouldShowPreviouslySavedPaymentsForPurchaseOrder ? (
                      <Stack gap={2} width="100%" data-testid="saved-payment-methods">
                        {savedPaymentBillingDetailsForPurchaseOrder ? (
                          <Box pl={2}>
                            <PaymentBillingCard
                              poCustomFields={
                                savedPaymentBillingDetailsForPurchaseOrder?.purchaseOrder
                                  ?.customFields as CrPurchaseOrderCustomField[]
                              }
                              purchaseOrderNumber={
                                savedPaymentBillingDetailsForPurchaseOrder?.purchaseOrder
                                  ?.purchaseOrderNumber as string
                              }
                              paymentTerm={
                                savedPaymentBillingDetailsForPurchaseOrder?.purchaseOrder
                                  ?.paymentTerm as CrPurchaseOrderPaymentTerm
                              }
                              address1={addressGetters.getAddress1(
                                savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo
                                  ?.contact.address as CrAddress
                              )}
                              address2={addressGetters.getAddress2(
                                savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo
                                  ?.contact.address as CrAddress
                              )}
                              cityOrTown={addressGetters.getCityOrTown(
                                savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo
                                  ?.contact.address as CrAddress
                              )}
                              postalOrZipCode={addressGetters.getPostalOrZipCode(
                                savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo
                                  ?.contact.address as CrAddress
                              )}
                              stateOrProvince={addressGetters.getStateOrProvince(
                                savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo
                                  ?.contact.address as CrAddress
                              )}
                              countryCode={addressGetters.getCountryCode(
                                savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo
                                  ?.contact.address as CrAddress
                              )}
                              paymentType={PaymentType.PURCHASEORDER}
                            />
                          </Box>
                        ) : (
                          <Typography variant="subtitle2">
                            {t('no-previously-saved-payment-methods')}
                          </Typography>
                        )}
                      </Stack>
                    ) : null}
                    {shouldShowCardForm ? (
                      <>
                        <StyledHeadings
                          variant="h3"
                          sx={{ fontWeight: '500', pb: 1.5, pt: 2, pl: 0, color: 'primary.main' }}
                        >
                          {t('add-new-credit-card')}
                        </StyledHeadings>
                        <Box sx={{ maxWidth: '24rem', pl: 0 }}>
                          <CardDetailsForm
                            validateForm={validateForm}
                            onSaveCardData={handleCardFormData}
                            onFormStatusChange={handleCardFormValidDetails}
                          />

                          {isAuthenticated ? (
                            <FormControlLabel
                              sx={{
                                width: '100%',
                                paddingLeft: 0,
                                marginLeft: 0,
                              }}
                              control={
                                <Checkbox
                                  sx={{ pl: 0, ml: 0 }}
                                  onChange={handleSavePaymentMethodCheckbox}
                                  data-testid="save-payment"
                                />
                              }
                              label={
                                <Typography variant="body2">{`${t(
                                  'save-payment-method-checkbox'
                                )}`}</Typography>
                              }
                            />
                          ) : null}
                        </Box>
                      </>
                    ) : null}
                    {shouldShowPurchaseOrderForm ? (
                      <PurchaseOrderForm
                        customFields={
                          savedPaymentBillingDetailsForPurchaseOrder?.purchaseOrder
                            ?.customFields as CrPurchaseOrderCustomField[]
                        }
                        purchaseOrderNumber={
                          savedPaymentBillingDetailsForPurchaseOrder?.purchaseOrder
                            ?.purchaseOrderNumber as string
                        }
                        creditLimit={creditLimit}
                        availableBalance={availableBalance}
                        validateForm={validateForm}
                        purchaseOrderPaymentTerms={customerPurchaseOrderPaymentTerms}
                        onSavePurchaseData={handlePurchaseOrderFormData}
                        onFormStatusChange={handlePurchaseOrderFormValidDetails}
                      />
                    ) : null}

                    {shouldShowBillingAddressForm ? (
                      <>
                        <StyledHeadings
                          variant="h3"
                          sx={{ fontWeight: '500', pb: 1.5, pt: 2, pl: 0, color: 'primary.main' }}
                        >
                          {t('billing-address')}
                        </StyledHeadings>
                        {showBillingSameAsShippingAddressCheckbox() && (
                          <FormControlLabel
                            sx={{
                              width: '100%',
                              paddingLeft: 0,
                              marginLeft: 0,
                            }}
                            control={
                              <Checkbox
                                sx={{ pl: 0, ml: 0 }}
                                name={`${t('billing-address-same-as-shipping')}`}
                                checked={
                                  selectedBillingAddressId > 0 ||
                                  !billingFormAddress?.isSameBillingShippingAddress
                                    ? false
                                    : true
                                }
                              />
                            }
                            label={
                              <Typography variant="body2">{`${t(
                                'billing-address-same-as-shipping'
                              )}`}</Typography>
                            }
                            onChange={(_, value) => handleSameAsShippingAddressCheckbox(value)}
                          />
                        )}

                        {/**
                         * Show saved billing Address and add new address
                         */}
                        {previouslySavedBillingAddress?.length &&
                          shouldShowAddBillingAddressButton && (
                            <>
                              <KiboRadio
                                radioOptions={previouslySavedBillingAddress
                                  .filter((savedAddress) => {
                                    if (savedAddress?.id && savedAddress?.id > 0)
                                      return savedAddress
                                  })
                                  ?.map((address, index) => {
                                    return {
                                      value: String(address.id),
                                      name: String(address.id),
                                      label: (
                                        <AddressCard
                                          key={`billing-address-${index}`}
                                          firstName={address?.firstName as string}
                                          middleNameOrInitial={
                                            address?.middleNameOrInitial as string
                                          }
                                          lastNameOrSurname={address?.lastNameOrSurname as string}
                                          companyOrOrganization={addressGetters.getCompanyOrOrganization(
                                            address
                                          )}
                                          address1={address?.address?.address1 as string}
                                          address2={address?.address?.address2 as string}
                                          cityOrTown={address?.address?.cityOrTown as string}
                                          stateOrProvince={
                                            address?.address?.stateOrProvince as string
                                          }
                                          postalOrZipCode={
                                            address?.address?.postalOrZipCode as string
                                          }
                                          countryCode={address?.address?.countryCode as string}
                                          variant="body2"
                                        />
                                      ),
                                    }
                                  })}
                                selected={selectedBillingAddressId?.toString()}
                                align="flex-start"
                                addressCheckout={true}
                                onChange={handleBilingAddressSelect}
                              />
                              <NoSsr>
                                {hasPermission(actions.CREATE_CONTACTS) &&
                                  shouldShowAddBillingAddressButton && (
                                    <Box>
                                      <Button
                                        sx={{
                                          mt: 2,
                                          padding: '12px 19px',
                                          ...StandardShippingStepStyle.secondaryButton,
                                        }}
                                        onClick={handleAddNewBillingAddress}
                                      >
                                        <Typography
                                          sx={{
                                            fontSize: '1rem',
                                            lineHeight: '1.5rem',
                                            fontWeight: '400',
                                          }}
                                        >
                                          {t('add-new-address')}
                                        </Typography>
                                      </Button>
                                    </Box>
                                  )}
                              </NoSsr>
                            </>
                          )}

                        {!shouldShowAddBillingAddressButton && (
                          <>
                            <AddressForm
                              key={selectedPaymentTypeRadio}
                              contact={billingFormAddress.contact}
                              saveAddressLabel={
                                selectedBillingAddressId === 0 ||
                                !billingFormAddress?.isSameBillingShippingAddress
                                  ? t('save-billing-address')
                                  : undefined
                              }
                              setAutoFocus={false}
                              isUserLoggedIn={isAuthenticated}
                              onSaveAddress={handleBillingFormAddress}
                              validateForm={validateForm}
                              onFormStatusChange={handleBillingFormValidDetails}
                            />

                            <Box m={1} maxWidth={'872px'} data-testid="address-form">
                              <Divider sx={{ marginBottom: '20px' }} flexItem />
                              <Grid container>
                                <Grid
                                  item
                                  xs={12}
                                  gap={2}
                                  display={'flex'}
                                  direction={'row'}
                                  sx={{ justifyContent: 'space-between' }}
                                >
                                  <Button
                                    sx={{
                                      padding: '12px 38px',
                                      ...StandardShippingStepStyle.secondaryButton,
                                    }}
                                    onClick={() => {
                                      setShouldShowAddBillingAddressButton(true)
                                      setSelectedBillingAddressId(
                                        (checkoutBillingContact?.id ||
                                          defaultBillingAddress?.id) as number
                                      )
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: '1rem',
                                        lineHeight: '1.5rem',
                                        fontWeight: '400',
                                      }}
                                    >
                                      {t('cancel')}
                                    </Typography>
                                  </Button>
                                  {/* <Button
                                    sx={{
                                      ...StandardShippingStepStyle.primaryButton,
                                      ':disabled': {
                                        backgroundColor: 'grey.600',
                                        borderColor: 'grey.600', // Change the background color when disabled
                                        color: 'white', // Change the text color when disabled
                                        cursor: 'not-allowed', // Optional: Indicate the button is not clickable
                                      },
                                    }}
                                    onClick={handleSaveNewPaymentMethod}
                                    {...(!isAddressFormValid && { disabled: true })}
                                  >
                                    <Typography sx={{ fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '400' }}>
                                      {t('continue')}
                                    </Typography>
                                  </Button> */}
                                </Grid>
                              </Grid>
                            </Box>
                          </>
                        )}

                        <Divider orientation="horizontal" flexItem sx={{ mt: 2 }} />
                        <Stack
                          pl={0}
                          gap={2}
                          mt={2}
                          sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={cancelAddingNewPaymentMethod}
                            sx={{
                              width: '180px',
                              background: 'transparent',
                              color: 'primary.main',
                              border: '1px solid primary.main',
                              borderTopRightRadius: 26,
                              borderBottomLeftRadius: 26,
                              fontSize: '1rem',
                              padding: '12px 18px',
                              lineHeight: 1.4,
                              '&:hover': {
                                background: '#E3E2FF',
                                color: '#4C47C4',
                                border: '1px solid #E3E2FF',
                              },
                            }}
                          >
                            {t('cancel')}
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            {...(isAddPaymentMethodButtonDisabled() && { disabled: true })}
                            onClick={handleSaveNewPaymentMethod}
                            sx={{
                              width: 'auto',
                              background: 'primary.main',
                              color: '#ffffff',
                              border: 0,
                              borderTopRightRadius: 26,
                              borderBottomLeftRadius: 26,
                              fontSize: '1rem',
                              padding: '12px 16px',
                              lineHeight: 1.4,
                              '&:hover': {
                                fontSize: '1rem',
                                padding: '12px 16px',
                                background: '#4C47C4',
                                color: '#FFFFFF',
                                border: 0,
                              },
                            }}
                          >
                            {t('continue')}
                          </Button>
                        </Stack>
                      </>
                    ) : null}
                    {!(shouldShowPurchaseOrderForm || shouldShowCardForm) ? (
                      <Box pt={2}>
                        <Button
                          variant="contained"
                          color="inherit"
                          sx={{
                            width: 'auto',
                            background: 'transparent',
                            color: 'primary.main',
                            border: '1px solid primary.main',
                            borderTopRightRadius: 26,
                            borderBottomLeftRadius: 26,
                            fontSize: '1rem',
                            padding: '12px 16px',
                            lineHeight: 1.4,
                            '&:hover': {
                              background: '#E3E2FF',
                              color: '#4C47C4',
                              border: '1px solid #E3E2FF',
                            },
                          }}
                          onClick={handleAddPaymentMethod}
                        >
                          {t('add-new-card')}
                        </Button>
                      </Box>
                    ) : null}
                  </Box>
                ) : null}
              </Box>
            )
          })}
        </TabContext>
      </FormControl>
    </Stack>
  )
}

export default PaymentStep
