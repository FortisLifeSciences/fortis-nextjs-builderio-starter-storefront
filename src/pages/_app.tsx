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

import GetThemeSettings from './api/getThemeSettings'
// import IpWhoIs from './api/ipWhoIs'
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
  const router = useRouter()
  const { siteTitle, defaultTitle, defaultDescription } = publicRuntimeConfig?.metaData || {}
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout pageProps={pageProps}>{page}</DefaultLayout>)

  const pageTitle =
    pageProps?.metaData?.title || pageProps?.page?.data?.title || defaultTitle || siteTitle
  const pageDescription =
    pageProps?.metaData?.description || pageProps?.page?.data?.description || defaultDescription
  const pageImage = pageProps?.metaData?.image || pageProps?.page?.data?.image

  const [googleReCaptcha, setGoogleReCaptcha] = useState()
  const [gtmId, setGtmId] = useState()
  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await GetThemeSettings()
      setGoogleReCaptcha(settings?.data?.googleReCaptcha)

      if (settings?.data?.ipBasedCountryCode) {
        //  IpWhoIs(settings?.data?.ipBasedCountryCode)

        const payload = {
          ipBasedCountryCode: settings?.data?.ipBasedCountryCode,
        }
        const ipWhoisApi = await fetch('/api/ipWhoisApi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ payload }),
        })
      }
      if (settings?.data?.googleTagManagerId) {
        setGtmId(settings?.data?.googleTagManagerId)
      }
    }
    fetchSettings()
  }, [])
  if (typeof window !== 'undefined' && gtmId !== undefined) {
    window.isGtm = true // or false, depending on your state
  }
  const recapchaScript = `https://www.google.com/recaptcha/api.js?render=${
    (googleReCaptcha as any)?.accountCreationSiteKey
  }`
  const recapchaEnterpriseScript = `https://www.google.com/recaptcha/enterprise.js?render=${
    (googleReCaptcha as any)?.accountCreationSiteKey
  }`

  useEffect(() => {
    const addAriaLabel = () => {
      const iframe = document.querySelectorAll('.g-recaptcha-response')
      if (iframe) {
        iframe.forEach((iframe, index) => {
          iframe.setAttribute('aria-label', 'Security verification using reCAPTCHA')
        })
      }
    }
    const observer = new MutationObserver(() => {
      addAriaLabel()
    })

    observer.observe(document.body, { childList: true, subtree: true })
    setTimeout(() => {
      addAriaLabel()
    }, 2000)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Update metadata dynamically

    const updateMetaTags = () => {
      const head = document.head

      // Helper function to update or create meta tags
      const setMetaTag = (name: string, content: string | undefined) => {
        if (!content) return

        // Check if the tag already exists
        let tag = head.querySelector(`meta[name="${name}"]`)
        if (!tag) {
          tag = document.createElement('meta')
          tag.setAttribute('name', name)
          tag.setAttribute('data-dynamic-meta', 'true')
          head.appendChild(tag)
        }
        tag.setAttribute('content', content)
      }

      // Update or create the tags
      setMetaTag('title', pageTitle)
      setMetaTag('description', pageDescription)
      setMetaTag('image', pageImage)
      setMetaTag('keywords', pageProps?.metaData?.keywords || '')
      if (pageProps?.metaData?.robots) {
        setMetaTag('robots', pageProps?.metaData?.robots)
      }

      // Remove stale dynamic tags not updated
      const staleTags = head.querySelectorAll('meta[data-dynamic-meta]')
      staleTags.forEach((tag) => {
        if (!tag.getAttribute('content')) tag.remove()
      })
    }

    updateMetaTags()
  }, [router.pathname, pageTitle, pageDescription, pageImage, pageProps?.metaData])

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{pageTitle}</title>
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
          {/* font-family: "poppins" */}
        </style>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
        <script src={recapchaScript} async defer></script>
        <script src={recapchaEnterpriseScript} async defer></script>
        {gtmId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!=='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${gtmId}');
                `,
            }}
          ></script>
        )}
      </Head>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <RQNotificationContextProvider>
        {getLayout(<Component {...pageProps} />)}
      </RQNotificationContextProvider>
    </CacheProvider>
  )
}
export default appWithTranslation<KiboAppProps>(App)
