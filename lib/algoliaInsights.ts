'use client'

import aa from 'search-insights'

declare global {
  interface Window {
    aa?: typeof aa
  }
}
// Utility function to get consent status
//import { getAnalyticsConsentFromLocalStorage } from './getAnalyticsConsent'

export const initAlgoliaInsightsClient = () => {
  // Ensure this runs only on the client-side and only once
  if (typeof window !== 'undefined') {
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
}
