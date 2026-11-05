import React from 'react'

import { Box, Button, Dialog, Stack, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { getAddressDisplayName } from './AddressDisplayCard'
import { accountTextButton } from '@/components/my-account/common'

import type { CuAddress, CustomerContact } from '@/lib/gql/types'

interface AddressRemoveDialogProps {
  customerContact: CustomerContact
  onConfirm: () => void
  onClose: () => void
}

const styles = {
  paper: {
    width: '30rem',
    maxWidth: 'calc(100% - 2rem)',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.16)',
  },
  title: {
    fontSize: '1.5rem',
    lineHeight: 1.3,
    fontWeight: 700,
    color: 'text.primary',
    textAlign: 'center',
    padding: '0 1rem',
  },
  summary: {
    backgroundColor: 'grey.100',
    borderRadius: '0.5rem',
    padding: '1.75rem',
    marginTop: '1.5rem',
  },
  organization: {
    fontSize: '1.0625rem',
    fontWeight: 700,
    color: 'text.primary',
    marginBottom: '0.75rem',
  },
  line: {
    fontSize: '0.9375rem',
    lineHeight: 1.75,
    color: 'text.primary',
  },
  mutedLine: {
    fontSize: '0.9375rem',
    lineHeight: 1.75,
    color: 'text.secondary',
  },
  actions: {
    marginTop: '1.5rem',
  },
  cancelButton: {
    ...accountTextButton,
    color: 'primary.main',
    '&:hover': { backgroundColor: 'transparent', color: 'primary.main' },
  },
  deleteButton: {
    minHeight: '3rem',
    borderRadius: '0px 18px',
    padding: '0.75rem 1.75rem',
    fontSize: '0.9375rem',
    fontWeight: 700,
    boxShadow: 'none',
    backgroundColor: '#E64C4C',
    color: 'common.white',
    '&:hover': { backgroundColor: '#CF3F3F', boxShadow: 'none' },
  },
}

const AddressRemoveDialog = (props: AddressRemoveDialogProps) => {
  const { customerContact, onConfirm, onClose } = props
  const { t } = useTranslation('common')

  const { firstName, lastNameOrSurname, email, phoneNumbers, address } = customerContact
  const { address1, cityOrTown, stateOrProvince, postalOrZipCode, countryCode } = (address ??
    {}) as CuAddress

  const recipient = [firstName, lastNameOrSurname].filter(Boolean).join(' ')
  const phone = phoneNumbers?.home || phoneNumbers?.work || phoneNumbers?.mobile
  const cityLine = [
    [cityOrTown, stateOrProvince].filter(Boolean).join(', '),
    countryCode,
    postalOrZipCode,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <Dialog open onClose={onClose} PaperProps={{ sx: { ...styles.paper } }}>
      <Typography component="h2" sx={{ ...styles.title }}>
        {t('are-you-sure-you-want-to-remove-this-address')}
      </Typography>

      <Box sx={{ ...styles.summary }}>
        <Typography component="p" sx={{ ...styles.organization }}>
          {getAddressDisplayName(customerContact)}
        </Typography>
        <Typography component="p" sx={{ ...styles.line, fontWeight: 700 }}>
          {recipient}
        </Typography>
        {email && (
          <Typography component="p" sx={{ ...styles.line }}>
            {email}
          </Typography>
        )}
        {phone && (
          <Typography component="p" sx={{ ...styles.line }}>
            {phone}
          </Typography>
        )}
        <Typography component="p" sx={{ ...styles.line }}>
          {address1}
        </Typography>
        <Typography component="p" sx={{ ...styles.mutedLine }}>
          {cityLine}
        </Typography>
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={2}
        sx={{ ...styles.actions }}
      >
        <Button variant="text" sx={{ ...styles.cancelButton }} onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button
          variant="contained"
          disableElevation
          sx={{ ...styles.deleteButton }}
          onClick={onConfirm}
        >
          {t('delete')}
        </Button>
      </Stack>
    </Dialog>
  )
}

export default AddressRemoveDialog
