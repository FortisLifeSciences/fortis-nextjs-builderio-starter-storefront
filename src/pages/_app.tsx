/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react'

import { builder } from '@builder.io/react'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { AppProps } from 'next/app'
import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { appWithTranslation } from 'next-i18next'
import 'next-i18next.config'
// eslint-disable-next-line import/order
import Router from 'next/router'
import NProgress from 'nprogress'

import BuilderComponents from './builder-registry'
import registerDesignToken from './registerDesignToken'
import { DefaultLayout } from '@/components/layout'
import { RQNotificationContextProvider } from '@/context'
import createEmotionCache from '@/lib/createEmotionCache'
import type { NextPageWithLayout } from '@/lib/types'

import '@/styles/global.css'

registerDesignToken()

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey) // Replace with your actual Builder.io API key

BuilderComponents()

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

type KiboAppProps = AppProps & {
  emotionCache?: EmotionCache
  Component: NextPageWithLayout
}

NProgress.configure({ showSpinner: false })
Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const App = (props: KiboAppProps) => {
  const { publicRuntimeConfig } = getConfig()
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const { siteTitle, defaultTitle, defaultDescription } = publicRuntimeConfig?.metaData || {}
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout pageProps={pageProps}>{page}</DefaultLayout>)
  const pageTitle = `${siteTitle} | ${pageProps?.metaData?.title || defaultTitle}`

  const [googleReCaptcha, setGoogleReCaptcha] = useState()

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await builder.get('theme-setting').promise()
      setGoogleReCaptcha(settings.data?.googleReCaptcha)
    }
    fetchSettings()
  }, [])
  const recapchaScript = `https://www.google.com/recaptcha/api.js?render=${
    (googleReCaptcha as any)?.accountCreationSiteKey
  }`
  const recapchaEnterpriseScript = `https://www.google.com/recaptcha/enterprise.js?render=${
    (googleReCaptcha as any)?.accountCreationSiteKey
  }`

  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('App mounted')
    const handleRedirects = async () => {
      console.log('Fetching redirects')
      const { pathname } = window.location
      const results = await builder.getAll('custom-redirects', {
        apiKey: process.env.BUILDER_IO_API_KEY || apiKey,
        options: { noTargeting: true },
        cachebust: true,
      })
      console.log('Redirect results:', results)
      // Extract all redirects from the data.urlList

      const redirects = results.flatMap((content) => {
        const urlList = content.data?.urlList || []
        return urlList.map(
          (urlItem: { sourceUrl: any; destinationUrl: any; redirectToPermanent: any }) => ({
            sourceUrl: urlItem.sourceUrl,
            destinationUrl: urlItem.destinationUrl,
            permanent: !!urlItem.redirectToPermanent,
          })
        )
      })
      console.log('Processed redirects:', redirects)
      const redirect = redirects.find((r) => r.sourceUrl === pathname)
      if (redirect) {
        console.log(`Redirecting from ${redirect.sourceUrl} to ${redirect.destinationUrl}`)
        router.replace(redirect.destinationUrl)
      } else {
        setLoading(false) // Allow the page to render if no redirect is found
      }
    }
    handleRedirects()
  }, [router])
  if (loading) {
    return null // Or a loading spinner
  }

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="title" content={pageProps?.metaData?.title || defaultTitle} />
        <meta name="description" content={pageProps?.metaData?.description || defaultDescription} />
        <meta name="keywords" content={pageProps?.metaData?.keywords} />
        {pageProps?.metaData?.robots && (
          <meta name="robots" content={pageProps?.metaData?.robots} />
        )}
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
          {/* font-family: "poppins" */}
        </style>
        <script src={recapchaScript} async defer></script>
        <script src={recapchaEnterpriseScript} async defer></script>
      </Head>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <RQNotificationContextProvider>
        {getLayout(<Component {...pageProps} />)}
      </RQNotificationContextProvider>
    </CacheProvider>
  )
}
export default appWithTranslation<KiboAppProps>(App)
