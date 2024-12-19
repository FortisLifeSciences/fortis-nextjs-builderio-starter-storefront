const createOrderAttribute = /* GraphQL */ `
  mutation createOrderAttribute($orderId: String!, $orderAttributeInput: [CrOrderAttributeInput]) {
    createOrderAttribute(orderId: $orderId, orderAttributeInput: $orderAttributeInput) {
      fullyQualifiedName
      attributeDefinitionId
      values
    }
  }
`

export default createOrderAttribute
