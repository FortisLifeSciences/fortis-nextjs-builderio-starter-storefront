import { BuilderComponent, builder, Builder } from '@builder.io/react'
import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { ProductDetailTemplate, ProductDetailSkeleton } from '@/components/page-templates'
import { ProductRecommendations } from '@/components/product'
import { useGetProduct } from '@/hooks/queries/product/useGetProduct/useGetProduct'
import {
  getProduct,
  getCategoryTree,
  productSearch,
  getProductSearchVariations,
} from '@/lib/api/operations'
import { productGetters } from '@/lib/getters'
import { buildProductPath, uiHelpers } from '@/lib/helpers'
import type { CategorySearchParams, MetaData, PageWithMetaData, ProductCustom } from '@/lib/types'
import { generateSchemaMarkups, renderSchemaMarkup } from '@/lib/utils/generate-schema-markup'

import { PrCategory, Product } from '@/lib/gql/types'
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from 'next'

const { serverRuntimeConfig } = getConfig()

interface ProductPageType extends PageWithMetaData {
  categoriesTree?: PrCategory[]
  product?: Product
  relatedProducts: any
  productVariations?: Product[]
  section?: any
  PDPCustomAndBulkDisplayContentSection?: any
  PDPCustomAndBulkDisplaySectionKey?: string
}

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey
const { getProductLink, getProductSeoLink } = uiHelpers()
builder.init(apiKey)

Builder.registerComponent(ProductRecommendations, {
  name: 'ProductRecommendations',
  inputs: [
    {
      name: 'title',
      type: 'string',
    },
    {
      name: 'productCodes',
      type: 'KiboCommerceProductsList',
    },
  ],
})

function getMetaData(product: Product): MetaData {
  const categoryCode = product?.categories?.[0]?.categoryCode || ''
  const productSlug = product?.content?.seoFriendlyUrl?.replace(/^\/+/, '') || ''
  const parentProductCode = product?.productCode || ''
  return {
    title: product?.content?.metaTagTitle || null,
    description: product?.content?.metaTagDescription || null,
    keywords: product?.content?.metaTagKeywords || null,
    canonicalUrl:
      `${
        publicRuntimeConfig?.baseUrl || 'https://www.fortislife.com/'
      }products/${categoryCode}/${productSlug}/${parentProductCode}` || null,
    robots: null,
  }
}

