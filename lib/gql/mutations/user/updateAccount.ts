export const updateCustomerData = /* GraphQL */ `
  mutation updateCustomerData($accountId: Int!, $customerAccountInput: CustomerAccountInput) {
    updateCustomerAccount(accountId: $accountId, customerAccountInput: $customerAccountInput) {
      firstName
      lastName
      emailAddress
      attributes {
        fullyQualifiedName
        values
      }
    }
  }
`
