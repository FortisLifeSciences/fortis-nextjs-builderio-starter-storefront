import { BuilderComponent, builder } from '@builder.io/react'
import '@builder.io/widgets'
import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { InstantSearch, Configure } from 'react-instantsearch-hooks-web'

import ResourcesHitComponent from '@/components/product/ProductHit/resources/ResourcesHitComponent'
import getCategoryTree from '@/lib/api/operations/get-category-tree'
import { productIndex, searchClient } from '@/lib/api/util/algolia'
import type { CategoryTreeResponse } from '@/lib/types'
import type { MetaData, PageWithMetaData } from '@/lib/types'

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

  console.log('pathnameArr', pathnameArr)

  console.log('pathnameArr', pathnameArr?.length)

  let pagename
  if (Array.isArray(pathnameArr) && pathnameArr?.length > 1) {
    pagename = pathnameArr.join('/')
  } else {
    pagename = pathnameArr
  }

  console.log('pagename', pagename)
  // let resourcesPage = false
  // let categoryCode
  // if(pathnameArr?.length === 2){
  //   categoryCode = pathnameArr?.[1]
  //   resourcesPage = true
  // } else if( pathnameArr?.length === 1 && pathnameArr?.[0] === 'resources') {
  //   categoryCode = 'resources'
  //   resourcesPage = true
  // }

  let resourcesPage = false
  let categoryCode = null

  if (Array.isArray(pathnameArr)) {
    if (pathnameArr.length === 2 && pathnameArr[0] === 'resources') {
      categoryCode = pathnameArr[1]
      resourcesPage = true
    } else if (pathnameArr.length === 1 && pathnameArr[0] === 'resources') {
      categoryCode = 'resources'
      resourcesPage = true
    }
  }

  const categoriesTree: CategoryTreeResponse = await getCategoryTree()
  const categoryTopSection = publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection || ''

  const section = await builder
    .get(categoryTopSection, {
      userAttributes: {
        slug: `resources-${categoryCode}`,
        urlPath: `/${pagename}`,
      },
    })
    .toPromise()

  let products = []
  let facets = null

  if (resourcesPage && categoryCode) {
    const result = await productIndex.search('', {
      filters: `category_url:"resources${categoryCode !== 'resources' ? `/${categoryCode}` : ''}"`,
      facets: ['*'],
    })
    products = result.hits
    facets = result.facets
  }

  const page = await builder
    .get(publicRuntimeConfig?.builderIO?.modelKeys?.defaultPage, {
      userAttributes: {
        urlPath: `"/"${pagename}`,
      },
    })
    .toPromise()

  // if (!page) {
  //   return { notFound: true } // This will render `pages/404.tsx`
  // }

  return {
    props: {
      page: page || null,
      metaData: getMetaData(section?.data) || null,
      categoriesTree,
      section: section || null,
      resourcesPage: resourcesPage,
      categoryCode: categoryCode || null,
      facets: facets || null,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const Page = (props: any) => {
  const { page, resourcesPage, section, categoryCode, facets } = props
  const noIndex = page?.data?.noIndex || false

  if (resourcesPage && categoryCode) {
    return (
      <>
        <Head>{noIndex && <meta name="robots" content="noindex,nofollow" />}</Head>
        <BuilderComponent
          model={publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection}
          content={section}
        />
        <InstantSearch searchClient={searchClient} indexName="builder-page">
          <Configure
            {...({
              hitsPerPage: 12,
              filters: `category_url:"${
                categoryCode === 'resources' ? 'resources' : `resources/${categoryCode}`
              }"`,
            } as any)}
          />
          <ResourcesHitComponent categoryCode={categoryCode} facets={facets} />
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
