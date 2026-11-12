import React, { useState } from 'react'

import { Box } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'

import {
  AccountPageHeader,
  AccountSectionCard,
  InlineField,
  ProfileDetailsForm,
} from '@/components/my-account'
import {
  useUpdateCustomerProfile,
  useChangePassword,
  useUpdateCustomerB2bUserMutation,
  useUpdateCustomerB2bAccountMutation,
} from '@/hooks'
import { userGetters } from '@/lib/getters'
import {
  buildUpdateCustomerB2bUserParams,
  buildUpdateCustomerB2bAccountParams,
} from '@/lib/helpers'
import { loginKeys } from '@/lib/react-query/queryKeys'
import { UpdateProfileDataParam, PasswordTypes } from '@/lib/types'

import type { B2BAccount, B2BUser, CustomerAccount } from '@/lib/gql/types'

interface AccountInformationTemplateProps {
  user: CustomerAccount
  isB2BUser?: boolean
}

enum EditableSection {
  ContactDetails = 'contact-details',
  Email = 'email',
  Organization = 'organization',
  Password = 'password',
}

const styles = {
  editLink: {
    typography: 'body2',
    color: 'primary.main',
    cursor: 'pointer',
    fontWeight: 600,
    background: 'none',
    border: 'none',
    padding: 0,
  },
  passwordValue: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.75rem',
  },
  hint: {
    typography: 'caption',
    color: 'text.secondary',
  },
}

const AccountInformationTemplate = (props: AccountInformationTemplateProps) => {
  const { user, isB2BUser } = props
  const { t } = useTranslation('common')

  const queryClient = useQueryClient()
  const { updateUserData } = useUpdateCustomerProfile()
  const { changePassword } = useChangePassword()
  const { updateCustomerB2bUser } = useUpdateCustomerB2bUserMutation()
  const { updateCustomerB2bAccount } = useUpdateCustomerB2bAccountMutation()

  const [editingSection, setEditingSection] = useState<EditableSection | null>(null)

  const { id, firstName, lastName, emailAddress, fullName, companyOrOrganization } =
    userGetters.getCustomerAccountDetails(user)

  const handleUpdateProfileData = async (profileFormData: UpdateProfileDataParam) => {
    if (profileFormData.oldPassword && profileFormData.newPassword) {
      await handleUpdateUserPassword(profileFormData)
      return
    }

    try {
      await updateUserData.mutateAsync({
        accountId: id,
        customerAccountInput: {
          id,
          firstName: profileFormData.firstName || firstName,
          lastName: profileFormData.lastName || lastName,
          emailAddress: profileFormData.emailAddress || emailAddress,
          companyOrOrganization: profileFormData.companyOrOrganization ?? companyOrOrganization,
        },
      })
    } catch (err) {
      console.error(err)
    }
    setEditingSection(null)
  }

  const handleUpdateB2BProfileData = async (profileFormData: UpdateProfileDataParam) => {
    const variables = buildUpdateCustomerB2bUserParams({
      user,
      b2BUser: user as B2BUser,
      values: {
        ...profileFormData,
        firstName: profileFormData.firstName || firstName,
        lastName: profileFormData.lastName || lastName,
        emailAddress: profileFormData.emailAddress || emailAddress,
        isActive: true,
      },
    })

    try {
      await updateCustomerB2bUser.mutateAsync({ ...variables })

      if (profileFormData.companyOrOrganization !== undefined) {
        const accountParams: any = buildUpdateCustomerB2bAccountParams(
          {
            companyOrOrganization: profileFormData.companyOrOrganization,
            taxId: user.taxId as string | undefined,
            firstName,
            lastName,
            emailAddress,
          },
          { id } as B2BAccount
        )
        await updateCustomerB2bAccount.mutateAsync(accountParams)
      }
    } catch (err) {
      console.error(err)
    }
    setEditingSection(null)
  }

  const handleUpdateUserPassword = async (updatedPassword: PasswordTypes) => {
    try {
      await changePassword.mutateAsync({
        accountId: id,
        userId: user?.userId as string,
        passwordInfoInput: {
          oldPassword: updatedPassword.oldPassword as string,
          newPassword: updatedPassword.newPassword as string,
        },
      })
    } catch (err) {
      console.error(err)
    }
    setEditingSection(null)
  }

  const editButton = (section: EditableSection) => (
    <Box
      component="button"
      type="button"
      sx={{ ...styles.editLink }}
      onClick={() => setEditingSection(section)}
    >
      {t('edit')}
    </Box>
  )

  return (
    <>
      <AccountPageHeader title={String(t('account-information'))} />

      <AccountSectionCard title={String(t('contact-details'))}>
        {editingSection === EditableSection.Email ? (
          <ProfileDetailsForm
            isEmailForm
            firstName={firstName}
            lastName={lastName}
            emailAddress={emailAddress}
            onSaveProfileData={(data) =>
              isB2BUser ? handleUpdateB2BProfileData(data) : handleUpdateProfileData(data)
            }
            onCancel={() => setEditingSection(null)}
          />
        ) : editingSection === EditableSection.ContactDetails ? (
          <ProfileDetailsForm
            firstName={firstName}
            lastName={lastName}
            emailAddress={emailAddress}
            onSaveProfileData={(data) =>
              isB2BUser ? handleUpdateB2BProfileData(data) : handleUpdateProfileData(data)
            }
            onCancel={() => setEditingSection(null)}
          />
        ) : editingSection === EditableSection.Organization ? (
          <ProfileDetailsForm
            isOrganizationForm
            companyOrOrganization={companyOrOrganization}
            onSaveProfileData={(data) =>
              isB2BUser ? handleUpdateB2BProfileData(data) : handleUpdateProfileData(data)
            }
            onCancel={() => setEditingSection(null)}
          />
        ) : (
          <>
            <InlineField
              label={String(t('full-name'))}
              value={fullName}
              action={editButton(EditableSection.ContactDetails)}
            />
            <InlineField
              label={String(t('work-email'))}
              value={emailAddress}
              action={editButton(EditableSection.Email)}
            />
            <InlineField
              label={String(t('company-institution-or-organization'))}
              value={companyOrOrganization}
              action={editButton(EditableSection.Organization)}
              last
            />
          </>
        )}
      </AccountSectionCard>

      <AccountSectionCard title={String(t('password'))}>
        {editingSection === EditableSection.Password ? (
          <ProfileDetailsForm
            isPasswordForm
            firstName={firstName}
            lastName={lastName}
            emailAddress={emailAddress}
            onSaveProfileData={(data) => handleUpdateProfileData(data)}
            onCancel={() => setEditingSection(null)}
          />
        ) : (
          <InlineField
            label={String(t('password'))}
            value="**************"
            action={editButton(EditableSection.Password)}
            last
          />
        )}
      </AccountSectionCard>
    </>
  )
}

export default AccountInformationTemplate
