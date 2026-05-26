import { BuilderComponent, builder, Builder } from '@builder.io/react'
import { setPixelProperties } from '@builder.io/utils'
import '@builder.io/widgets'
import getConfig from 'next/config'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import CmsHomePageProducts from '../../cms/components/CmsHomePageProducts/CmsHomePageProducts'
import { KiboHeroCarousel, ContentTile, SmallBanner } from '@/components/home'
import { ProductRecommendations } from '@/components/product'
import getCategoryTree from '@/lib/api/operations/get-category-tree'
import type { CategoryTreeResponse, NextPageWithLayout } from '@/lib/types'

import type { GetStaticPropsContext } from 'next'

interface HomePageProps {
  page: any
  themeSetting: any
}

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)

export async function getStaticProps(context: GetStaticPropsContext) {
  const { locale } = context
  const categoriesTree: CategoryTreeResponse = (await getCategoryTree()) || null
  const { serverRuntimeConfig } = getConfig()

  const page = await builder
    .get(publicRuntimeConfig?.builderIO?.modelKeys?.defaultPage, {
      userAttributes: {
        urlPath: '/',
      },
    })
    .toPromise()
  if (page) setPixelProperties(page, { alt: 'pixel tag from builder' })
  const themeSetting = await builder.get('theme-setting').promise()
  return {
    props: {
      page: page || null,
      categoriesTree,
      themeSetting: themeSetting || null,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
    revalidate: serverRuntimeConfig.revalidate,
  }
}

const Home: NextPageWithLayout<HomePageProps> = (props) => {
  const { page, themeSetting } = props

  const metaSource = page?.data
  const metaTitle =
    metaSource?.title || page?.data?.title || publicRuntimeConfig?.metaData?.defaultTitle || null
  const metaDescription =
    metaSource?.description ||
    page?.data?.description ||
    publicRuntimeConfig?.metaData?.defaultDescription ||
    null
  const metaImage = metaSource?.image || page?.data?.image || null
  const metaKeywords = metaSource?.keywords || page?.data?.metaTagKeywords || null
  const canonicalUrl =
    metaSource?.canonicalUrl || page?.data?.canonicalUrl || publicRuntimeConfig?.baseUrl || null
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
      </Head>
      <BuilderComponent
        model={publicRuntimeConfig?.builderIO?.modelKeys?.defaultPage}
        content={page}
      />
    </>
  )
}

export default Home
