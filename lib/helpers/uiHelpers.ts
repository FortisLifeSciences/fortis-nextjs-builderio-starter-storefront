import {
  buildCategoryPathByCode,
  buildProductPathByCode,
  buildProductSeoPathByCode,
} from './buildStorefrontUrls'
import { Product } from '../gql/types'
interface UIHelpersType {
  getCategoryLink: (category?: string, seoFriendlyUrl?: string) => string
  getProductLink: (productCode?: string, seoFriendlyUrl?: string) => string
  getProductSeoLink: (Product?: Product) => string
}

export const uiHelpers = (): UIHelpersType => {
  const getCategoryLink = (categoryCode?: string, seoFriendlyUrl?: string): string =>
    buildCategoryPathByCode(categoryCode as string)
  const getProductLink = (productCode?: string, seoFriendlyUrl?: string) =>
    buildProductPathByCode(productCode as string)
  const getProductSeoLink = (product?: Product, seoFriendlyUrl?: string) =>
    buildProductSeoPathByCode(product as Product)
  return {
    getCategoryLink,
    getProductLink,
    getProductSeoLink,
  }
}
