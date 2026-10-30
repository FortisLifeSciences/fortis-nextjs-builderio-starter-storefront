import creditCardType from 'credit-card-type'

import AMEX from '@/assets/american-express.png'
import DEFAULT from '@/assets/default-card.png'
import DISCOVER from '@/assets/discover.png'
import JCB from '@/assets/jcb.png'
import MASTERCARD from '@/assets/mastercard.png'
import VISA from '@/assets/visa.png'
import type { CardForm } from '@/lib/types'

export const prepareCardDataParams = (props: CardForm) => {
  const { cardNumber, expiryDate, cvv } = props
  const cardType =
    props.cardType ?? creditCardType(cardNumber as string)?.[0]?.niceType.toUpperCase() ?? ''
  const expiryMonth = expiryDate?.split('/')[0]
  const expiryYear = expiryDate?.split('/')[1]

  return {
    cardNumber: cardNumber,
    cvv: cvv,
    cardType: cardType,
    expireMonth: Number(expiryMonth),
    expireYear: Number(expiryYear),
  }
}

export const getCreditCardLogo = (name: string): any => {
  const logos: any = {
    DISCOVER: DISCOVER,
    JCB: JCB,
    MC: MASTERCARD,
    VISA: VISA,
    AMEX: AMEX,
  }
  return logos[name] || DEFAULT
}

export const validateExpiryDate = (validExpiryDate: string | undefined) => {
  if (validExpiryDate === undefined) return false

  const monthYear = validExpiryDate.split('/')
  const month = parseInt(monthYear[0])
  const year = parseInt(monthYear[1])
  const currentDate = new Date()
  const someDay = new Date()
  someDay.setFullYear(year, month, 1)
  return someDay >= currentDate
}

export const isCardNumberValid = (cardNumber: string | undefined) => {
  if (cardNumber === undefined) return false

  const cardDetails = creditCardType(cardNumber)
  return (
    cardDetails.length !== 0 &&
    cardDetails[0].lengths.includes(cardNumber.length) &&
    passesLuhnCheck(cardNumber)
  )
}

export const passesLuhnCheck = (cardNumber: string) => {
  if (!/^\d+$/.test(cardNumber)) return false

  let sum = 0
  for (let i = 0; i < cardNumber.length; i++) {
    let digit = Number(cardNumber[cardNumber.length - 1 - i])
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

export const getCvvLength = (cardNumber: string | undefined) => {
  if (!cardNumber) return undefined
  return creditCardType(cardNumber)[0]?.code.size
}

export const isCardTypeValid = (cardNumber: string | undefined) => {
  if (!cardNumber) return false
  const supportedCards: any = {
    DISCOVER: DISCOVER,
    JCB: JCB,
    MC: MASTERCARD,
    VISA: VISA,
    AMEX: AMEX,
  }
  return Boolean(supportedCards[creditCardType(cardNumber)[0]?.niceType.toUpperCase()])
}

export const isCardExpired = (expireMonth: number, expireYear: number): boolean => {
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  return expireYear < currentYear || (expireYear === currentYear && expireMonth < currentMonth)
}
