const getCurrentUser = /* GraphQL */ `
  query getUser {
    customerAccount: getCurrentAccount {
      id
      userId
      firstName
      lastName
      emailAddress
      userName
      isAnonymous
      companyOrOrganization
      accountType
      companyOrOrganization
      attributes {
        fullyQualifiedName
        values
      }
    }
  }
`

export default getCurrentUser
