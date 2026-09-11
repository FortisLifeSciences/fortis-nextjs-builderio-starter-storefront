import React, { useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import { Button, Typography } from '@mui/material'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'
import { useReCaptcha } from 'next-recaptcha-v3'

import AddressDisplayCard from './AddressDisplayCard'
import AddressEditForm from './AddressEditForm'
import AddressRemoveDialog from './AddressRemoveDialog'
import { KiboPagination } from '@/components/common'
import { AccountPageHeader, accountActionButton, accountType } from '@/components/my-account/common'
import { useModalContext, useSnackbarContext } from '@/context'
import {
  useCreateCustomerAddress,
  useUpdateCustomerAddress,
  useDeleteCustomerAddress,
  useValidateCustomerAddress,
} from '@/hooks'
import { AddressType, CountryCode } from '@/lib/constants'
import { userGetters } from '@/lib/getters'
import { buildAddressParams, validateGoogleReCaptcha } from '@/lib/helpers'
import type { Address } from '@/lib/types'

import type { AddressEditFormValues } from './AddressEditForm'
import type { UpdateCustomerAccountContactDetailsParams } from '@/hooks'
import type {
  CuAddress,
  CustomerAccount,
  CustomerContact,
  CustomerContactCollection,
} from '@/lib/gql/types'

interface ShippingAddressTemplateProps {
  user: CustomerAccount
  contacts: CustomerContactCollection
}

const styles = {
  addButton: accountActionButton,
  emptyState: {
    ...accountType.body,
    color: 'text.secondary',
    padding: '2rem 0',
  },
}

const isPrimaryShippingContact = (contact?: CustomerContact) =>
  Boolean(
    contact?.types?.find((type) => type?.name?.toLowerCase() === AddressType.SHIPPING.toLowerCase())
      ?.isPrimary
  )

const toContactInput = (contact: CustomerContact) => ({
  id: contact?.id,
  firstName: contact?.firstName,
  middleNameOrInitial: contact?.middleNameOrInitial,
  lastNameOrSurname: contact?.lastNameOrSurname,
  companyOrOrganization: contact?.companyOrOrganization,
  label: contact?.label,
  email: contact?.email,
  phoneNumbers: {
    home: contact?.phoneNumbers?.home,
    mobile: contact?.phoneNumbers?.mobile,
    work: contact?.phoneNumbers?.work,
  },
  address: {
    address1: contact?.address?.address1,
    address2: contact?.address?.address2,
    address3: contact?.address?.address3,
    address4: contact?.address?.address4,
    cityOrTown: contact?.address?.cityOrTown,
    stateOrProvince: contact?.address?.stateOrProvince,
    postalOrZipCode: contact?.address?.postalOrZipCode,
    countryCode: contact?.address?.countryCode,
    addressType: contact?.address?.addressType,
    isValidated: contact?.address?.isValidated,
  },
})

const ShippingAddressTemplate = (props: ShippingAddressTemplateProps) => {
  const { user, contacts } = props
  const { t } = useTranslation('common')

  const { publicRuntimeConfig } = getConfig()
  const shippingAddressPageSize = publicRuntimeConfig.shippingAddressPageSize
  const reCaptchaKey = publicRuntimeConfig.recaptcha.reCaptchaKey
  const allowInvalidAddresses = publicRuntimeConfig.allowInvalidAddresses

  const { showModal, closeModal } = useModalContext()
  const { showSnackbar } = useSnackbarContext()
  const { executeRecaptcha } = useReCaptcha()

  const { createCustomerAddress } = useCreateCustomerAddress()
  const { updateCustomerAddress } = useUpdateCustomerAddress()
  const { deleteCustomerAddress } = useDeleteCustomerAddress()
  const { validateCustomerAddress } = useValidateCustomerAddress()

  const shippingAddresses =
    userGetters.getUserShippingAddress(contacts?.items as CustomerContact[]) ?? []

  const [startIndex, setStartIndex] = useState<number>(0)
  const [editingContact, setEditingContact] = useState<CustomerContact | undefined>()
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [isDefaultAddress, setIsDefaultAddress] = useState<boolean>(false)

  const displayAddresses = shippingAddresses.slice(startIndex, startIndex + shippingAddressPageSize)
  const isEditing = isAdding || Boolean(editingContact)

  const resetForm = () => {
    setIsAdding(false)
    setEditingContact(undefined)
    setIsDefaultAddress(false)
  }

  const handleAddNew = () => {
    resetForm()
    setIsAdding(true)
  }

  const handleEdit = (contact: CustomerContact) => {
    resetForm()
    setEditingContact(contact)
    setIsDefaultAddress(isPrimaryShippingContact(contact))
  }

  const handleDuplicate = (contact: CustomerContact) => {
    resetForm()
    setEditingContact({ ...contact, id: undefined } as CustomerContact)
    setIsAdding(true)
  }

  const handleSetAsDefault = async (contact: CustomerContact) => {
    const otherTypes = (contact?.types ?? [])
      .filter((type) => type?.name?.toLowerCase() !== AddressType.SHIPPING.toLowerCase())
      .map((type) => ({ name: type?.name, isPrimary: type?.isPrimary }))

    const params = {
      accountId: user?.id as number,
      contactId: contact?.id as number,
      userId: user?.userId as string,
      customerContactInput: {
        ...toContactInput(contact),
        accountId: user?.id as number,
        types: [...otherTypes, { name: AddressType.SHIPPING, isPrimary: true }],
      },
    }

    const previousDefault = shippingAddresses.find(
      (item) => isPrimaryShippingContact(item) && item?.id !== contact?.id
    )

    try {
      await updateCustomerAddress.mutateAsync(params as UpdateCustomerAccountContactDetailsParams)

      if (previousDefault) {
        const demotedTypes = (previousDefault?.types ?? []).map((type) => ({
          name: type?.name,
          isPrimary:
            type?.name?.toLowerCase() === AddressType.SHIPPING.toLowerCase()
              ? false
              : type?.isPrimary,
        }))

        await updateCustomerAddress.mutateAsync({
          accountId: user?.id as number,
          contactId: previousDefault?.id as number,
          userId: user?.userId as string,
          customerContactInput: {
            ...toContactInput(previousDefault),
            accountId: user?.id as number,
            types: demotedTypes,
          },
        } as UpdateCustomerAccountContactDetailsParams)
      }
    } catch (error) {
      console.error('Error: set default shipping address', error)
      showSnackbar(String(t('something-went-wrong')), 'error')
    }
  }

  const handleConfirmDelete = (contact: CustomerContact) => {
    showModal({
      Component: AddressRemoveDialog,
      props: {
        customerContact: contact,
        onConfirm: async () => {
          try {
            await deleteCustomerAddress.mutateAsync({
              accountId: user?.id,
              contactId: contact?.id as number,
            })
            closeModal()
          } catch (error) {
            console.error('Error: delete shipping address', error)
          }
        },
        onClose: closeModal,
      },
    })
  }

  const handleSaveAddress = async (values: AddressEditFormValues, makeDefault: boolean) => {
    const addressWithDefaults = {
      contact: {
        ...(editingContact?.id && !isAdding ? { id: editingContact.id } : {}),
        firstName: values.firstName,
        lastNameOrSurname: values.lastNameOrSurname,
        label: values.companyOrOrganization,
        companyOrOrganization: values.companyOrOrganization,
        email: values.email || (user.emailAddress as string),
        phoneNumbers: {
          home: values.phoneNumber,
          work: values.phoneNumber,
        },
        address: {
          address1: values.address1,
          address2: values.address2,
          cityOrTown: values.cityOrTown,
          stateOrProvince: values.stateOrProvince,
          postalOrZipCode: values.postalOrZipCode,
          countryCode: values.countryCode,
          addressType: 'commercial',
        },
      },
      isDataUpdated: true,
    } as unknown as Address

    const params = buildAddressParams({
      accountId: user?.id,
      address: addressWithDefaults,
      isDefaultAddress: makeDefault,
      addressType: AddressType.SHIPPING,
    })

    try {
      if (
        !allowInvalidAddresses &&
        addressWithDefaults?.contact?.address?.countryCode === CountryCode.US
      ) {
        await validateCustomerAddress.mutateAsync({
          addressValidationRequestInput: {
            address: addressWithDefaults?.contact?.address as CuAddress,
          },
        })
      }

      if (addressWithDefaults?.contact?.id) {
        await updateCustomerAddress.mutateAsync({
          ...params,
          userId: user?.userId as string,
        } as UpdateCustomerAccountContactDetailsParams)
      } else {
        await createCustomerAddress.mutateAsync(params)
      }

      resetForm()
    } catch (error) {
      console.error('Error: add/edit shipping address', error)
    }
  }

  const submitFormWithRecaptcha = (values: AddressEditFormValues, makeDefault: boolean) => {
    if (!executeRecaptcha) return

    executeRecaptcha('enquiryFormSubmit').then(async (gReCaptchaToken) => {
      const captcha = await validateGoogleReCaptcha(gReCaptchaToken)

      if (captcha?.status === 'success') {
        await handleSaveAddress(values, makeDefault)
      } else {
        showSnackbar(captcha.message, 'error')
      }
    })
  }

  const renderEditForm = () => (
    <AddressEditForm
      customerContact={editingContact}
      isDefault={isDefaultAddress}
      isNew={isAdding}
      onSave={(values, makeDefault) =>
        reCaptchaKey
          ? submitFormWithRecaptcha(values, makeDefault)
          : handleSaveAddress(values, makeDefault)
      }
      onCancel={resetForm}
    />
  )

  return (
    <>
      <AccountPageHeader
        title={String(t('shipping-addresses'))}
        action={
          !isEditing && (
            <Button
              variant="contained"
              color="primary"
              disableElevation
              startIcon={<AddIcon />}
              sx={{ ...styles.addButton }}
              onClick={handleAddNew}
            >
              {t('add-new-address')}
            </Button>
          )
        }
      />

      {isEditing && renderEditForm()}

      {!isEditing && !displayAddresses.length && (
        <Typography sx={{ ...styles.emptyState }}>{t('no-saved-addresses')}</Typography>
      )}

      {displayAddresses.map((contact) => {
        if (editingContact?.id === contact?.id && !isAdding) return null

        const isDefault = isPrimaryShippingContact(contact)

        return (
          <AddressDisplayCard
            key={contact?.id}
            customerContact={contact}
            isDefault={isDefault}
            actions={[
              { id: 'edit', label: String(t('edit')), onClick: () => handleEdit(contact) },
              {
                id: 'set-as-default',
                label: String(t('set-as-default')),
                onClick: () => handleSetAsDefault(contact),
                disabled: isDefault,
              },
              {
                id: 'duplicate',
                label: String(t('duplicate')),
                onClick: () => handleDuplicate(contact),
              },
              {
                id: 'remove',
                label: String(t('remove')),
                onClick: () => handleConfirmDelete(contact),
                destructive: true,
              },
            ]}
          />
        )
      })}

      {shippingAddresses.length > shippingAddressPageSize && (
        <KiboPagination
          count={Math.ceil(shippingAddresses.length / shippingAddressPageSize)}
          startIndex={startIndex}
          pageSize={shippingAddressPageSize}
          onPaginationChange={(params) => setStartIndex(Number(params?.startIndex ?? 0))}
        />
      )}
    </>
  )
}

export default ShippingAddressTemplate
