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

  const [isFedexAccountMethodUpdated, setIsFedexAccountMethodUpdated] = useState<boolean>(false)
  const [localError, setLocalError] = useState('')

  const fedExSchema = useFedExSchema()
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

  const payload = {
    userId: customerAccount?.userId,
    accountId: customerAccount?.id,
    attributeFqn: 'tenant~customer-fedex-account-number',
  }

  useEffect(() => {
    // console.log("customerAccount",customerAccount)
    const fetchSettings = async () => {
      const entityResponse = await fetch('/api/user/getCustomerAttribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      })

      const attributeDetails = await entityResponse.json()
      // console.log("attributeDetails", attributeDetails)
      setFedExAccountNumber(
        attributeDetails?.data?.values[0] ? attributeDetails?.data?.values[0] : ''
      )
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (customerAccount?.attributes?.length) {
      // Get FedEx account number
      // const attr = find(customerAccount?.attributes, {
      //   fullyQualifiedName: 'tenant~customer-fedex-account-number',
      // })
      if (fedExAccountNumberInput) {
        setFedExAccountNumber(fedExAccountNumberInput)
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
      setFedExAccountShippingMethod(shippingMethod)
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
  }, [fedExAccountNumber, fedExAccountSelectedShippingMethodName])

  const previousFedExAccountNumber = useRef('')

  useEffect(() => {
    if (
      isFedExMethodSelected &&
      fedExAccountNumber &&
      (previousFedExAccountNumber.current.length > fedExAccountNumber.length ||
        fedExAccountNumber.length === 0)
    ) {
      if (isFedexAccountMethodUpdated) {
        handleShippingMethodSelectChange('', '')
      }
    }

    // Update the previous value
    previousFedExAccountNumber.current = fedExAccountNumber || ''
  }, [fedExAccountNumber, isFedExMethodSelected])

  useEffect(() => {
    if (selectedShippingMethodCode && !isFedExMethodSelected) {
      const fedExShippings = getFedExShippingMethods()
      const selectedFexEdMethod = find(
        fedExShippings,
        (fedExShip) => fedExShip?.shippingMethodCode === selectedShippingMethodCode
      )
      if (fedExShippings && selectedFexEdMethod) {
        handleShippingMethodSelectChange(
          selectedFexEdMethod?.shippingMethodName as string,
          selectedFexEdMethod?.shippingMethodCode as string
        )
        setIsFedExMethodSelected(true)
      }
    }
  }, [selectedShippingMethodCode])

  const handleShippingMethodChange = (value: string, name?: string) => {
    setFedExAccountShippingMethod({})
    onShippingMethodChange && onShippingMethodChange(value, name)
  }

  const handleShippingMethodSelectChange = (name: string, value: string) => {
    const shippingMethod = find(
      orderShipmentMethods,
      (shipMethod) => value === shipMethod?.shippingMethodCode
    ) as CrShippingRate
    setFedExAccountShippingMethod(shippingMethod)
    setIsFedExAccountUpdated(false)
    onShippingMethodChange && onShippingMethodChange(value, name)
    if (name !== '' && value !== '') {
      setIsFedexAccountMethodUpdated(true)
    } else {
      setIsFedexAccountMethodUpdated(false)
    }
  }

  const getFortisShippingMethods = () => {
    const fortisShippingMethods = filter(orderShipmentMethods, (shippingMethod: CrShippingRate) => {
      if (!shippingMethod?.shippingMethodName?.includes('FedEx Account')) {
        return shippingMethod
      }
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

  // Save FedEx account into customer attributes
  const { updateUserData } = useUpdateCustomerProfile()
  const { createOrderAttributes } = useCreateOrderAttribute()
  const { updateOrderAttributes } = useUpdateOrderAttributes()

  const updateFortisOrderAttribute = async (orderAttributeFQN: string, value: string) => {
    // Update order attributes if found
    const orderAttr = find(
      checkout?.attributes,
      (attr) => attr?.fullyQualifiedName === orderAttributeFQN
    )

    if (orderAttr) {
      // Updating Order Attribute
      await updateOrderAttributes.mutateAsync({
        orderId: checkout?.id as string,
        orderAttributeInput: [
          {
            fullyQualifiedName: orderAttributeFQN,
            values: [value],
          },
        ],
      })
    } else {
      // Adding Order Attribute
      await createOrderAttributes.mutateAsync({
        orderId: checkout?.id as string,
        orderAttributeInput: [
          {
            fullyQualifiedName: orderAttributeFQN,
            values: [value],
          },
        ],
      })
    }
  }

  useEffect(() => {
    if (customerAccount?.companyOrOrganization) {
      updateFortisOrderAttribute('tenant~b2bAccountName', customerAccount?.companyOrOrganization)
    }

    if (fedExAccountNumber && fedExAccountNumber.length === 9) {
      updateFortisOrderAttribute('tenant~customerFedexAccountNumber', fedExAccountNumber)
    }
  }, [customerAccount?.companyOrOrganization, fedExAccountNumber])

  const handleFexExAccountShipping = async (
    customerAccount: CustomerAccount,
    fedExAccountNumber: string,
    fedExShippingMethodName: string
  ) => {
    try {
      // Update customer attributes
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
          <KiboRadio
            radioOptions={
              getFortisShippingMethods()?.map((item) => {
                return {
                  value: item?.shippingMethodCode as string,
                  name: item?.shippingMethodName as string,
                  label: item ? (
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
                      {/* removed price  ${t('currency',{ val: item?.price })} */}
                    </MenuItem>
                  ) : (
                    ''
                  ),
                }
              }) ?? []
            }
            selected={
              !isFedExMethodSelected && selectedShippingMethodCode ? selectedShippingMethodCode : ''
            }
            align="flex-start"
            onChange={(value) => {
              handleShippingMethodChange(value)
              setIsFedExMethodSelected(false)
              setIsFedExAccountUpdated(true)
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
            onChange={() => {
              if (selectedShippingMethodCode || fedExAccountShippingMethod?.shippingMethodCode) {
                const shippingMethod = selectedShippingMethodCode
                  ? find(
                      getFedExShippingMethods(),
                      (fedExMethod) =>
                        fedExMethod?.shippingMethodCode === selectedShippingMethodCode
                    )
                  : undefined
                if (shippingMethod) {
                  handleShippingMethodSelectChange(
                    shippingMethod?.shippingMethodName as string,
                    shippingMethod?.shippingMethodCode as string
                  )
                } else if (fedExAccountShippingMethod) {
                  if (fedExAccountNumber && fedExAccountNumber.length === 9) {
                    handleShippingMethodSelectChange(
                      getFedExShippingMethods()?.[0]?.shippingMethodName as string,
                      getFedExShippingMethods()?.[0]?.shippingMethodCode as string
                    )
                  } else {
                    handleShippingMethodSelectChange('', '')
                  }
                }
              } else {
                handleShippingMethodChange('')
              }
              setIsFedExAccountUpdated(false)
              setIsFedExMethodSelected(true)
            }}
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
              {/* <KiboSelect
                name="shippingMethodCode"
                label={'Method'}
                onChange={handleShippingMethodSelectChange}
                value={
                  (selectedShippingMethodCode
                    ? selectedShippingMethodCode
                    : fedExAccountShippingMethod?.shippingMethodCode) ?? ''
                }
                required
                sx={{ background: '#ffffff' }}
              >
                {getFedExShippingMethods()?.map((item) => {
                  return (
                    <MenuItem key={item?.shippingMethodCode} value={`${item?.shippingMethodCode}`}>
                      <Price
                        variant="body2"
                        fontWeight="normal"
                        price={
                          `${item?.shippingMethodName}` + ' ' + t('currency', { val: item?.price })
                        }
                      />
                    </MenuItem>
                  )
                })}
              </KiboSelect> */}
            </Box>
          )}
        </Box>
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

  useEffect(() => {
    shippingMethodRef.current &&
      !selectedShippingMethodCode &&
      (shippingMethodRef.current as Element).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
  }, [selectedShippingMethodCode])

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
