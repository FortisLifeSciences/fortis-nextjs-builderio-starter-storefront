import { BuilderComponent, builder } from '@builder.io/react'
import '@builder.io/widgets'
import getConfig from 'next/config'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import getCategoryTree from '@/lib/api/operations/get-category-tree'
import type { CategoryTreeResponse } from '@/lib/types'

import type { GetServerSidePropsContext } from 'next'

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale } = context

  const pathnameArr = context.params?.pagename

  let pagename
  if (Array.isArray(pathnameArr) && pathnameArr?.length > 1) {
    pagename = pathnameArr.join('/')
  } else {
    pagename = pathnameArr
  }

  const categoriesTree: CategoryTreeResponse = await getCategoryTree()

  const page = await builder
    .get(publicRuntimeConfig?.builderIO?.modelKeys?.defaultPage, {
      userAttributes: {
        urlPath: `/${pagename}`,
      },
    })
    .toPromise()

  return {
    props: {
      page: page || null,
      categoriesTree,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const Page = (props: any) => {
  const { page } = props
  const noIndex = page?.data?.noIndex || false
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
