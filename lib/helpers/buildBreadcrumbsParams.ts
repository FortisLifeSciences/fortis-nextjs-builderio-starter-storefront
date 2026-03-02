import type { PrCategory } from '../gql/types'
import type { BreadCrumb } from '../types'

const buildBreadcrumbsList = (rootCat: PrCategory, bc: BreadCrumb[]): BreadCrumb[] => {
  //parent category condition checked for link
  const newBc = [
    ...bc,
    {
      text: rootCat.content?.name,
      link: rootCat.parentCategory
        ? `${rootCat.parentCategory.categoryCode}/${rootCat.categoryCode}`
        : rootCat.categoryCode,
      seoFriendlyUrl: `${rootCat.content?.slug}`,
    },
  ]
  return rootCat.parentCategory ? buildBreadcrumbsList(rootCat.parentCategory, newBc) : newBc
}

export const buildBreadcrumbsParams = (rootCat: PrCategory) =>
  buildBreadcrumbsList(rootCat, []).reverse()
