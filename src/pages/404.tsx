import { useEffect, useState } from 'react'

import { BuilderComponent, builder } from '@builder.io/react'
import '@builder.io/widgets'
import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { pageNotFound } from '@/lib/utils'

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)

const Custom404 = () => {
  const [page, setPage] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    builder
      .get(publicRuntimeConfig?.builderIO?.modelKeys?.defaultPage, {
        userAttributes: { urlPath: '/404' },
      })
      .toPromise()
      .then((res) => {
        if (res) setPage(res)
      })
  }, [])

  useEffect(() => {
    pageNotFound(router.asPath)
  }, [router.asPath])

  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
      </Head>
      <div>
        {page ? (
          <BuilderComponent
            model={publicRuntimeConfig?.builderIO?.modelKeys?.defaultPage}
            content={page}
          />
        ) : (
          ''
        )}
      </div>
    </>
  )
}

export default Custom404
