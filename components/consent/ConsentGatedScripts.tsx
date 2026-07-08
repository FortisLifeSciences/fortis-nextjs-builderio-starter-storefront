import { useEffect } from 'react'

import { builder } from '@builder.io/react'

import { hasAnalyticsConsent, hasAdvertisingConsent, onConsentChange } from '@/lib/consent/consent'

function loadClarity() {
  if (typeof window === 'undefined') return
  if ((window as Window & { clarity?: unknown }).clarity) return /* eslint-disable */
  ;(function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
    c[a] =
      c[a] ||
      function () {
        ;(c[a].q = c[a].q || []).push(arguments)
      }
    t = l.createElement(r)
    t.async = 1
    t.src = 'https://www.clarity.ms/tag/' + i
    y = l.getElementsByTagName(r)[0]
    y.parentNode.insertBefore(t, y)
  })(window, document, 'clarity', 'script', 'w46caxplwp')
  /* eslint-enable */
}

function loadHubSpot() {
  if (typeof document === 'undefined') return
  if (document.getElementById('hs-script-loader')) return
  const s = document.createElement('script')
  s.id = 'hs-script-loader'
  s.async = true
  s.defer = true
  s.src = '//js.hs-scripts.com/50701860.js'
  document.body.appendChild(s)
}

function clearBuilderTracking() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('builderVisitorId')
    sessionStorage.removeItem('builderSessionId')
    document.cookie = 'builderSessionId=; Max-Age=0; path=/'
  } catch {
    return
  }
}

export default function ConsentGatedScripts() {
  useEffect(() => {
    const apply = () => {
      const analytics = hasAnalyticsConsent()
      builder.canTrack = analytics
      if (analytics) {
        loadClarity()
        if (hasAdvertisingConsent()) loadHubSpot()
      } else {
        clearBuilderTracking()
      }
    }
    apply()
    return onConsentChange(apply)
  }, [])

  return null
}
