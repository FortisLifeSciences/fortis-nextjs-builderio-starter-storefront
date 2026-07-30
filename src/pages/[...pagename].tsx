import { BuilderComponent, builder } from '@builder.io/react'
import { setPixelProperties } from '@builder.io/utils'
import '@builder.io/widgets'
import getConfig from 'next/config'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { InstantSearch, Configure } from 'react-instantsearch-hooks-web'

import ResourcesHitComponent from '@/components/product/ProductHit/resources/ResourcesHitComponent'
import getCategoryTree from '@/lib/api/operations/get-category-tree'
import { productIndex, searchClient, instantSearchClient } from '@/lib/api/util/algolia'
import type { CategoryTreeResponse } from '@/lib/types'
import type { MetaData } from '@/lib/types'

import type { GetServerSidePropsContext } from 'next'

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)

function getMetaData(data: unknown): MetaData {
  const d = (data || {}) as Record<string, unknown>
  const title = typeof d['title'] === 'string' ? (d['title'] as string) : null
  const description = typeof d['description'] === 'string' ? (d['description'] as string) : null
  const keywords =
    typeof d['metaTagKeywords'] === 'string' ? (d['metaTagKeywords'] as string) : null
  const canonicalUrl =
    typeof d['canonicalUrl'] === 'string'
      ? (d['canonicalUrl'] as string)
      : typeof d['canonical'] === 'string'
      ? (d['canonical'] as string)
      : null
  const robots = d['noIndex'] === true ? 'noindex,nofollow' : null

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    robots,
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

  const pageURL = Array.isArray(pathnameArr) ? pathnameArr.join('/') : pathnameArr || ''

  let resourcesPage = false
  let resourceCategoryCode = null
  let pCategory = null
  const pathLength = pathnameArr?.length

  if (Array.isArray(pathnameArr)) {
    if (
      pathLength === 2 &&
      (pathnameArr[0] === 'resources' ||
        pathnameArr[0] === 'protocols' ||
        pathnameArr[0] === 'services' ||
        pathnameArr[0] === 'general')
    ) {
      resourceCategoryCode = pathnameArr[1]
      pCategory = pathnameArr[0]
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
    /*const result = await productIndex.search('', {
      filters: `category_url:"${
        pathLength === 1
          ? resourceCategoryCode
          : pCategory !== null
          ? `${pCategory}/${resourceCategoryCode}`
          : ''
      }"`,
      facets: ['*'],
    })
    products = result.hits
    facets = result.facets 
*/
    //updated fro algolia version update - WEB-1657
    // ✅ Fix
    const result = await productIndex.search('', {
      filters: `category_url:"${
        pathLength === 1
          ? resourceCategoryCode
          : pCategory !== null
          ? `${pCategory}/${resourceCategoryCode}`
          : ''
      }"`,
      facets: ['*'],
    })
    products = result.hits
    facets = result.facets as Record<string, Record<string, number>>

    section = await builder
      .get(categoryTopSection, {
        userAttributes: {
          slug:
            pCategory !== null && resourceCategoryCode
              ? `${pCategory}-${resourceCategoryCode}`
              : `${resourceCategoryCode}`,
          urlPath: `/${pagename}`,
        },
      })
      .toPromise()
    if (section) setPixelProperties(section, { alt: '' })
  } else {
    page = await builder
      .get(publicRuntimeConfig?.builderIO?.modelKeys?.defaultPage, {
        userAttributes: {
          urlPath: `/${pagename}`,
        },
      })
      .toPromise()
    if (page) setPixelProperties(page, { alt: '' })

    if (!page) {
      return { notFound: true } // This will render `pages/404.tsx`
    }
  }

  const metaData = getMetaData(page?.data || section?.data)

  return {
    props: {
      page: page || null,
      // Ensure metaData is pulled from either the page or the section data so it's available server-side
      metaData: getMetaData(page?.data || section?.data) || null,
      categoriesTree: categoriesTree || null,
      section: section || null,
      resourcesPage: resourcesPage,
      resourceCategoryCode: resourceCategoryCode || null,
      pCategory: pCategory || null,
      facets: facets || null,
      pathLength,
      urlFirstPart: pathnameArr?.[0] || null,
      pageURL: pageURL || null,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const Page = (props: any) => {
  const {
    page,
    resourcesPage,
    section,
    resourceCategoryCode,
    facets,
    pathLength,
    pCategory,
    pageURL,
  } = props
  const noIndex = page?.data?.noIndex
    ? page?.data?.noIndex
    : section?.data?.noIndex
    ? section?.data?.noIndex
    : false

  const staticCanonicalURL = `${publicRuntimeConfig?.baseUrl || ''}${pageURL}`

  // Server-side metadata: prefer explicit metaData prop, fall back to builder page/section data
  const metaSource = props.metaData || page?.data || section?.data || {}
  const metaTitle =
    metaSource?.title ||
    page?.data?.title ||
    section?.data?.title ||
    publicRuntimeConfig?.metaData?.defaultTitle ||
    null
  const metaDescription =
    metaSource?.description ||
    page?.data?.description ||
    section?.data?.description ||
    publicRuntimeConfig?.metaData?.defaultDescription ||
    null
  const metaImage = metaSource?.image || page?.data?.image || section?.data?.image || null
  const metaKeywords =
    metaSource?.keywords || page?.data?.metaTagKeywords || section?.data?.metaTagKeywords || null
  const canonicalUrl =
    metaSource?.canonicalUrl ||
    page?.data?.canonicalUrl ||
    section?.data?.canonicalUrl ||
    staticCanonicalURL

  if (resourcesPage && resourceCategoryCode) {
    return (
      <>
        <Head>
          {/* marker to indicate server-side page meta is present */}
          {metaTitle && <meta name="ssr-meta" data-ssr-meta="true" content="true" />}
          {metaTitle && <title>{metaTitle}</title>}
          {metaDescription && <meta name="description" content={metaDescription} />}
          {metaKeywords && <meta name="keywords" content={metaKeywords} />}
          {metaImage && <meta property="og:image" content={metaImage} />}
          {metaTitle && <meta property="og:title" content={metaTitle} />}
          {metaDescription && <meta property="og:description" content={metaDescription} />}
          {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
          {noIndex && <meta name="robots" content="noindex,nofollow" />}
        </Head>
        <BuilderComponent
          model={publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection}
          content={section}
        />
        <InstantSearch searchClient={instantSearchClient} indexName="builder-page_newest-first">
          <Configure
            {...({
              hitsPerPage: 15,
              clickAnalytics: true,
              filters: `category_url:"${
                pathLength === 1
                  ? resourceCategoryCode
                  : pCategory !== null
                  ? `${pCategory}/${resourceCategoryCode}`
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
      <Head>
        {/* marker to indicate server-side page meta is present */}
        {metaTitle && <meta name="ssr-meta" data-ssr-meta="true" content="true" />}
        {metaTitle && <title>{metaTitle}</title>}
        {metaDescription && <meta name="description" content={metaDescription} />}
        {metaKeywords && <meta name="keywords" content={metaKeywords} />}
        {metaImage && <meta property="og:image" content={metaImage} />}
        {metaTitle && <meta property="og:title" content={metaTitle} />}
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        {noIndex && <meta name="robots" content="noindex,nofollow" />}
      </Head>
      <BuilderComponent
        model={publicRuntimeConfig?.builderIO?.modelKeys?.defaultPage}
        content={page}
      />
    </>
  )
}

export default Page
