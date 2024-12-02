const getProductSearchVariationsQuery = /* GraphQL */ `
  query ProductSearch($filter: String) {
    products: productSearch(filter: $filter) {
      items {
        variationProductCode
        options {
          values {
            value
            stringValue
            isSelected
          }
        }
        sliceValue
        price {
          price
        }
        properties {
          attributeFQN
          values {
            value
          }
        }
      }
    }
  }
`

export default getProductSearchVariationsQuery
