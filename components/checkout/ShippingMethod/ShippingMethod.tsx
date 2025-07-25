import { useEffect, useRef, useState } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import { Typography, Box, MenuItem, Divider } from '@mui/material'
import { filter, find } from 'lodash'
import { useTranslation } from 'next-i18next'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { KiboRadio, KiboSelect, KiboTextBox, Price, ProductItemList } from '@/components/common'
import {
  useCreateOrderAttribute,
  useGetCurrentCustomer,
  useGetStoreLocations,
  useUpdateCustomerProfile,
  useUpdateOrderAttributes,
} from '@/hooks'
import { orderGetters, storeLocationGetters } from '@/lib/getters'

import type { Maybe, CrOrderItem, CrShippingRate, CustomerAccount, CrOrder } from '@/lib/gql/types'

export type ShippingMethodProps = {
  checkout?: CrOrder
  shipItems?: Maybe<CrOrderItem>[]
  pickupItems?: Maybe<CrOrderItem>[]
  handlingAmount?: number
  orderShipmentMethods?: Maybe<CrShippingRate>[]
  selectedShippingMethodCode?: string
  showTitle?: boolean
  onShippingMethodChange?: (value: string, name?: string) => void
  onStoreLocatorClick?: () => void
}
export type ShipItemListProps = {
  checkout?: CrOrder
  shipItems: Maybe<CrOrderItem>[]
  handlingAmount?: number
  orderShipmentMethods?: Maybe<CrShippingRate>[]
  selectedShippingMethodCode?: string
  onShippingMethodChange?: (value: string, name?: string) => void
}
export type PickupItemListProps = {
  isShipItemsPresent: boolean
  pickupItems: Maybe<CrOrderItem>[]
  onClickChangeStore?: () => void
}
const styles = {
  shippingType: {
    variant: 'subtitle1',
    component: 'span',
    fontWeight: '600',
    color: 'text.primary',
  },
}

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

