const getProductSearchVariationsQuery = /* GraphQL */ `
  query ProductSearch($filter: String) {
    products: productSearch(filter: $filter, pageSize: 200) {
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
          salePrice
        }
        inventoryInfo {
          onlineStockAvailable
          outOfStockBehavior
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
