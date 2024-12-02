import { useEffect, useState } from 'react'

import { Button, FormControl, Stack, Grid, Box, Typography, Divider, Link } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { B2BAccountCreateFormStyles } from '../B2BAccountCreateForm/B2BAccountCreateForm.styles'

interface AccountHierarchyFormProps {
  primaryButtonText: string
  onClose?: () => void
}

const ErrorModal = (props: AccountHierarchyFormProps) => {
  const { primaryButtonText, onClose } = props
  const { t } = useTranslation()

  const contactUs = async () => {
    alert('There was an error submitting your message.')
  }

  const primaryBtnCss = { ...B2BAccountCreateFormStyles.buttonPrimary }

  return (
    <form data-testid="account-hierarchy-form">
      <FormControl sx={{ width: '100%' }}>
        <Grid container columnSpacing={{ md: 5 }}>
          <Grid item sm={12}>
            <Box style={{ paddingBottom: '80px' }}>
              <Typography
                variant="body1"
                sx={{
                  color: 'red.500',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '25px',
                }}
              >
                {t('contact-us-ErrorMsg-part1')}
                <Link
                  component="button"
                  variant="body1"
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '16px',
                    fontWeight: '400',
                    lineHeight: '25px',
                    textAlign: 'left',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: 'red.500',
                  }}
                  onClick={contactUs}
                >
                  {t('contact-us')}
                </Link>
                {t('contact-us-ErrorMsg-part2')}
              </Typography>
            </Box>
          </Grid>
          <Grid item sm={12} md={6}></Grid>
          <Grid item sm={12} md={6}></Grid>
          <Grid item sm={12} xs={12}>
            <Divider
              sx={{
                borderColor: '#EDEDED',
                marginBottom: '20px',
              }}
            />
          </Grid>

          <Grid item sm={12}>
            <Grid container columnSpacing={{ md: 5 }}>
              <Grid item sm={12} md={6} xs={12} sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { md: 'flex-start', xs: 'center' },
                  }}
                ></Box>
              </Grid>
              <Grid item sm={12} md={6} xs={12}>
                <Stack gap={2} sx={{ ...B2BAccountCreateFormStyles.buttonStackStyle }}>
                  <Button
                    sx={{ ...B2BAccountCreateFormStyles.buttonSecondary }}
                    data-testid="cancel-button"
                    variant="contained"
                    color="secondary"
                    type="reset"
                    onClick={onClose}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    sx={primaryBtnCss}
                    data-testid="submit-button"
                    variant="contained"
                    onClick={contactUs}
                  >
                    {primaryButtonText}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </FormControl>
    </form>
  )
}

export default ErrorModal
