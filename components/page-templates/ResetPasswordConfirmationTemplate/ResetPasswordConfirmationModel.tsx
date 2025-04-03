import React from 'react'

import { Modal, Box, Typography, Button } from '@mui/material'

interface ResetPasswordConfirmationModalProps {
  open: boolean
  onClose: () => void
}

const ResetPasswordConfirmationModal: React.FC<ResetPasswordConfirmationModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="password-reset-success">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          borderRadius: '0px 50px',
          backgroundColor: 'secondary.light',
          border: '3px solid #348345',
          p: 4,
          boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
          padding: '16px',
          '&:focus': {
            outline: 'none',
            borderColor: '#348345',
          },
        }}
      >
        <Typography id="password-reset-success" variant="h5" component="h2" gutterBottom>
          Password Reset Successful
        </Typography>
        <Typography variant="body2" gutterBottom>
          Your password has been successfully reset. You can now log in with your new credentials.
        </Typography>
        <Box mt={2} display="flex" justifyContent="center" gap={2}>
          <Button
            onClick={() => (window.location.href = '/login')}
            sx={{
              backgroundColor: 'primary.main',
              color: 'secondary.light',
              borderRadius: '0px 26px',
              border: '1px solid secondary.light',
              display: 'inline-flex',
              padding: '12px 18px',
              justifyContent: 'center',
              alignItems: 'center',
              width: 'auto',
              height: { md: '49px' },
              fontSize: '16px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }}
          >
            Log In
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            sx={{
              backgroundColor: 'primary.main',
              color: 'secondary.light',
              borderRadius: '0px 26px',
              border: '1px solid secondary.light',
              display: 'inline-flex',
              padding: '12px 18px',
              justifyContent: 'center',
              alignItems: 'center',
              width: 'auto',
              height: { md: '49px' },
              fontSize: '16px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }}
          >
            Home
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default ResetPasswordConfirmationModal
