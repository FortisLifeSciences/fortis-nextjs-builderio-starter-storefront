import { getCvvLength, isCardNumberValid, passesLuhnCheck } from '../credit-card'

describe('[helpers] credit card validation', () => {
  it('should accept numbers that pass the Luhn check', () => {
    expect(passesLuhnCheck('4111111111111111')).toBe(true)
    expect(passesLuhnCheck('378282246310005')).toBe(true)
  })

  it('should reject numbers that fail the Luhn check', () => {
    expect(passesLuhnCheck('4111111111111112')).toBe(false)
    expect(passesLuhnCheck('4111-1111-1111-1111')).toBe(false)
  })

  it('should reject a mistyped card number with a valid length', () => {
    expect(isCardNumberValid('4111111111111111')).toBe(true)
    expect(isCardNumberValid('4111111111111112')).toBe(false)
  })

  it('should return the CVV length for the card brand', () => {
    expect(getCvvLength('4111111111111111')).toBe(3)
    expect(getCvvLength('378282246310005')).toBe(4)
    expect(getCvvLength(undefined)).toBeUndefined()
  })
})
