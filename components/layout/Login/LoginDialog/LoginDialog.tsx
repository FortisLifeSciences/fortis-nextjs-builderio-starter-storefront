import React from 'react'

import { Stack, Typography, Link, styled } from '@mui/material'
import Alert from '@mui/material/Alert'
import router from 'next/router'
import { useTranslation } from 'next-i18next'

import { CustomDialog, KiboDialog } from '@/components/common'
import { B2BAccountFormDialog } from '@/components/dialogs'
import { RegisterAccountDialog, ResetPasswordDialog, ExistingUserDialog } from '@/components/layout'
import LoginContent, { LoginData } from '@/components/layout/Login/LoginContent/LoginContent'
import { useAuthContext, useHeaderContext } from '@/context'
import { useModalContext } from '@/context/ModalContext'
import { useB2BAccountRequest } from '@/hooks'
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

  const { isCartCheckout, onLoginSuccess, sessionExpired } = props
  const { login } = useAuthContext()
  const { toggleCartDrawer } = useHeaderContext()
  const { showModal, closeModal } = useModalContext()
  const { submitAccountRequest, isSubmitting } = useB2BAccountRequest()

  const onRegisterClick = () => {
    showModal({
      Component: B2BAccountFormDialog,
      props: {
        isAddingAccountToChild: false,
        isRequestAccount: true,
        primaryButtonText: t('create-account'),
        formTitle: t('b2b-account-request'),
        isAccountCreationError: false,
        isSubmitting,
        onSave: (formValues: CreateCustomerB2bAccountParams) => handleAccountRequest(formValues),
        onClose: () => closeModal(),
      },
    })
  }

  const handleAccountRequest = (formValues: CreateCustomerB2bAccountParams) =>
    submitAccountRequest(formValues, {
      onExistingUser: () => showModal({ Component: ExistingUserDialog }),
      onSuccess: () => {
        closeModal()
        router.push({ pathname: '/account-success' })
      },
      onError: () =>
        showModal({
          Component: B2BAccountFormDialog,
          props: {
            primaryButtonText: t('contact-us'),
            formTitle: t('b2b-account-request'),
            isAccountCreationError: true,
            onClose: () => closeModal(),
          },
        }),
    })

  const onForgotPassword = () => {
    showModal({ Component: ResetPasswordDialog })
  }

  const handleLogin = (params: LoginData) => {
    const cameFromResetPassword =
      typeof window !== 'undefined' && sessionStorage.getItem('fromResetPassword') === 'true'
    const onSuccess = () => {
      if (cameFromResetPassword) {
        sessionStorage.removeItem('fromResetPassword')
        closeModal() // 👈 close the modal first
        toggleCartDrawer(true)
      } else if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        closeModal()
      }
    }

    login(params, onSuccess)
  }

  return (
    <CustomDialog
      showCloseButton
      showContentTopDivider={false}
      showContentBottomDivider={false}
      Actions={''}
      Title={t('log-in')}
      Content={
        <>
          {sessionExpired && (
            <Alert severity="info" sx={{ mb: 2 }} data-testid="session-expired-alert">
              {t('session-expired-login')}
            </Alert>
          )}
          <LoginContent
            onLogin={handleLogin}
            onForgotPasswordClick={onForgotPassword}
            onRegisterNow={onRegisterClick}
          />
        </>
      }
      customMaxWidth="600px"
      onClose={closeModal}
    />
  )
}

export default LoginDialog
