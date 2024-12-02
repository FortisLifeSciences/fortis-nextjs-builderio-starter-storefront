import React from 'react'

import { Stack, Button, Typography, Box, Divider } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { B2BAccountCreateFormStyles } from '@/components/b2b/AccountHierarchy/B2BAccountCreateForm/B2BAccountCreateForm.styles'
import { CustomDialog } from '@/components/common'
import { useModalContext } from '@/context/ModalContext'

interface ConfirmationDialogProps {
  title?: string
  contentText: string
  primaryButtonText: string
  showContentTopDivider: boolean
  showContentBottomDivider: boolean
  onConfirm: () => void
}

const ConfirmationDialogContent = ({ contentText }: { contentText: string }) => {
  return (
    <Typography variant="body1" align="center">
      {contentText}
    </Typography>
  )
}

// Component
const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const {
    title,
    contentText,
    primaryButtonText,
    showContentTopDivider = false,
    showContentBottomDivider = false,
    onConfirm,
  } = props
  const { t } = useTranslation('common')
  const { closeModal } = useModalContext()

  const handlePrimaryButtonClick = () => {
    onConfirm()
    closeModal()
  }

  return (
    <CustomDialog
      showCloseButton
      Title={title}
      showContentTopDivider={false}
      showContentBottomDivider={false}
      isDialogCentered={true}
      Actions={''}
      Content={
        <Box>
          {/* <ConfirmationDialogContent contentText={contentText} /> */}
          <Typography variant="body2" sx={{ color: 'grey.900', marginBottom: '50px' }}>
            {contentText}
          </Typography>
          <Divider
            sx={{
              borderColor: 'grey.300',
              marginBottom: '20px',
            }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Button
              sx={{ ...B2BAccountCreateFormStyles.buttonSecondary }}
              data-testid="cancel-button"
              variant="contained"
              color="secondary"
              type="reset"
              onClick={closeModal}
            >
              {t('cancel')}
            </Button>
            <Button
              sx={{ ...B2BAccountCreateFormStyles.buttonPrimary }}
              data-testid="submit-button"
              variant="contained"
              type="submit"
              onClick={() => handlePrimaryButtonClick()}
            >
              {primaryButtonText}
            </Button>
          </Box>
        </Box>
      }
      customMaxWidth="600px"
      onClose={closeModal}
    />
  )
}
export default ConfirmationDialog
