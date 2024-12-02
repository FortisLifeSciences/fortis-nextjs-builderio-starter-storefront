import React, { useState } from 'react'

import {
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Stack,
  Link,
  Button,
  Grid,
  Divider,
} from '@mui/material'
import router from 'next/router'
import { useTranslation } from 'next-i18next'

import { CustomDialog } from '@/components/common'
import { LoginDialog, ResetPasswordDialog } from '@/components/layout'
import { useModalContext } from '@/context/ModalContext'

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

const customMaxWidth = '832px'

const ExistingUserDialog = () => {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const mdScreen = useMediaQuery(theme.breakpoints.up('md'))

  const { showModal, closeModal } = useModalContext()

  const gotoLogin = () => {
    showModal({ Component: LoginDialog })
  }

  const contactUs = async () => {
    router.push('/contact-us')
    closeModal()
  }

  const onForgotPassword = () => {
    showModal({ Component: ResetPasswordDialog })
  }

  const Title = (
    <Box display={'flex'} alignItems={'center'} data-testid="title-component">
      <Typography variant={mdScreen ? 'h3' : 'h2'} sx={{ ...resetPasswordStyles.title }}>
        {t('welcome-Back')}
      </Typography>
    </Box>
  )

  return (
    <CustomDialog
      Title={Title}
      Content={
        <>
          <Grid container columnSpacing={{ md: 5 }}>
            <Grid item sm={12} xs={12}>
              <Typography variant="body2" sx={{ color: 'gray.900', marginBottom: '25px' }}>
                {t('existingUser-paragraph-p1')}{' '}
                <Link
                  component="button"
                  variant="body1"
                  aria-label={t('log-in-to-your-account')}
                  onClick={gotoLogin}
                  sx={{ ...resetPasswordStyles.link }}
                >
                  {t('log-in-to-your-account')}
                </Link>
              </Typography>
            </Grid>
            <Grid item sm={12} xs={12}>
              <Typography variant="body2" sx={{ color: 'gray.900', marginBottom: '15px' }}>
                {t('existingUser-paragraph-p2')}{' '}
                <Link
                  component="button"
                  variant="body1"
                  aria-label={t('reset-your-password')}
                  onClick={onForgotPassword}
                  sx={{ ...resetPasswordStyles.link, textTransform: 'lowercase' }}
                >
                  {t('reset-your-password')}
                </Link>
                , {t('or')}{' '}
                <Link
                  component="button"
                  variant="body1"
                  aria-label={t('contact-us')}
                  onClick={contactUs}
                  sx={{ ...resetPasswordStyles.link, textTransform: 'lowercase' }}
                >
                  {t('contact-us')}
                </Link>{' '}
                {t('existingUser-paragraph-p3')}
              </Typography>
            </Grid>
            <Grid item sm={12} xs={12}>
              <Divider
                sx={{
                  borderColor: 'grey.300',
                  margin: '20px 0px',
                }}
              />
            </Grid>
            <Grid
              item
              sm={12}
              xs={12}
              sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}
            >
              <Button
                data-testid="cancel-button"
                variant="contained"
                color="secondary"
                sx={{
                  width: 'auto',
                  backgroundColor: 'secondary.light',
                  color: 'primary.main',
                  textAlign: 'center',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '24px',
                  borderRadius: '0px 26px',
                  border: '1px solid primary.main',
                  padding: '12px 30px',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    border: '1px solid secondary.main',
                  },
                }}
                onClick={closeModal}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="contained"
                sx={{
                  width: 'auto',
                  backgroundColor: 'primary.main',
                  color: 'secondary.light',
                  textAlign: 'center',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '24px',
                  borderRadius: '0px 26px',
                  border: '1px solid primary.main',
                  padding: '12px 30px',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    border: '1px solid primary.light',
                  },
                  marginLeft: '20px',
                }}
                onClick={gotoLogin}
              >
                {t('log-in')}
              </Button>
            </Grid>
          </Grid>
        </>
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

export default ExistingUserDialog