const ShipItemList = (shipProps: ShipItemListProps) => {
  const { checkout, orderShipmentMethods, selectedShippingMethodCode, onShippingMethodChange } =
    shipProps
  const { t } = useTranslation('common')

  const [isFedExMethodSelected, setIsFedExMethodSelected] = useState<boolean>(false)
  const [fedExAccountNumber, setFedExAccountNumber] = useState<string>()
  const [fedExAccountNumberInput, setFedExAccountNumberInput] = useState<string>()
  const [fedExAccountShippingMethod, setFedExAccountShippingMethod] = useState<CrShippingRate>()
  const [fedExAccountSelectedShippingMethodName, setFedExAccountSelectedShippingMethodName] =
    useState<string>()
  const [isFedExAccountUpdated, setIsFedExAccountUpdated] = useState<boolean>(false)
  const [isOtherShippingMethod, setIsOtherShippingMethod] = useState<boolean>(true)

  const [isFedexAccountMethodUpdated, setIsFedexAccountMethodUpdated] = useState<boolean>(false)
  const [localError, setLocalError] = useState('')

  const [isUpsMethodSelected, setIsUpsMethodSelected] = useState<boolean>(false)
  const [upsAccountNumber, setUpsAccountNumber] = useState<string>()
  const [upsAccountNumberInput, setUpsAccountNumberInput] = useState<string>()
  const [upsAccountShippingMethod, setUpsAccountShippingMethod] = useState<CrShippingRate>()
  const [upsAccountSelectedShippingMethodName, setUpsAccountSelectedShippingMethodName] =
    useState<string>()
  const [isUpsAccountUpdated, setIsUpsAccountUpdated] = useState<boolean>(false)
  const [localUpsError, setLocalUpsError] = useState('')

  const lastOrderAttrsRef = useRef({
    b2bAccountName: '',
    fedEx: '',
    ups: '',
  })

  const fedExSchema = useFedExSchema()

  const upsSchema = useUpsSchema()
  const {
    control: upsControl,
    formState: { errors: upsErrors },
  } = useForm({
    shouldUseNativeValidation: false,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver(upsSchema),
    shouldFocusError: true,
  })

  const selectShippingMethodRef = useRef<HTMLInputElement | null>(null)
  // Define Variables and States
  const {
    control,
    formState: { errors },
  } = useForm({
    shouldUseNativeValidation: false,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver(fedExSchema),
    shouldFocusError: true,
  })

  const { data: customerAccount } = useGetCurrentCustomer()
  const [fedexTrigger, setFedexTrigger] = useState(0)
  const [upsTrigger, setUpsTrigger] = useState(0)

  useEffect(() => {
    const fetchUpsSettings = async () => {
      const payload = {
        userId: customerAccount?.userId,
        accountId: customerAccount?.id,
        attributeFqn: 'tenant~customer-ups-account-number',
      }
      const entityResponse = await fetch('/api/user/getCustomerAttribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      })

      const attributeDetails = await entityResponse.json()
      setUpsAccountNumber(
        attributeDetails?.data?.values?.[0] ? attributeDetails?.data?.values?.[0] : ''
      )
    }
    fetchUpsSettings()
  }, [customerAccount?.id || customerAccount?.userId, upsTrigger])

  useEffect(() => {
    const fetchFedExSettings = async () => {
      const payload = {
        userId: customerAccount?.userId,
        accountId: customerAccount?.id,
        attributeFqn: 'tenant~customer-fedex-account-number',
      }
      const entityResponse = await fetch('/api/user/getCustomerAttribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      })

      const attributeDetails = await entityResponse.json()
      setFedExAccountNumber(
        attributeDetails?.data?.values?.[0] ? attributeDetails?.data?.values?.[0] : ''
      )
    }
    fetchFedExSettings()
  }, [customerAccount?.id || customerAccount?.userId, fedexTrigger])

  useEffect(() => {
    const fedExShippings = getFedExShippingMethods()
    const upsShippings = getUPSShippingMethods()
    const fortisShippings = getFortisShippingMethods()

    const selectedFortisMethod = find(
      fortisShippings,
      (fortisShip) => fortisShip?.shippingMethodCode === selectedShippingMethodCode
    )

    const selectedFedExMethod = find(
      fedExShippings,
      (fedExShip) => fedExShip?.shippingMethodCode === selectedShippingMethodCode
    )
    const selectedUpsMethod = find(
      upsShippings,
      (upsShip) => upsShip?.shippingMethodCode === selectedShippingMethodCode
    )

    if (selectedFortisMethod) {
      handleShippingMethodSelectChange(
        selectedFortisMethod?.shippingMethodName as string,
        selectedFortisMethod?.shippingMethodCode as string
      )
    } else if (
      fedExShippings &&
      selectedFedExMethod &&
      fedExAccountNumber &&
      fedExAccountNumber.length === 9
    ) {
      handleShippingMethodSelectChange(
        selectedFedExMethod?.shippingMethodName as string,
        selectedFedExMethod?.shippingMethodCode as string
      )
      setIsFedExMethodSelected(true)
      setIsUpsMethodSelected(false)
      setIsOtherShippingMethod(false)
    } else if (
      upsShippings &&
      selectedUpsMethod &&
      upsAccountNumber &&
      upsAccountNumber.length === 6
    ) {
      handleShippingMethodSelectChange(
        selectedUpsMethod?.shippingMethodName as string,
        selectedUpsMethod?.shippingMethodCode as string
      )
      setIsFedExMethodSelected(false)
      setIsUpsMethodSelected(true)
      setIsOtherShippingMethod(false)
    }
  }, [selectedShippingMethodCode, fedExAccountNumber, upsAccountNumber, t])

  useEffect(() => {
    if (customerAccount?.attributes?.length) {
      if (fedExAccountNumberInput) {
        setFedExAccountNumber(fedExAccountNumberInput)
      }

      if (upsAccountNumberInput) {
        setUpsAccountNumber(upsAccountNumberInput)
      }

      // Get FedEx account shipping method name
      const customerShippingMethodAttr = find(customerAccount?.attributes, {
        fullyQualifiedName: 'tenant~shipping-method',
      })
      const shippingMethodName = customerShippingMethodAttr?.values?.length
        ? customerShippingMethodAttr.values[0]
        : ''
      const shippingMethod = find(orderShipmentMethods, (shipMethod) =>
        shippingMethodName?.includes(shipMethod?.shippingMethodName)
      ) as CrShippingRate
      if (shippingMethod.shippingMethodName?.includes('FedEx Account')) {
        setFedExAccountShippingMethod(shippingMethod)
      } else if (shippingMethod.shippingMethodName?.includes('UPS Account')) {
        setUpsAccountShippingMethod(shippingMethod)
      }
    }
  }, [customerAccount?.attributes, orderShipmentMethods, t])

  useEffect(() => {
    if (fedExAccountShippingMethod?.shippingMethodName) {
      setFedExAccountSelectedShippingMethodName(
        `${fedExAccountShippingMethod?.shippingMethodName}` +
          ' ' +
          t('currency', { val: fedExAccountShippingMethod?.price })
      )
    }
  }, [fedExAccountShippingMethod])

  useEffect(() => {
    if (upsAccountShippingMethod?.shippingMethodName) {
      setUpsAccountSelectedShippingMethodName(
        `${upsAccountShippingMethod?.shippingMethodName}` +
          ' ' +
          t('currency', { val: upsAccountShippingMethod?.price })
      )
    }
  }, [upsAccountShippingMethod])

  useEffect(() => {
    if (
      isFedExMethodSelected &&
      !isFedExAccountUpdated &&
      fedExAccountNumber &&
      fedExAccountNumber?.length === 9 &&
      fedExAccountSelectedShippingMethodName &&
      customerAccount
    ) {
      setIsFedExAccountUpdated(true)
      handleFexExAccountShipping(
        customerAccount,
        fedExAccountNumber,
        fedExAccountSelectedShippingMethodName
      )
    }
  }, [
    customerAccount,
    fedExAccountNumber,
    fedExAccountSelectedShippingMethodName,
    isFedExAccountUpdated,
    isFedExMethodSelected,
  ])

  useEffect(() => {
    if (
      isUpsMethodSelected &&
      !isUpsAccountUpdated &&
      upsAccountNumber &&
      upsAccountNumber?.length === 6 &&
      customerAccount &&
      upsAccountSelectedShippingMethodName
    ) {
      setIsUpsAccountUpdated(true)
      handleUPSAccountShipping(
        customerAccount,
        upsAccountNumber,
        upsAccountSelectedShippingMethodName
      )
    }
  }, [
    customerAccount,
    isUpsAccountUpdated,
    isUpsMethodSelected,
    upsAccountNumber,
    upsAccountSelectedShippingMethodName,
  ])

  const previousFedExAccountNumber = useRef('')
  const previousUpsAccountNumber = useRef('')

  const handleShippingMethodChange = (value: string, name?: string) => {
    onShippingMethodChange && onShippingMethodChange(value, name)
    selectShippingMethodRef.current &&
      (selectShippingMethodRef.current as Element).scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
  }
  const handleShippingMethodSelectChange = (name: string, value: string) => {
    if (!name && !value) {
      onShippingMethodChange && onShippingMethodChange('', '')
      return
    }

    const shippingMethod = find(
      orderShipmentMethods,
      (shipMethod) => value === shipMethod?.shippingMethodCode
    ) as CrShippingRate
    if (!shippingMethod) {
      onShippingMethodChange && onShippingMethodChange('', '')
      return
    }
    onShippingMethodChange && onShippingMethodChange(value, name)
    if (shippingMethod?.shippingMethodName?.includes('FedEx Account')) {
      setFedExAccountShippingMethod(shippingMethod)
    } else if (shippingMethod?.shippingMethodName?.includes('UPS Account')) {
      setUpsAccountShippingMethod(shippingMethod)
    }
    if (name !== '' && value !== '') {
      if (name.includes('FedEx Account')) {
        setIsFedexAccountMethodUpdated(true)
      } else if (name.includes('UPS Account')) {
        setIsUpsAccountUpdated(true)
      } else {
        setIsFedexAccountMethodUpdated(false)
        setIsUpsAccountUpdated(false)
      }
    } else {
      setIsFedexAccountMethodUpdated(false)
      setIsUpsAccountUpdated(false)
    }
  }

  const getFortisShippingMethods = () => {
    const fortisShippingMethods = filter(orderShipmentMethods, (shippingMethod: CrShippingRate) => {
      return (
        shippingMethod?.shippingMethodName &&
        !shippingMethod.shippingMethodName.includes('FedEx Account') &&
        !shippingMethod.shippingMethodName.includes('UPS Account')
      )
    }) as CrShippingRate[]
    return fortisShippingMethods
  }
  const getFedExShippingMethods = () => {
    const fedExShippingMethods = filter(orderShipmentMethods, (shippingMethod: CrShippingRate) => {
      if (shippingMethod?.shippingMethodName?.includes('FedEx Account')) {
        return shippingMethod
      }
    }) as CrShippingRate[]
    return fedExShippingMethods
  }
  const getUPSShippingMethods = () => {
    const upsShippingMethods = filter(orderShipmentMethods, (shippingMethod: CrShippingRate) => {
      if (shippingMethod?.shippingMethodName?.includes('UPS Account')) {
        return shippingMethod
      }
    }) as CrShippingRate[]
    return upsShippingMethods
  }

  // Save FedEx/UPS account into customer attributes and Order Attributes
  const { updateUserData } = useUpdateCustomerProfile()
  const { createOrderAttributes } = useCreateOrderAttribute()
  const { updateOrderAttributes } = useUpdateOrderAttributes()

  const upsertOrderAttribute = async (orderId: string, fqn: string, value: string) => {
    const attr = find(checkout?.attributes, (a) => a?.fullyQualifiedName === fqn)
    if (attr) {
      // Update if exists
      await updateOrderAttributes.mutateAsync({
        orderId,
        orderAttributeInput: [
          {
            fullyQualifiedName: fqn,
            values: value ? [value] : [],
          },
        ],
      })
    } else if (value) {
      // Create if not exists and value is not empty
      await createOrderAttributes.mutateAsync({
        orderId,
        orderAttributeInput: [
          {
            fullyQualifiedName: fqn,
            values: [value],
          },
        ],
      })
    }
  }
  useEffect(() => {
    if (!checkout) return

    // B2B Account Name
    if (
      customerAccount?.companyOrOrganization &&
      lastOrderAttrsRef.current.b2bAccountName !== customerAccount.companyOrOrganization
    ) {
      lastOrderAttrsRef.current.b2bAccountName = customerAccount.companyOrOrganization
      upsertOrderAttribute(
        checkout.id as string,
        'tenant~b2bAccountName',
        customerAccount.companyOrOrganization
      )
    }

    // Shipping method attributes
    if (isOtherShippingMethod) {
      if (lastOrderAttrsRef.current.fedEx !== '') {
        lastOrderAttrsRef.current.fedEx = ''
        upsertOrderAttribute(checkout.id as string, 'tenant~customerFedexAccountNumber', '')
      }
      if (lastOrderAttrsRef.current.ups !== '') {
        lastOrderAttrsRef.current.ups = ''
        upsertOrderAttribute(checkout.id as string, 'tenant~customerUpsAccountNumber', '')
      }
    } else if (isFedExMethodSelected && fedExAccountNumber && fedExAccountNumber.length === 9) {
      if (lastOrderAttrsRef.current.fedEx !== fedExAccountNumber) {
        lastOrderAttrsRef.current.fedEx = fedExAccountNumber
        upsertOrderAttribute(
          checkout.id as string,
          'tenant~customerFedexAccountNumber',
          fedExAccountNumber
        )
      }
      if (lastOrderAttrsRef.current.ups !== '') {
        lastOrderAttrsRef.current.ups = ''
        upsertOrderAttribute(checkout.id as string, 'tenant~customerUpsAccountNumber', '')
      }
    } else if (isUpsMethodSelected && upsAccountNumber && upsAccountNumber.length === 6) {
      if (lastOrderAttrsRef.current.ups !== upsAccountNumber) {
        lastOrderAttrsRef.current.ups = upsAccountNumber
        upsertOrderAttribute(
          checkout.id as string,
          'tenant~customerUpsAccountNumber',
          upsAccountNumber
        )
      }
      if (lastOrderAttrsRef.current.fedEx !== '') {
        lastOrderAttrsRef.current.fedEx = ''
        upsertOrderAttribute(checkout.id as string, 'tenant~customerFedexAccountNumber', '')
      }
    }
  }, [
    customerAccount?.companyOrOrganization,
    fedExAccountNumber,
    upsAccountNumber,
    isOtherShippingMethod,
    isFedExMethodSelected,
    isUpsMethodSelected,
    checkout,
  ])

  const handleFexExAccountShipping = async (
    customerAccount: CustomerAccount,
    fedExAccountNumber: string,
    fedExShippingMethodName: string
  ) => {
    try {
      // Update customer attributes for FedEx
      const updatedCustomerAccountAttributes = customerAccount?.attributes?.length
        ? customerAccount?.attributes?.map((attribute) => {
            if (attribute?.fullyQualifiedName === 'tenant~customer-fedex-account-number') {
              attribute.values = [fedExAccountNumber]
            } else if (attribute?.fullyQualifiedName === 'tenant~shipping-method') {
              attribute.values = [fedExShippingMethodName]
            }
            return attribute
          })
        : [
            {
              fullyQualifiedName: 'tenant~customer-fedex-account-number',
              values: [fedExAccountNumber],
            },
            {
              fullyQualifiedName: 'tenant~shipping-method',
              values: [fedExShippingMethodName],
            },
          ]

      if (
        !find(updatedCustomerAccountAttributes, {
          fullyQualifiedName: 'tenant~customer-fedex-account-number',
        }) &&
        fedExAccountNumber &&
        fedExAccountNumber.length === 9
      ) {
        updatedCustomerAccountAttributes.push({
          fullyQualifiedName: 'tenant~customer-fedex-account-number',
          values: [fedExAccountNumber],
        })
      }

      if (
        !find(updatedCustomerAccountAttributes, { fullyQualifiedName: 'tenant~shipping-method' }) &&
        fedExShippingMethodName
      ) {
        updatedCustomerAccountAttributes.push({
          fullyQualifiedName: 'tenant~shipping-method',
          values: [fedExShippingMethodName],
        })
      }

      await updateUserData.mutateAsync({
        accountId: customerAccount.id,
        customerAccountInput: {
          ...customerAccount,
          attributes: updatedCustomerAccountAttributes,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleUPSAccountShipping = async (
    customerAccount: CustomerAccount,
    upsAccountNumber: string,
    upsShippingMethodName: string
  ) => {
    try {
      // Update customer attributes for UPS
      const updatedCustomerAccountAttributes = customerAccount?.attributes?.length
        ? customerAccount?.attributes?.map((attribute) => {
            if (attribute?.fullyQualifiedName === 'tenant~customer-ups-account-number') {
              attribute.values = [upsAccountNumber]
            } else if (attribute?.fullyQualifiedName === 'tenant~shipping-method') {
              attribute.values = [upsShippingMethodName]
            }
            return attribute
          })
        : [
            {
              fullyQualifiedName: 'tenant~customer-ups-account-number',
              values: [upsAccountNumber],
            },
            {
              fullyQualifiedName: 'tenant~shipping-method',
              values: [upsShippingMethodName],
            },
          ]

      if (
        !find(updatedCustomerAccountAttributes, {
          fullyQualifiedName: 'tenant~customer-ups-account-number',
        }) &&
        upsAccountNumber &&
        upsAccountNumber.length === 6
      ) {
        updatedCustomerAccountAttributes.push({
          fullyQualifiedName: 'tenant~customer-ups-account-number',
          values: [upsAccountNumber],
        })
      }

      if (
        !find(updatedCustomerAccountAttributes, { fullyQualifiedName: 'tenant~shipping-method' }) &&
        upsShippingMethodName
      ) {
        updatedCustomerAccountAttributes.push({
          fullyQualifiedName: 'tenant~shipping-method',
          values: [upsShippingMethodName],
        })
      }

      await updateUserData.mutateAsync({
        accountId: customerAccount.id,
        customerAccountInput: {
          ...customerAccount,
          attributes: updatedCustomerAccountAttributes,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }

  const selectShippingMethod = (method: 'fortis' | 'fedex' | 'ups') => {
    if (method === 'fortis') {
      setIsOtherShippingMethod(true)
      setIsFedExMethodSelected(false)
      setIsUpsMethodSelected(false)
      setIsFedExAccountUpdated(true)
      setIsUpsAccountUpdated(true)
    } else if (method === 'fedex') {
      setIsFedExMethodSelected(true)
      setIsOtherShippingMethod(false)
      setIsUpsMethodSelected(false)
      setIsFedExAccountUpdated(false)
      setIsUpsAccountUpdated(false)
      // Only select if valid
      if (fedExAccountNumber && fedExAccountNumber.length === 9) {
        const fedex = getFedExShippingMethods()?.[0]
        if (fedex) {
          handleShippingMethodSelectChange(
            fedex.shippingMethodName as string,
            fedex.shippingMethodCode as string
          )
        }
      } else {
        handleShippingMethodSelectChange('', '')
      }
    } else if (method === 'ups') {
      setIsUpsMethodSelected(true)
      setIsFedExMethodSelected(false)
      setIsOtherShippingMethod(false)
      setIsUpsAccountUpdated(false)
      setIsFedExAccountUpdated(false)
      // Only select if valid
      if (upsAccountNumber && upsAccountNumber.length === 6) {
        const ups = getUPSShippingMethods()?.[0]
        if (ups) {
          handleShippingMethodSelectChange(
            ups.shippingMethodName as string,
            ups.shippingMethodCode as string
          )
        }
      } else {
        handleShippingMethodSelectChange('', '')
      }
    }
  }

  return (
    <Box data-testid="ship-items">
      <Box mt={2}>
        <Box
          m={0}
          sx={{
            display: 'grid',
            borderRadius: '5px',
            marginBottom: '10px',
            '&:hover': { borderRadius: '5px', backgroundColor: '#E3E2FF' },
          }}
        >
          {/* Normal Shipping method */}
          <KiboRadio
            radioOptions={
              getFortisShippingMethods()?.map((item) => ({
                value: item?.shippingMethodCode as string,
                name: item?.shippingMethodName as string,
                label: (
                  <MenuItem
                    key={item?.shippingMethodCode}
                    value={`${item?.shippingMethodCode}`}
                    sx={{ mt: 0.25, background: 'none', '&:hover': { background: 'none' } }}
                  >
                    <Price
                      variant="body2"
                      fontWeight="normal"
                      price={`${t('fortis-shipping')} (${item?.shippingMethodName})`}
                    />
                  </MenuItem>
                ),
              })) ?? []
            }
            selected={
              isOtherShippingMethod && selectedShippingMethodCode ? selectedShippingMethodCode : ''
            }
            align="flex-start"
            onChange={(value) => {
              selectShippingMethod('fortis')
              handleShippingMethodChange(value)
            }}
            sx={{
              borderRadius: 1,
              my: 1,
              ml: 0,
              pl: 1.5,
              width: '100%',
            }}
          />
        </Box>
        {/* Only show Customer FedEx Shipping method if there are FedEx shipping methods available */}
        {getFedExShippingMethods()?.length > 0 && (
          <Box
            m={0}
            py={0.5}
            sx={{
              display: 'grid',
              backgroundColor: isFedExMethodSelected ? '#E3E2FF' : 'initial',
              '&:hover': { backgroundColor: '#E3E2FF', borderRadius: '5px' },
              borderRadius: '5px',
            }}
          >
            {/* Customer FedEx Shipping method */}
            <KiboRadio
              radioOptions={[
                {
                  value: 'fedExAccount',
                  name: 'Use Customer FedEx Account',
                  label: (
                    <MenuItem
                      key={'fedExAccount'}
                      value={'fedExAccount'}
                      sx={{
                        mt: 0.25,
                        width: '100%',
                        backgroundColor: 'none',
                        '&:hover': { background: 'none' },
                      }}
                    >
                      <Price variant="body2" fontWeight="normal" price={'Customer FedEx Account'} />
                    </MenuItem>
                  ),
                },
              ]}
              selected={isFedExMethodSelected ? 'fedExAccount' : ''}
              align="flex-start"
              onChange={() => selectShippingMethod('fedex')}
              sx={{ ml: 1.5 }}
            />
            {isFedExMethodSelected && (
              <Box
                ml={8.5}
                mr={4}
                mb={2}
                sx={{ backgroundColor: isFedExMethodSelected ? '#E3E2FF' : 'initial' }}
              >
                <Controller
                  name="fedExAccountNumber"
                  control={control}
                  defaultValue={fedExAccountNumber}
                  render={({ field }) => (
                    <KiboTextBox
                      value={field.value ?? fedExAccountNumber}
                      label={'FedEx Account Number'}
                      ref={null}
                      error={!!localError}
                      helperText={localError}
                      onChange={(_name: string, value: string) => {
                        // Allow only digits and ensure the length doesn't exceed 9 characters
                        const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 9)
                        field.onChange(sanitizedValue)
                        setFedExAccountNumberInput(sanitizedValue)
                        setFedExAccountNumber(sanitizedValue)

                        if (
                          sanitizedValue == '' ||
                          sanitizedValue.length === 0 ||
                          sanitizedValue.length < 9
                        ) {
                          setLocalError(t('this-field-is-min-max-length')) // error message
                          if (isFedexAccountMethodUpdated) {
                            handleShippingMethodSelectChange('', '')
                          }
                        } else {
                          setLocalError('') // Clear error message if valid
                          handleShippingMethodSelectChange(
                            getFedExShippingMethods()?.[0]?.shippingMethodName as string,
                            getFedExShippingMethods()?.[0]?.shippingMethodCode as string
                          )
                        }
                        setIsFedExAccountUpdated(false)
                      }}
                      onBlur={field.onBlur}
                      required={true}
                      sx={{ background: '#ffffff' }}
                    />
                  )}
                />
                {/* <KiboSelect ... */}
              </Box>
            )}
          </Box>
        )}

        {/* Only show Customer UPS Shipping method if there are UPS shipping methods available */}
        {getUPSShippingMethods()?.length > 0 && (
          <Box
            m={0}
            py={0.5}
            sx={{
              display: 'grid',
              backgroundColor: isUpsMethodSelected ? '#E3E2FF' : 'initial',
              '&:hover': { backgroundColor: '#E3E2FF', borderRadius: '5px' },
              borderRadius: '5px',
              marginTop: '10px',
            }}
          >
            {/* Customer UPS Shipping method */}
            <KiboRadio
              radioOptions={[
                {
                  value: 'upsAccount',
                  name: 'Use Customer UPS Account',
                  label: (
                    <MenuItem
                      key={'upsAccount'}
                      value={'upsAccount'}
                      sx={{
                        mt: 0.25,
                        width: '100%',
                        backgroundColor: 'none',
                        '&:hover': { background: 'none' },
                      }}
                    >
                      <Price variant="body2" fontWeight="normal" price={'Customer UPS Account'} />
                    </MenuItem>
                  ),
                },
              ]}
              selected={isUpsMethodSelected ? 'upsAccount' : ''}
              align="flex-start"
              onChange={() => selectShippingMethod('ups')}
              sx={{ ml: 1.5 }}
            />
            {isUpsMethodSelected && (
              <Box
                ml={8.5}
                mr={4}
                mb={2}
                sx={{ backgroundColor: isUpsMethodSelected ? '#E3E2FF' : 'initial' }}
              >
                <Controller
                  name="upsAccountNumber"
                  control={upsControl}
                  defaultValue={upsAccountNumber}
                  render={({ field }) => (
                    <KiboTextBox
                      value={field.value ?? upsAccountNumber}
                      label={'UPS Account Number'}
                      ref={null}
                      error={!!localUpsError}
                      helperText={localUpsError}
                      onChange={(_name: string, value: string) => {
                        // Allow only alphanumeric and max 6 chars
                        const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)
                        field.onChange(sanitizedValue)
                        setUpsAccountNumberInput(sanitizedValue)
                        setUpsAccountNumber(sanitizedValue)

                        if (!sanitizedValue || sanitizedValue.length < 6) {
                          setLocalUpsError(t('this-field-is-min-max-length-6'))
                          // If the previous value was valid and now it's not, clear the shipping method
                          if (previousUpsAccountNumber.current.length === 6) {
                            console.log('code triggered')
                            handleShippingMethodSelectChange('', '')
                          }
                        } else {
                          setLocalUpsError('')
                          handleShippingMethodSelectChange(
                            getUPSShippingMethods()?.[0]?.shippingMethodName as string,
                            getUPSShippingMethods()?.[0]?.shippingMethodCode as string
                          )
                        }
                        setIsUpsAccountUpdated(false)
                        previousUpsAccountNumber.current = sanitizedValue
                      }}
                      onBlur={field.onBlur}
                      required={true}
                      sx={{ background: '#ffffff' }}
                    />
                  )}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
const PickupItemList = (pickupProps: PickupItemListProps) => {
  const { isShipItemsPresent, pickupItems, onClickChangeStore } = pickupProps
  const { t } = useTranslation('common')
  const expectedDeliveryDate = orderGetters.getExpectedDeliveryDate(pickupItems as CrOrderItem[])
  const isPickupItem = pickupItems.length > 0

  const fulfillmentLocationCodes = orderGetters.getFulfillmentLocationCodes(
    pickupItems as CrOrderItem[]
  )
  const { data: locations } = useGetStoreLocations({ filter: fulfillmentLocationCodes })
  const storePickupAddress = storeLocationGetters.getLocations(locations)

  return (
    <Box data-testid="pickup-items">
      {isShipItemsPresent && (
        <>
          <Divider orientation="horizontal" flexItem />
          <Box pt={2} pb={3}>
            <Typography sx={styles.shippingType} py={2} data-testid="pickup-title">
              {t('pickup')}
            </Typography>
          </Box>
        </>
      )}

      <Box>
        <ProductItemList
          items={pickupItems}
          storePickupAddresses={storePickupAddress}
          isPickupItem={isPickupItem}
          expectedDeliveryDate={expectedDeliveryDate}
          showChangeStoreLink={false}
          onClickChangeStore={onClickChangeStore}
        />
      </Box>
    </Box>
  )
}
const ShippingMethod = (props: ShippingMethodProps) => {
  const {
    checkout,
    shipItems,
    pickupItems,
    orderShipmentMethods,
    showTitle = true,
    selectedShippingMethodCode,
    onShippingMethodChange,
    onStoreLocatorClick,
  } = props

  const { t } = useTranslation('common')
  const shippingMethodRef = useRef()

  // useEffect(() => {
  //   shippingMethodRef.current &&
  //     !selectedShippingMethodCode &&
  //     (shippingMethodRef.current as Element).scrollIntoView({
  //       behavior: 'smooth',
  //       block: 'center',
  //     })
  // }, [selectedShippingMethodCode])

  return (
    <Box data-testid="shipping-method" ref={shippingMethodRef}>
      {showTitle && (
        <Typography variant="h2" component="h2" pt={2} color="primary.main">
          {t('shipping-method')}
        </Typography>
      )}
      {shipItems?.length ? (
        <ShipItemList
          {...(onShippingMethodChange && { onShippingMethodChange })}
          {...(orderShipmentMethods && { orderShipmentMethods })}
          selectedShippingMethodCode={selectedShippingMethodCode}
          shipItems={shipItems}
          checkout={checkout}
        />
      ) : null}
      {pickupItems?.length ? (
        <PickupItemList
          isShipItemsPresent={Boolean(shipItems?.length)}
          pickupItems={pickupItems}
          onClickChangeStore={onStoreLocatorClick}
        />
      ) : null}
    </Box>
  )
}
export default ShippingMethod
