import React from 'react'

import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Grid,
  Link,
  Divider,
} from '@mui/material'
import router from 'next/router'
import { useTranslation } from 'next-i18next'

import { CustomDialog } from '@/components/common'
import { LoginDialog, ResetPasswordDialog } from '@/components/layout'
import { useModalContext } from '@/context/ModalContext'

interface ResetPasswordConfirmationModalProps {
  open: boolean
  onClose: () => void
}

const PasswordSuccessStyle = {
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

const ResetPasswordConfirmationModal = () => {
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

  const Title = (
    <Box display={'flex'} alignItems={'center'} data-testid="title-component">
      <Typography variant={mdScreen ? 'h3' : 'h2'} sx={{ ...PasswordSuccessStyle.title }}>
        {t('password-reset-successful')}
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
                {t('password-reset-successful-paragraph1')}{' '}
                <Link
                  variant="body1"
                  type="button"
                  onClick={gotoLogin}
                  sx={{
                    ...PasswordSuccessStyle.link,
                    '&:hover': {
                      textDecoration: 'none',
                      color: 'primary.light',
                    },
                    cursor: 'pointer',
                  }}
                >
                  {t('log-in')}
                </Link>{' '}
                {t('password-reset-successful-paragraph2')}
              </Typography>
            </Grid>
            <Grid item sm={12} xs={12}>
              <Typography variant="body2" sx={{ color: 'gray.900', marginBottom: '15px' }}>
                {t('existingUser-paragraph-p2')}{' '}
                <Link
                  variant="body1"
                  type="button"
                  onClick={contactUs}
                  sx={{
                    ...PasswordSuccessStyle.link,
                    textTransform: 'lowercase',
                    '&:hover': {
                      textDecoration: 'none',
                      color: 'primary.light',
                    },
                    cursor: 'pointer',
                  }}
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
                  boxShadow: 'none',
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

export default ResetPasswordConfirmationModal
