export const categoryInfo = /* GraphQL */ `
  fragment categoryInfo on PrCategory {
    count
    categoryId
    categoryCode
    isDisplayed
    updateDate
    content {
      name
      slug
      description
      metaTagTitle
      metaTagDescription
      metaTagKeywords
      categoryImages {
        imageUrl
        cmsId
        altText
      }
    }
  }
`
