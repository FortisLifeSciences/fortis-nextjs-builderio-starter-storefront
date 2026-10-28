const getVariationPricesQuery = (variationCount: number) => {
  const indexes = Array.from({ length: variationCount }, (_, index) => index)
  const variableDefinitions = indexes.map((index) => `$v${index}: String!`).join(', ')
  const fields = indexes
    .map(
      (index) => `
    v${index}: product(productCode: $productCode, variationProductCode: $v${index}) {
      variationProductCode
      price {
        price
        salePrice
      }
    }`
    )
    .join('')

  return /* GraphQL */ `
  query getVariationPrices($productCode: String!, ${variableDefinitions}) {${fields}
  }
`
}

export default getVariationPricesQuery
