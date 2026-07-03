const getProductVariationQuery = /* GraphQL */ `
  query getProduct($productCode: String!, $variationProductCode: String!) {
    product(productCode: $productCode, variationProductCode: $variationProductCode) {
      variationProductCode
      price {
        price
      }
      inventoryInfo {
        onlineStockAvailable
        outOfStockBehavior
      }
      properties {
        attributeFQN
        attributeDetail {
          name
        }
        isHidden
        values {
          value
          stringValue
        }
      }
      options {
        attributeFQN
        attributeDetail {
          name
          inputType
        }
        isProductImageGroupSelector
        isRequired
        isMultiValue
        values {
          value
          isSelected
          isEnabled
          deltaPrice
          stringValue
        }
      }
    }
  }
`
export default getProductVariationQuery
