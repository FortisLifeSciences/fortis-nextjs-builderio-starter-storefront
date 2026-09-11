import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { NextApiRequest } from 'next'

import { categoryTreeDataMock, productSearchResultMock } from '@/__mocks__/stories'
import ProductDetailPage, {
  getStaticPaths,
  getStaticProps,
} from '@/src/pages/product/[productCode]'

import { Product } from '@/lib/gql/types'

const mockCategoryTreeData = categoryTreeDataMock
const mockProduct = productSearchResultMock.items?.[0]
const context = {
  params: {
    productSlug: ['SHOE12'],
  },
  req: {} as NextApiRequest,
  locale: 'mock-locale',
}
let isFallback = false

jest.mock('next/router', () => ({
  useRouter: () => ({
    isFallback: isFallback,
    query: { productSlug: ['SHOE12'] },
    asPath: '/product/SHOE12',
    replace: jest.fn(),
  }),
}))

jest.mock('@/components/layout/Algolia/AlgoliaAutocomplete', () => () => null)

jest.mock('@builder.io/react', () => ({
  BuilderComponent: () => null,
  Builder: { registerComponent: jest.fn() },
  builder: {
    init: jest.fn(),
    get: jest.fn(() => ({ promise: () => Promise.resolve(null) })),
  },
}))

jest.mock('@builder.io/utils', () => ({
  setPixelProperties: jest.fn(),
}))

jest.mock('next-i18next/serverSideTranslations', () => ({
  serverSideTranslations: jest.fn(() => {
    return Promise.resolve({
      _nextI18Next: {
        initialI18nStore: { 'mock-locale': [{}], en: [{}] },
        initialLocale: 'mock-locale',
        userConfig: { i18n: [{}] },
      },
    })
  }),
}))

jest.mock('next/config', () => {
  return () => ({
    publicRuntimeConfig: {
      maxCookieAge: 0,
      productListing: {
        sortOptions: [
          { value: 'Best Match', id: '' },
          { value: 'Price: Low to High', id: 'price asc' },
          { value: 'Price: High to Low', id: 'price desc' },
          { value: 'Latest', id: 'createDate desc' },
          { value: 'Oldest', id: 'createDate asc' },
        ],
        pageSize: 16,
      },
    },
    serverRuntimeConfig: {
      revalidate: 60,
      pageSize: 100,
      cacheKey: 'categoryTree',
      cacheTimeOut: 10000,
    },
  })
})
jest.mock('@/lib/api/operations', () => ({
  getProduct: jest.fn(() => {
    return mockProduct
  }),
  getCategoryTree: jest.fn(() => {
    return mockCategoryTreeData?.categoriesTree?.items
  }),
  getProductSearchVariations: jest.fn(() => Promise.resolve([])),
  configureProduct: jest.fn(() => Promise.resolve(null)),
  getDocumentListDocuments: jest.fn(() => Promise.resolve([])),
  getProductPrice: jest.fn(() => Promise.resolve({ price: { price: 10 } })),
  productSearch: jest.fn(() => {
    return Promise.resolve({
      data: {
        products: {
          items: [
            {
              productCode: 'mocked-productCode-1',
              content: {
                seoFriendlyUrl: 'mocked-seoFriendlyUrl-1',
              },
            },
            {
              productCode: 'mocked-productCode-2',
              content: {
                seoFriendlyUrl: 'mocked-seoFriendlyUrl-2',
              },
            },
          ],
        },
      },
    })
  }),
}))

const ProductDetailTemplateMock = () => <div data-testid="productDetailTemplate-mock" />
jest.mock(
  '@/components/page-templates/ProductDetail/PdpTemplate.tsx',
  () => () => ProductDetailTemplateMock()
)
const ProductDetailSkeletonMock = () => <div data-testid="productDetailSkeleton-mock" />
jest.mock(
  '@/components/page-templates/ProductDetail/ProductDetailSkeleton.tsx',
  () => () => ProductDetailSkeletonMock()
)

describe('[page] Product Details Page', () => {
  // it('should run getStaticProps method', () => {
  //   const response = getStaticProps(context)
  //   expect(response).resolves.toStrictEqual({
  //     props: {
  //       product: mockProduct,
  //       categoriesTree: mockCategoryTreeData.categoriesTree.items,
  //       _nextI18Next: {
  //         initialI18nStore: { 'mock-locale': [{}], en: [{}] },
  //         initialLocale: 'mock-locale',
  //         userConfig: { i18n: [{}] },
  //       },
  //     },
  //     revalidate: 60,
  //   })
  // })

  // it('should run getStaticPaths method', () => {
  //   const response = getStaticPaths()
  //   expect(response).resolves.toStrictEqual({
  //     paths: [
  //       `/product/mocked-seoFriendlyUrl-1/mocked-productCode-1`,
  //       `/product/mocked-seoFriendlyUrl-2/mocked-productCode-2`,
  //     ],
  //     fallback: true,
  //   })
  // })

  it('should render the Fallback page if isFallback is true', () => {
    isFallback = true
    render(<ProductDetailPage product={undefined} relatedProducts={[]} />)

    expect(screen.getByTestId(/productDetailSkeleton-mock/)).toBeVisible()
  })

  it('should render the ProductDetail page template if isFallback is false', () => {
    isFallback = false
    render(<ProductDetailPage product={mockProduct as Product} relatedProducts={[]} />)

    const productDetailTemplate = screen.getByTestId('productDetailTemplate-mock')
    expect(productDetailTemplate).toBeVisible()
  })

  it('should render product content from props without waiting for a client fetch', () => {
    isFallback = false
    render(<ProductDetailPage product={mockProduct as Product} relatedProducts={[]} />)

    expect(screen.getByTestId('productDetailTemplate-mock')).toBeVisible()
    expect(screen.queryByTestId('productDetailSkeleton-mock')).not.toBeInTheDocument()
  })

  it('should return digitalAssets and dehydratedState from getStaticProps', async () => {
    const response: any = await getStaticProps({
      ...context,
      params: { productCode: 'SHOE12' },
    } as any)

    expect(response.props).toHaveProperty('digitalAssets')
    expect(response.props).toHaveProperty('dehydratedState')
  })
})
