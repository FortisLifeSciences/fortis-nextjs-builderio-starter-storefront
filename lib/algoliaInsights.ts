'use client'

import aa from 'search-insights'

import { hasAnalyticsConsent } from './consent/consent'

declare global {
  interface Window {
    aa?: typeof aa
  }
}

export const initAlgoliaInsightsClient = () => {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsent()) return
  if (!window.aa) {
    window.aa = aa
    // Initialize Algolia Insights with your app ID and API key
    aa('init', {
      appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
      apiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '',
      useCookie: true,
    })
  }
}
