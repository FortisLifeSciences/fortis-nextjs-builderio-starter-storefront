import React from 'react'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Box, Typography, Modal, IconButton, Link } from '@mui/material'

const PdpValidationAttributes = (props: any) => {
  const { product, onClose } = props

  const validationData = product?.properties?.find(
    (data: any) => data?.attributeFQN === 'tenant~validation-text'
  )

  const validationText =
    validationData?.values?.[0]?.stringValue ?? '<p>No validation details available</p>'

  return (
    <Modal open={true} onClose={onClose} disableEnforceFocus disableRestoreFocus>
      <Box
        sx={{
          position: 'absolute',
          top: { md: '300px', sm: '300px', xs: '300px' },
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { md: '600px', sm: '90%', xs: '95%' },
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '0px 50px',
          backgroundColor: 'secondary.light',
          border: '3px solid #348345',
          boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
          padding: '16px',
          '&:focus': {
            outline: 'none',
            borderColor: '#348345',
          },
        }}
      >
        {/* Header with Product Name and Close Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <Typography variant="body2" gutterBottom sx={{ fontFamily: 'Poppins' }}>
            {product?.content?.productName}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: 'grey.900',
              '&:hover': {
                backgroundColor: 'transparent',
                boxShadow: 'none',
              },
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </IconButton>
        </Box>

        {/* Validation Text with HTML Markup */}
        <Box>
          <Typography
            variant="body2"
            sx={{ fontFamily: 'Poppins' }}
            component="div"
            dangerouslySetInnerHTML={{ __html: validationText }}
          />
        </Box>

        {/* Learn More Link */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: '16px',
          }}
        >
          <Link
            href="/antibody-validation"
            underline="none"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'primary.main',
              fontFamily: 'Poppins',
              fontSize: { md: '16px', sm: '16px', xs: '14px' },
              fontWeight: 500,
              lineHeight: '25px',
            }}
          >
            Learn more about the validation performed
            <ChevronRightIcon />
          </Link>
        </Box>
      </Box>
    </Modal>
  )
}

export default PdpValidationAttributes
