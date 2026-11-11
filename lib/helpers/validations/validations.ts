export const validatePassword = (password: string) => {
  const isHavingAtLeastEightCharacters: boolean = password.toString().length >= 8
  const isHavingAtLeastOneNumber: boolean = /\d/.test(password)
  const isHavingAtLeastOneCapitalLetter: boolean = /[A-Z]/.test(password)
  const isHavingAtLeastOneSpecialCharacter: boolean = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
    password
  )

  return {
    isHavingAtLeastEightCharacters,
    isHavingAtLeastOneNumber,
    isHavingAtLeastOneCapitalLetter,
    isHavingAtLeastOneSpecialCharacter,
  }
}

export const CARDHOLDER_NAME_MAX_LENGTH = 50

// Must contain at least one letter - rejects names made up of only digits/special characters,
// while still allowing accented characters, spaces, hyphens and apostrophes.
export const isCardholderNameValid = (value: string) => /[A-Za-zÀ-ɏ]/.test(value.trim())

export const isPasswordValid = (password: string) => {
  const {
    isHavingAtLeastEightCharacters,
    isHavingAtLeastOneNumber,
    isHavingAtLeastOneCapitalLetter,
    isHavingAtLeastOneSpecialCharacter,
  } = validatePassword(password)

  return (
    isHavingAtLeastEightCharacters &&
    isHavingAtLeastOneNumber &&
    isHavingAtLeastOneCapitalLetter &&
    isHavingAtLeastOneSpecialCharacter
  )
}
