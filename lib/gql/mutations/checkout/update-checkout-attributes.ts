const updateOrderAttributes = /* GraphQL */ `
  mutation updateOrderAttributes(
    $orderId: String!
    $removeMissing: Boolean
    $orderAttributeInput: [CrOrderAttributeInput]
  ) {
    updateOrderAttributes(
      orderId: $orderId
      removeMissing: $removeMissing
      orderAttributeInput: $orderAttributeInput
    ) {
      fullyQualifiedName
      attributeDefinitionId
      values
    }
  }
`

export default updateOrderAttributes
