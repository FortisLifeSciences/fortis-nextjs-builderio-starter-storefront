import { userGetters } from '../userGetters'
import { customerB2BUserForPage0Mock } from '@/__mocks__/stories'

import type { CardCollection, CustomerContactCollection } from '@/lib/gql/types'

const emailAddress = customerB2BUserForPage0Mock?.items?.[0]?.emailAddress
const firstName = customerB2BUserForPage0Mock?.items?.[0]?.firstName
const lastName = customerB2BUserForPage0Mock?.items?.[0]?.lastName
const isActive = customerB2BUserForPage0Mock?.items?.[0]?.isActive
const role = customerB2BUserForPage0Mock?.items?.[0]?.roles?.[0]?.roleName

describe('[getters] userGetters', () => {
  it('should return email address', () => {
    expect(userGetters.getEmailAddress(customerB2BUserForPage0Mock?.items?.[0])).toEqual(
      emailAddress
    )
  })

  it('should return first name', () => {
    expect(userGetters.getFirstName(customerB2BUserForPage0Mock?.items?.[0])).toEqual(firstName)
  })

  it('should return last name', () => {
    expect(userGetters.getLastName(customerB2BUserForPage0Mock?.items?.[0])).toEqual(lastName)
  })

  it('should return status', () => {
    expect(userGetters.getStatus(customerB2BUserForPage0Mock?.items?.[0])).toEqual(isActive)
  })

  it('should return role', () => {
    expect(userGetters.getRole(customerB2BUserForPage0Mock?.items?.[0])).toEqual(role)
  })

  describe('getSavedCardsAndBillingDetails', () => {
    const address = {
      address1: '9 Billing Road',
      cityOrTown: 'Boston',
      stateOrProvince: 'MA',
      postalOrZipCode: '02101',
      countryCode: 'US',
      addressType: 'Commercial',
      isValidated: true,
    }
    const billingContact = {
      id: 1,
      accountId: 1001,
      label: 'Head office',
      types: [{ name: 'Billing', isPrimary: true }],
      firstName: 'Jane',
      middleNameOrInitial: 'Q',
      lastNameOrSurname: 'Doe',
      companyOrOrganization: 'Acme Labs',
      email: 'jane@example.com',
      phoneNumbers: { home: '5555555555', mobile: null, work: null },
      address,
    }
    const cardCollection = {
      items: [
        {
          id: 'card-1',
          contactId: 1,
          cardNumberPart: '************4242',
          cardType: 'VISA',
          expireMonth: 12,
          expireYear: 2099,
        },
        {
          id: 'card-2',
          contactId: 99,
          cardNumberPart: '************1111',
          cardType: 'MC',
          expireMonth: 1,
          expireYear: 2099,
        },
      ],
    } as CardCollection
    const contactCollection = { items: [billingContact] } as CustomerContactCollection

    it('should keep only the contact fields a payment billing contact accepts', () => {
      const [savedCard] = userGetters.getSavedCardsAndBillingDetails(
        cardCollection,
        contactCollection
      )

      expect(savedCard.billingAddressInfo?.contact).toStrictEqual({
        id: 1,
        firstName: 'Jane',
        middleNameOrInitial: 'Q',
        lastNameOrSurname: 'Doe',
        companyOrOrganization: 'Acme Labs',
        email: 'jane@example.com',
        phoneNumbers: { home: '5555555555', mobile: null, work: null },
        address,
      })
    })

    it('should return an empty contact when the card has no saved billing address', () => {
      const [, cardWithoutContact] = userGetters.getSavedCardsAndBillingDetails(
        cardCollection,
        contactCollection
      )

      expect(cardWithoutContact.billingAddressInfo?.contact).toStrictEqual({})
    })
  })
})
