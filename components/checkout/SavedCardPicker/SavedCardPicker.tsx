import React from 'react'

import CreditCardIcon from '@mui/icons-material/CreditCard'
import { Stack } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { ChoiceCard } from '@/components/checkout'
import { isCardExpired } from '@/lib/helpers'
import type { PaymentAndBilling } from '@/lib/types'

export const NEW_CARD_OPTION = 'new-card'

const cardTypeNames: Record<string, string> = {
  VISA: 'Visa',
  MC: 'Mastercard',
  MASTERCARD: 'Mastercard',
  AMEX: 'Amex',
  DISCOVER: 'Discover',
  JCB: 'JCB',
}

export const getCardTypeName = (cardType?: string) =>
  cardTypeNames[cardType?.toUpperCase() ?? ''] ?? cardType ?? ''

export const isSavedCardExpired = (card: PaymentAndBilling) =>
  isCardExpired(card.cardInfo?.expireMonth as number, card.cardInfo?.expireYear as number)

export interface SavedCardPickerProps {
  cards: PaymentAndBilling[]
  selectedCardId: string
  onSelect: (cardId: string) => void
}

const SavedCardPicker = ({ cards, selectedCardId, onSelect }: SavedCardPickerProps) => {
  const { t } = useTranslation('common')

  return (
    <Stack gap={1.5} data-testid="saved-card-picker">
      {cards.map((card) => {
        const cardId = card.cardInfo?.id as string
        const expired = isSavedCardExpired(card)
        const expireMonth = String(card.cardInfo?.expireMonth ?? '').padStart(2, '0')
        const expireYear = String(card.cardInfo?.expireYear ?? '').slice(-2)
        return (
          <ChoiceCard
            key={cardId}
            testId={`saved-card-${cardId}`}
            icon={<CreditCardIcon />}
            selected={selectedCardId === cardId}
            onClick={() => onSelect(cardId)}
            primary={card.cardInfo?.isDefaultPayMethod}
            disabled={expired}
            title={t('card-ending-in-number', {
              cardType: getCardTypeName(card.cardInfo?.cardType),
              last4: card.cardInfo?.cardNumberPart?.slice(-4),
            })}
            subtitle={t('card-expires-on', { date: `${expireMonth}/${expireYear}` })}
            errorText={expired ? t('card-expired') : undefined}
          />
        )
      })}
      <ChoiceCard
        selected={selectedCardId === NEW_CARD_OPTION}
        onClick={() => onSelect(NEW_CARD_OPTION)}
        addNew
      />
    </Stack>
  )
}

export default SavedCardPicker
