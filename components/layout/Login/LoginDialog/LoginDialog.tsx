import React, { useEffect, useState } from 'react'

import { useLazyQuery } from '@apollo/client'
import builder from '@builder.io/react'
import { Stack, Typography, Link, styled } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { CustomDialog, KiboDialog } from '@/components/common'
import { B2BAccountFormDialog } from '@/components/dialogs'
import { RegisterAccountDialog, ResetPasswordDialog, ExistingUserDialog } from '@/components/layout'
import LoginContent, { LoginData } from '@/components/layout/Login/LoginContent/LoginContent'
import { useAuthContext } from '@/context'
import { useModalContext } from '@/context/ModalContext'
import { useCreateCustomerB2bAccountMutation } from '@/hooks'
import { buildCreateCustomerB2bAccountParams } from '@/lib/helpers'
import { CreateCustomerB2bAccountParams } from '@/lib/types'

export interface LoginFooterProps {
  onRegisterNow: () => void
}

const StyledActionsComponent = styled(Stack)(() => ({
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0 2%',
  marginBottom: '1.438rem',
  marginTop: '1.438rem',
}))

const LoginFooter = (props: LoginFooterProps) => {
  const { onRegisterNow } = props

  const { t } = useTranslation('common')

  return (
    <StyledActionsComponent>
      <Typography variant="h3" color={'primary'} pb={1}>
        {t('do-not-have-an-account-yet')}
      </Typography>
      <Link component="button" variant="body1" color="text.primary" onClick={onRegisterNow}>
        {t('register-now')}
      </Link>
    </StyledActionsComponent>
  )
}

const LoginDialog = (props: any) => {
  const { t } = useTranslation('common')

  const { isCartCheckout, onLoginSuccess } = props
  const { login } = useAuthContext()
  const { showModal, closeModal } = useModalContext()
  const { createCustomerB2bAccount } = useCreateCustomerB2bAccountMutation()

  const onRegisterClick = () => {
    showModal({
      Component: B2BAccountFormDialog,
      props: {
        isAddingAccountToChild: false,
        isRequestAccount: true,
        primaryButtonText: t('create-account'),
        formTitle: t('b2b-account-request'),
        isAccountCreationError: false,
        onSave: (formValues: CreateCustomerB2bAccountParams) => handleAccountRequest(formValues),
        onClose: () => closeModal(),
      },
    })
  }

  function extractDomain(email: string | string[]) {
    // Assuming email is a valid email address
    const atIndex = email.indexOf('@')
    if (atIndex !== -1) {
      return email.slice(atIndex + 1)
    }
    return '' // Handle invalid email format or other cases
  }

  const [googleReCaptcha, setGoogleReCaptcha] = useState(null)

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await builder.get('theme-setting').promise()
      setGoogleReCaptcha(settings?.data?.googleReCaptcha)
    }
    fetchSettings()
  }, [])

  const handleAccountRequest = async (formValues: CreateCustomerB2bAccountParams) => {
    const variables = buildCreateCustomerB2bAccountParams(formValues)
    const emailAddress = formValues?.emailAddress
    const emailDomain = extractDomain(emailAddress)
    const entityListFullName = 'B2BAccountMapping@fortis'
    const entityPayLoad = {
      entityListFullName: entityListFullName,
      id: emailDomain,
    }

    const getExistingUser = await fetch('/api/user/getAccountsByUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailAddress }),
    })

    const userDetails = await getExistingUser.json()

    if (userDetails.success === true) {
      showModal({ Component: ExistingUserDialog })
    } else {
      const entityResponse = await fetch('/api/user/get-entity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityPayLoad }),
      })

      const entityResult = await entityResponse.json()

      if ((googleReCaptcha as any)?.reCaptchAccountCreation) {
        try {
          // Ensure grecaptcha is available and ready
          const siteKey = (googleReCaptcha as any)?.accountCreationSiteKey
            ? (googleReCaptcha as any)?.accountCreationSiteKey
            : process.env.accountCreationSiteKey

          if (typeof grecaptcha !== 'undefined' && grecaptcha.enterprise) {
            grecaptcha.enterprise.ready(async () => {
              try {
                const reCaptchaResponseCode = await grecaptcha.enterprise.execute(siteKey, {
                  action: 'signup',
                })
                const payLoad = {
                  googleReCaptcha: googleReCaptcha,
                  responseKey: reCaptchaResponseCode,
                }
                const response = await fetch('/api/user/validate-recaptcha', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ payLoad }),
                })
                const data = await response.json()
                processUpdatedVariables(data, entityResult, variables)
              } catch (error) {
                processUpdatedVariables(null, entityResult, variables)
              }
            })
          } else {
            processUpdatedVariables(null, entityResult, variables)
          }
        } catch (error) {
          processUpdatedVariables(null, entityResult, variables)
        }
      } else {
        processUpdatedVariables(null, entityResult, variables)
      }
    }
  }

  const processUpdatedVariables = async (result: any, entityResult: any, variables: any) => {
    const updatedVariables = {
      ...variables,
      b2BAccountInput: {
        ...variables.b2BAccountInput,
        ...(entityResult?.entityDetails?.externalID && {
          externalId: entityResult.entityDetails.externalID,
        }),
        ...(result?.success
          ? {
              attributes: [
                {
                  fullyQualifiedName: 'tenant~recaptcha-score',
                  values: result?.score,
                },
              ],
            }
          : {}),
      },
    }

    try {
      const createAccount = await createCustomerB2bAccount.mutateAsync(updatedVariables)
      // Handle success
      if (createAccount?.id) {
        const accountId = createAccount?.id
        const purchaseOrderPayLoad = {
          accountId: accountId,
        }
        const addingSalesRep = await fetch('/api/user/addSalesRep', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ purchaseOrderPayLoad }),
        })

        const salesRepDetails = await addingSalesRep.json()
        if (salesRepDetails?.success === true) {
          const activeAccount = await fetch('/api/user/b2baccountActive', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ purchaseOrderPayLoad }),
          })

          const activeAccountDetails = await activeAccount.json()
          if (activeAccountDetails?.success === true) {
            if (
              entityResult?.entityDetails?.creditLine === 'true' ||
              entityResult?.entityDetails?.creditLine === true
            ) {
              const purchaseOrder = await fetch('/api/user/create-purchase-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ purchaseOrderPayLoad }),
              })
              const purchaseOrderResponse = await purchaseOrder.json()
              if (purchaseOrderResponse?.success === true) {
                closeModal()
              }
            } else {
              closeModal()
            }
          }
        }

        closeModal()
      }
    } catch (error) {
      showModal({
        Component: B2BAccountFormDialog,
        props: {
          primaryButtonText: t('contact-us'),
          formTitle: t('b2b-account-request'),
          isAccountCreationError: true,
          onClose: () => closeModal(),
        },
      })
    }
  }

  const onForgotPassword = () => {
    showModal({ Component: ResetPasswordDialog })
  }

  const handleLogin = (params: LoginData) => {
    if (isCartCheckout) {
      login(params, onLoginSuccess)
    } else {
      login(params, closeModal)
    }
  }

  return (
    <CustomDialog
      showCloseButton
      showContentTopDivider={false}
      showContentBottomDivider={false}
      Actions={''}
      Title={t('log-in')}
      Content={
        <LoginContent
          onLogin={handleLogin}
          onForgotPasswordClick={onForgotPassword}
          onRegisterNow={onRegisterClick}
        />
      }
      customMaxWidth="600px"
      onClose={closeModal}
    />
  )
}

export default LoginDialog
