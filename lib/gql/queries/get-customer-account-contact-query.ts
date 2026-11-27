const getCustomerAccountContactQuery = /* GraphQL */ `
  query GetCustomerAccountContact($accountId: Int!, $contactId: Int!) {
    customerAccountContact(accountId: $accountId, contactId: $contactId) {
      accountId
      id
      types {
        name
        isPrimary
      }
      faxNumber
      label
      email
      firstName
      middleNameOrInitial
      lastNameOrSurname
      companyOrOrganization
      phoneNumbers {
        home
        mobile
        work
      }
      address {
        address1
        address2
        address3
        address4
        cityOrTown
        stateOrProvince
        postalOrZipCode
        countryCode
        addressType
        isValidated
      }
      auditInfo {
        createDate
        updateDate
        createBy
        updateBy
      }
    }
  }
`

export default getCustomerAccountContactQuery
