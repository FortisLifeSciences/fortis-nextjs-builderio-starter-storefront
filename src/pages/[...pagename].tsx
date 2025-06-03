import { BuilderComponent, builder } from '@builder.io/react'
import '@builder.io/widgets'
import getConfig from 'next/config'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { InstantSearch, Configure } from 'react-instantsearch-hooks-web'

import ResourcesHitComponent from '@/components/product/ProductHit/resources/ResourcesHitComponent'
import getCategoryTree from '@/lib/api/operations/get-category-tree'
import { productIndex, searchClient } from '@/lib/api/util/algolia'
import type { CategoryTreeResponse } from '@/lib/types'
import type { MetaData } from '@/lib/types'

import type { GetServerSidePropsContext } from 'next'

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)

function getMetaData(data: any): MetaData {
  return {
    title: data?.title || null,
    description: data?.description || null,
    keywords: data?.metaTagKeywords || null,
    canonicalUrl: null,
    robots: null,
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale } = context
  const pathnameArr = context.params?.pagename

  let pagename
  if (Array.isArray(pathnameArr) && pathnameArr?.length > 1) {
    pagename = pathnameArr.join('/')
  } else {
    pagename = pathnameArr
  }

  let resourcesPage = false
  let resourceCategoryCode = null
  const pathLength = pathnameArr?.length

  if (Array.isArray(pathnameArr)) {
    if (pathLength === 2 && pathnameArr[0] === 'resources') {
      resourceCategoryCode = pathnameArr[1]
      resourcesPage = true
    } else if (
      pathLength === 1 &&
      (pathnameArr[0] === 'resources' ||
        pathnameArr[0] === 'protocols' ||
        pathnameArr[0] === 'services' ||
        pathnameArr[0] === 'general')
    ) {
      resourceCategoryCode = pathnameArr[0]
      resourcesPage = true
    }
  }

  const categoriesTree: CategoryTreeResponse = await getCategoryTree()
  const categoryTopSection = publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection || ''

  let section = []
  let page
  let products
  let facets

  if (resourcesPage && resourceCategoryCode) {
    const result = await productIndex.search('', {
      filters: `category_url:"${
        pathLength === 1
          ? resourceCategoryCode
          : pathnameArr?.[0] === 'resources'
          ? `resources/${resourceCategoryCode}`
          : ''
      }"`,
      facets: ['*'],
    })
    products = result.hits
    facets = result.facets

    section = await builder
      .get(categoryTopSection, {
        userAttributes: {
          slug:
            pathnameArr?.[0] === 'resources'
              ? `resources-${resourceCategoryCode}`
              : `${resourceCategoryCode}`,
          urlPath: `/${pagename}`,
        },
      })
      .toPromise()
  } else {
    page = await builder
      .get(publicRuntimeConfig?.builderIO?.modelKeys?.defaultPage, {
        userAttributes: {
          urlPath: `/${pagename}`,
        },
      })
      .toPromise()

    if (!page) {
      return { notFound: true } // This will render `pages/404.tsx`
    }
  }

  return {
    props: {
      page: page || null,
      metaData: getMetaData(section?.data) || null,
      categoriesTree: categoriesTree || null,
      section: section || null,
      resourcesPage: resourcesPage,
      resourceCategoryCode: resourceCategoryCode || null,
      facets: facets || null,
      pathLength,
      urlFirstPart: pathnameArr?.[0] || null,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const Page = (props: any) => {
  const { page, resourcesPage, section, resourceCategoryCode, facets, pathLength, urlFirstPart } =
    props
  const noIndex = page?.data?.noIndex
    ? page?.data?.noIndex
    : section?.data?.noIndex
    ? section?.data?.noIndex
    : false

  if (resourcesPage && resourceCategoryCode) {
    return (
      <>
        <Head>{noIndex && <meta name="robots" content="noindex,nofollow" />}</Head>
        <BuilderComponent
          model={publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection}
          content={section}
        />
        <InstantSearch searchClient={searchClient} indexName="builder-page_newest-first">
          <Configure
            {...({
              hitsPerPage: 15,
              filters: `category_url:"${
                pathLength === 1
                  ? resourceCategoryCode
                  : urlFirstPart === 'resources'
                  ? `resources/${resourceCategoryCode}`
                  : ''
              }"`,
            } as any)}
          />
          <ResourcesHitComponent categoryCode={resourceCategoryCode} facets={facets} />
        </InstantSearch>
      </>
    )
  }

  return (
    <>
      <Head>{noIndex && <meta name="robots" content="noindex,nofollow" />}</Head>
      <div>
        <BuilderComponent
          model={publicRuntimeConfig?.builderIO?.modelKeys?.defaultPage}
          content={page}
        />
      </div>
    </>
  )
}

export default Page
