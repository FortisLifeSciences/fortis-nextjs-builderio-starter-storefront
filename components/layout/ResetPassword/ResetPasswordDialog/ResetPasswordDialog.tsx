import React, { useState } from 'react'

import { Typography, Box, useTheme, useMediaQuery, Stack, Link } from '@mui/material'
import { useTranslation } from 'next-i18next'

import Content, { ResetPasswordInputData } from '../Content/Content'
import { CustomDialog, KiboDialog } from '@/components/common'
import { LoginDialog } from '@/components/layout'
import { useModalContext } from '@/context/ModalContext'
import { useResetPassword } from '@/hooks'

const resetPasswordStyles = {
  title: {
    color: 'primary.main',
    fontFamily: 'Poppins',
    fontSize: '30px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '45px',
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '0 2%',
    marginBottom: '1rem',
    marginTop: '1rem',
  },
  link: {
    textDecoration: 'underline',
    color: 'primary.main',
    fontFamily: 'Poppins',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: '300',
    lineHeight: '25px',
  },
}

const customMaxWidth = '600px'

const ResetPasswordDialog = () => {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const mdScreen = useMediaQuery(theme.breakpoints.up('md'))
  const { resetPassword } = useResetPassword()
  const { showModal, closeModal } = useModalContext()

  const [isResetPassword, setIsResetPassword] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleResetPassword = async (params: ResetPasswordInputData) => {
    if (isSubmitting) return // Prevent duplicate submissions
    setIsSubmitting(true)
    try {
      const res = await resetPassword.mutateAsync({
        emailAddress: params.email,
        userName: params.email,
        customerSetCode: '',
      })
      setIsResetPassword(res?.resetPassword)
    } catch (error) {
    } finally {
      setIsSubmitting(false) // Reset loading state
    }
  }

  const gotoLogin = () => {
    showModal({ Component: LoginDialog })
  }

  const Title = (
    <Box display={'flex'} alignItems={'center'} data-testid="title-component">
      <Typography variant={mdScreen ? 'h3' : 'h2'} sx={{ ...resetPasswordStyles.title }}>
        {t('reset-your-password')}
      </Typography>
    </Box>
  )

  // const Actions = (
  //   <Stack data-testid="actions-component" sx={{ ...resetPasswordStyles.actionsContainer }}>
  //     <Link
  //       component="button"
  //       variant="body1"
  //       aria-label={t('login-to-your-account')}
  //       onClick={gotoLogin}
  //       sx={{ ...resetPasswordStyles.link }}
  //     >
  //       {t('login-to-your-account')}
  //     </Link>
  //   </Stack>
  // )

  return (
    <CustomDialog
      Title={Title}
      Content={
        <Content
          setAutoFocus={true}
          onResetPassword={handleResetPassword}
          isResetPassword={isResetPassword}
        />
      }
      Actions={''}
      isDialogCentered={true}
      customMaxWidth={customMaxWidth}
      onClose={closeModal}
      showCloseButton
      showContentTopDivider={false}
      showContentBottomDivider={false}
    />
  )
}

export default ResetPasswordDialog
