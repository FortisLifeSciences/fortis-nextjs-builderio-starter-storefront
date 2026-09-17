import React, { useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, NoSsr, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

import SavedCardRow from './SavedCardRow'
import { ConfirmationDialog } from '@/components/dialogs'
import { PaymentMethod } from '@/components/my-account'
import {
  AccountPageHeader,
  AccountSectionCard,
  accountActionButton,
  accountType,
} from '@/components/my-account/common'
import { useModalContext } from '@/context'
import { useDeleteCustomerCard, useDeleteCustomerAddress, useUpdateCustomerCard } from '@/hooks'
import { DisplayMode } from '@/lib/constants'
import { cardGetters, userGetters } from '@/lib/getters'
import { actions, hasPermission } from '@/lib/helpers'
import type { BillingAddress, CardType, PaymentAndBilling, SavedCard } from '@/lib/types'

import type { CardCollection, CustomerAccount, CustomerContactCollection } from '@/lib/gql/types'

interface PaymentTemplateProps {
  user: CustomerAccount
  cards: CardCollection
  contacts: CustomerContactCollection
  onSave: (address: BillingAddress, card: CardType, isUpdatingAddress: boolean) => void
}

const styles = {
  addButton: accountActionButton,
  emptyState: {
    ...accountType.body,
    color: 'text.secondary',
  },
  formPanel: {
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: '0.5rem',
    padding: '1.25rem',
    marginTop: '0.75rem',
  },
  formTitle: {
    ...accountType.cardTitle,
    fontWeight: 700,
    marginBottom: '1rem',
  },
}

const PaymentTemplate = (props: PaymentTemplateProps) => {
  const { user, cards, contacts, onSave } = props
  const { t } = useTranslation('common')

  const { showModal, closeModal } = useModalContext()
  const { deleteCustomerCard } = useDeleteCustomerCard()
  const { deleteCustomerAddress } = useDeleteCustomerAddress()
  const { updateCustomerCard } = useUpdateCustomerCard()

  const [isFormOpen, setIsFormOpen] = useState(false)

  const savedCardsAndContacts = userGetters.getSavedCardsAndBillingDetails(cards, contacts)

  const handleDelete = async (card: SavedCard) => {
    try {
      if (card.contactId) {
        await deleteCustomerAddress.mutateAsync({
          accountId: user.id,
          contactId: card.contactId,
        })
      }
      await deleteCustomerCard.mutateAsync({ accountId: user.id, cardId: card.id as string })
      closeModal()
    } catch (error) {
      console.error('Error: delete saved card', error)
    }
  }

  const handleConfirmDelete = (card: SavedCard) => {
    showModal({
      Component: ConfirmationDialog,
      props: {
        onConfirm: () => handleDelete(card),
        contentText: t('delete-confirmation-text'),
        primaryButtonText: t('delete'),
      },
    })
  }

  const handleSetAsPrimary = async (paymentAndBilling: PaymentAndBilling) => {
    const { cardInfo } = paymentAndBilling
    const cardId = cardGetters.getCardId(cardInfo)

    try {
      await updateCustomerCard.mutateAsync({
        accountId: user.id,
        cardId,
        cardInput: {
          id: cardId,
          contactId: cardInfo?.contactId as number,
          cardType: cardGetters.getCardType(cardInfo),
          cardNumberPart: cardGetters.getCardNumberPart(cardInfo),
          expireMonth: cardGetters.getExpireMonth(cardInfo),
          expireYear: cardGetters.getExpireYear(cardInfo),
          isDefaultPayMethod: true,
        },
      })
    } catch (error) {
      console.error('Error: set primary card', error)
    }
  }

  const handleSave = (address: BillingAddress, card: CardType, isUpdatingAddress: boolean) => {
    onSave(address, card, isUpdatingAddress)
    setIsFormOpen(false)
  }

  const canEdit = hasPermission(actions.EDIT_PAYMENTS)
  const canDelete = hasPermission(actions.DELETE_PAYMENTS)

  return (
    <>
      <AccountPageHeader title={String(t('payment'))} />

      <AccountSectionCard
        title={String(t('saved-cards'))}
        action={
          !isFormOpen && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ ...styles.addButton }}
              onClick={() => setIsFormOpen(true)}
            >
              {t('add-new-card')}
            </Button>
          )
        }
      >
        <NoSsr>
          {!hasPermission(actions.VIEW_PAYMENTS) && (
            <Typography sx={{ ...styles.emptyState }}>
              {t('not-authorized-payment-information')}
            </Typography>
          )}

          {hasPermission(actions.VIEW_PAYMENTS) && (
            <>
              {!savedCardsAndContacts?.length && !isFormOpen && (
                <Typography sx={{ ...styles.emptyState }}>{t('no-saved-payments-yet')}</Typography>
              )}

              {savedCardsAndContacts?.map((each: PaymentAndBilling) => (
                <SavedCardRow
                  key={cardGetters.getCardId(each?.cardInfo)}
                  paymentAndBilling={each}
                  actions={[
                    {
                      id: 'set-as-primary',
                      label: String(t('set-as-primary')),
                      onClick: () => handleSetAsPrimary(each),
                      disabled: !canEdit || cardGetters.getIsDefaultPayMethod(each?.cardInfo),
                    },
                    {
                      id: 'remove',
                      label: String(t('remove')),
                      onClick: () => handleConfirmDelete(each?.cardInfo as SavedCard),
                      destructive: true,
                      disabled: !canDelete,
                    },
                  ]}
                />
              ))}

              {isFormOpen && (
                <Box sx={{ ...styles.formPanel }}>
                  <Typography component="h3" sx={{ ...styles.formTitle }}>
                    {t('card-details')}
                  </Typography>
                  <PaymentMethod
                    user={user}
                    cards={cards}
                    contacts={contacts}
                    displayMode={DisplayMode.ADDNEW}
                    onSave={handleSave}
                    onClose={() => setIsFormOpen(false)}
                  />
                </Box>
              )}
            </>
          )}
        </NoSsr>
      </AccountSectionCard>
    </>
  )
}

export default PaymentTemplate
