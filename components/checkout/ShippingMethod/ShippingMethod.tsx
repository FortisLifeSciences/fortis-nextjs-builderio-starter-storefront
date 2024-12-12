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
      .matches(/^[0-9]+$/, t('this-field-is-number'))
      .required(t('this-field-is-required'))
      .min(9, t('this-field-is-min-max-length'))
      .max(9, t('this-field-is-min-max-length')),
  })
}

const ShipItemList = (shipProps: ShipItemListProps) => {
  const { checkout, orderShipmentMethods, selectedShippingMethodCode, onShippingMethodChange } =
    shipProps
  const { t } = useTranslation('common')

  const [isFedExMethodSelected, setIsFedExMethodSelected] = useState<boolean>(false)
  const [fedExAccountNumber, setFedExAccountNumber] = useState<string>()
  const [fedExAccountShippingMethod, setFedExAccountShippingMethod] = useState<CrShippingRate>()
  const [fedExAccountSelectedShippingMethodName, setFedExAccountSelectedShippingMethodName] =
    useState<string>()
  const [isFedExAccountUpdated, setIsFedExAccountUpdated] = useState<boolean>(false)

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

  useEffect(() => {
    if (customerAccount?.attributes?.length) {
      // Get FedEx account number
      const attr = find(customerAccount?.attributes, {
        fullyQualifiedName: 'tenant~customer-fedex-account-number',
      })
      setFedExAccountNumber(attr?.values?.length ? attr.values[0] : '')

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
      fedExAccountNumber.length === 9 &&
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
        fedExAccountNumber
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

      // Update order attributes
      const fedExAccountNumberAttr = find(
        checkout?.attributes,
        (attr) => attr?.fullyQualifiedName === 'tenant~customerFedexAccountNumber'
      )
      const b2bAccountNameAttr = find(
        checkout?.attributes,
        (attr) => attr?.fullyQualifiedName === 'tenant~b2bAccountName'
      )
      if (fedExAccountNumberAttr || b2bAccountNameAttr) {
        // Updating FedEx Account Number
        await updateOrderAttributes.mutateAsync({
          orderId: checkout?.id as string,
          orderAttributeInput: [
            {
              fullyQualifiedName: 'tenant~customerFedexAccountNumber',
              values: [fedExAccountNumber],
            },
          ],
        })

        // Updating B2B Account Name
        await updateOrderAttributes.mutateAsync({
          orderId: checkout?.id as string,
          orderAttributeInput: [
            {
              fullyQualifiedName: 'tenant~b2bAccountName',
              values: [customerAccount?.companyOrOrganization],
            },
          ],
        })
      } else {
        // Adding FedEx Account Number
        await createOrderAttributes.mutateAsync({
          orderId: checkout?.id as string,
          orderAttributeInput: [
            {
              fullyQualifiedName: 'tenant~customerFedexAccountNumber',
              values: [fedExAccountNumber],
            },
          ],
        })

        // Adding B2B Account Name
        await createOrderAttributes.mutateAsync({
          orderId: checkout?.id as string,
          orderAttributeInput: [
            {
              fullyQualifiedName: 'tenant~b2bAccountName',
              values: [customerAccount?.companyOrOrganization],
            },
          ],
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Box data-testid="ship-items">
      <Box mt={2}>
        <Box m={0} sx={{ display: 'grid' }}>
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
                        price={`${t('fortis-shipping')} (${item?.shippingMethodName} ${t(
                          'currency',
                          { val: item?.price }
                        )})`}
                      />
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
              backgroundColor:
                selectedShippingMethodCode && !isFedExMethodSelected ? '#E3E2FF' : 'none',
              '&:hover': { backgroundColor: '#E3E2FF' },
            }}
          />
        </Box>
        <Box
          m={0}
          py={0.5}
          sx={{
            borderRadius: 1,
            display: 'grid',
            backgroundColor: isFedExMethodSelected ? '#E3E2FF' : 'initial',
            '&:hover': { backgroundColor: '#E3E2FF' },
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
                    <Price
                      variant="body2"
                      fontWeight="normal"
                      price={'Use Customer FedEx Account'}
                    />
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
                  handleShippingMethodSelectChange(
                    fedExAccountShippingMethod?.shippingMethodName as string,
                    fedExAccountShippingMethod?.shippingMethodCode as string
                  )
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
                    error={!!errors?.fedExAccountNumber}
                    helperText={errors?.fedExAccountNumber?.message}
                    onChange={(_name: string, value: string) => {
                      field.onChange(value)
                      setIsFedExAccountUpdated(false)
                      setFedExAccountNumber(value)
                    }}
                    onBlur={field.onBlur}
                    required={true}
                    sx={{ background: '#ffffff' }}
                  />
                )}
              />
              <KiboSelect
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
              </KiboSelect>
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
        <Typography variant="h2" component="h2" pt={2}>
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