export async function getStaticProps(
  context: GetStaticPropsContext
): Promise<GetStaticPropsResult<any>> {
  const { locale, params } = context
  const { productCode } = params as any
  // console.log('productCode in getstaticprops', productCode)
  let product = null
  try {
    product = await getProduct(productCode)
  } catch (error) {
    console.error(`Failed to fetch product: ${productCode}`, error)
  }
  // console.log('product api call returns product in getstaticprops as:', product)
  const variantCodes = product?.variations
  const relatedProducts = []
  const relatedProductData =
    product && product.properties
      ? product.properties.find((item: any) => item?.attributeFQN === 'tenant~related-products')
          ?.values?.[0]?.stringValue
      : null
  if (relatedProductData) {
    const relatedProductCodes = relatedProductData?.split('|')
    for (const data of relatedProductCodes) {
      const product = await getProduct(data)
      if (product) {
        const productData = {
          productCode: product?.productCode,
          categoryCode: product?.categories[0]?.categoryCode,
          seoFriendlyUrl: product?.content?.seoFriendlyUrl,
          title: product?.content?.productName,
          productImages: product?.content?.productImages,
          brand: (product?.properties?.find(
            (item: any) => item?.attributeFQN === publicRuntimeConfig.brandAttrName
          )).values[0],
          pData: product,
          plpCatalogNumber:
            product?.properties?.find(
              (item: any) => item?.attributeFQN?.toLowerCase() === 'tenant~plp-catalog-number'
            )?.values?.[0]?.stringValue || '',
        }
        relatedProducts.push(productData)
      } else {
        console.warn(`No product found for code: ${data}`)
      }
    }
  }

  let productVariations = []
  try {
    productVariations = await getProductSearchVariations(productCode, variantCodes)
  } catch (error) {
    console.error(`Failed to fetch variations for: ${productCode} in getstaticprops`, error)
    return { notFound: true }
  }

  const categoriesTree = await getCategoryTree()

  if (!product) {
    return { notFound: true }
  }
  if (!productVariations) {
    return { notFound: true }
  }

  //This is to use custom targeting with section model Ref: WEB-981
  const targetingBrandName = productCode.split('-')[0].toLowerCase()

  const pdpBuilderSectionKey = publicRuntimeConfig?.builderIO?.modelKeys?.productDetailSection || ''
  let section = null
  let PDPCustomAndBulkDisplayContentSection = null
  try {
    section = await builder
      .get(pdpBuilderSectionKey, { userAttributes: { slug: `product-${productCode}` } })
      .promise()
  } catch (error) {
    console.error(`Failed to fetch Builder section for ${productCode}:`, error)
    section = null
  }

  const PDPCustomAndBulkDisplaySectionKey =
    publicRuntimeConfig?.builderIO?.modelKeys?.PDPCustomAndBulkDisplaySection || ''
  try {
    PDPCustomAndBulkDisplayContentSection = await builder
      .get(PDPCustomAndBulkDisplaySectionKey, {
        userAttributes: {
          brand: [targetingBrandName],
        },
      })
      .promise()
  } catch (error) {
    console.error(`Failed to fetch Builder custom section for ${targetingBrandName}:`, error)
    PDPCustomAndBulkDisplayContentSection = null
  }

  return {
    props: {
      product,
      productVariations,
      metaData: getMetaData(product),
      categoriesTree,
      section: section || null,
      PDPCustomAndBulkDisplayContentSection: PDPCustomAndBulkDisplayContentSection || null,
      PDPCustomAndBulkDisplaySectionKey: PDPCustomAndBulkDisplaySectionKey || '',
      relatedProducts,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
    revalidate: parseInt(serverRuntimeConfig.revalidate),
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const { serverRuntimeConfig } = getConfig()
  const { staticPathsMaxSize } = serverRuntimeConfig?.pageConfig?.productDetail || {}
  const searchResult = await productSearch({
    pageSize: parseInt(staticPathsMaxSize),
  } as CategorySearchParams)
  const items = searchResult?.data?.products?.items || []
  const paths: string[] = items.map(buildProductPath)
  return { paths, fallback: 'blocking' }
}

const ProductDetailPage: NextPage<ProductPageType> = (props) => {
  const {
    product,
    productVariations,
    relatedProducts,
    PDPCustomAndBulkDisplayContentSection,
    PDPCustomAndBulkDisplaySectionKey,
  } = props

  // const metaSource = (props.metaData || product || {}) as Record<string, unknown>
  const metaTitle = props?.metaData?.title || product?.content?.metaTagTitle
  const metaDescription = props?.metaData?.description || product?.content?.metaTagDescription
  const router = useRouter()
  const { isFallback, query } = router

  const {
    data: productResponseData,
    isLoading: isProductLoading,
    queryParams: queryParams,
  } = useGetProduct(query)

  const { sliceValue } = queryParams
  const { selected } = queryParams

  if (isFallback || isProductLoading) {
    return <ProductDetailSkeleton />
  }
  const pdpBuilderSectionKey = publicRuntimeConfig?.builderIO?.modelKeys?.productDetailSection || ''
  const breadcrumbs = product ? productGetters.getBreadcrumbs(product) : []

  const baseUrl = (publicRuntimeConfig?.baseUrl || 'https://www.fortislife.com/').replace(/\/$/, '')

  const brandValue = product?.properties?.find(
    (prop: any) => prop?.attributeFQN?.toLowerCase() === publicRuntimeConfig?.brandAttrName
  )?.values?.[0]?.stringValue

  const schemaJson = product
    ? generateSchemaMarkups({
        product,
        breadcrumbs,
        productVariations,
        baseUrl,
        organizationConfig: {
          name: 'Fortis Life Sciences',
          url: baseUrl,
          logo: `${baseUrl}/fortis-logo.png`,
        },
        brandConfig: {
          name: brandValue || 'Fortis Life Sciences',
          logo: `${baseUrl}/fortis-logo.png`,
        },
      })
    : ''

  console.log('Generated schema markup:', schemaJson)
  return (
    <>
      <Head>
        {/* marker to indicate server-side page meta is present */}
        {/* {metaTitle && <meta name="ssr-meta" data-ssr-meta="true" content="true" />} */}
        {metaTitle && <title>{metaTitle}</title>}
        {metaDescription && <meta name="description" content={metaDescription} />}
        {/* {metaKeywords && <meta name="keywords" content={metaKeywords} />}
        {metaImage && <meta property="og:image" content={metaImage} />} */}
        {metaTitle && <meta property="og:title" content={metaTitle} />}
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        {props?.metaData?.canonicalUrl && (
          <link rel="canonical" href={props.metaData.canonicalUrl} key="canonical" />
        )}
        {schemaJson && renderSchemaMarkup(schemaJson)}
      </Head>
      {productResponseData ? (
        <ProductDetailTemplate
          product={{ ...product, ...productResponseData }}
          productVariations={productVariations}
          relatedProducts={relatedProducts}
          breadcrumbs={breadcrumbs}
          sliceValue={sliceValue}
          selectedUrlVariant={selected}
          PDPCustomAndBulkDisplayContentSection={PDPCustomAndBulkDisplayContentSection}
          PDPCustomAndBulkDisplaySectionKey={PDPCustomAndBulkDisplaySectionKey}
        >
          <BuilderComponent model={pdpBuilderSectionKey} content={props.section} />
        </ProductDetailTemplate>
      ) : (
        <ProductDetailSkeleton />
      )}
    </>
  )
}

export default ProductDetailPage
