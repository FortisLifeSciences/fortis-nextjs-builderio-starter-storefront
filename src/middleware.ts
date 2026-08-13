import { get } from '@vercel/edge-config'
import { NextResponse, NextRequest } from 'next/server'

const apiUrlStart = process.env.KIBO_API_HOST

const checkIsAuthenticated = (req: NextRequest) => {
  const cookie = req.headers.get('cookie')
  const cookieValue = cookie?.split('kibo_at=')[1]
  const encodedValue = cookieValue?.split(';')[0]
  if (encodedValue) {
    const decodedCookie = JSON.parse(Buffer.from(encodedValue, 'base64').toString('utf8'))
    return decodedCookie?.userId
  }
  return null
}

const fetchApi = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error('API request failed')
  return response.json()
}

const getApiAuthToken = async () => {
  const url = `https://${apiUrlStart}/api/platform/applications/authtickets/oauth`
  const body = JSON.stringify({
    grant_type: 'client_credentials',
    client_id: process.env.KIBO_CLIENT_ID,
    client_secret: process.env.KIBO_SHARED_SECRET,
  })

  const data = await fetchApi(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  return data.access_token
}

// Utility function to clean up query parameters
const cleanQueryParams = (search: string) => {
  const urlSearchParams = new URLSearchParams(search)
  urlSearchParams.delete('productCode') // Remove the unwanted productCode param
  return urlSearchParams.toString() // Return the cleaned query string
}

async function getCustomRedirects() {
  //custom redirects from builder/io
  const redirectsResult = await fetch(
    `https://cdn.builder.io/api/v3/content/custom-redirects?apiKey=${process.env.BUILDER_IO_API_KEY}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    }
  )
  if (!redirectsResult.ok) {
    console.log('Failed to fetch custom redirects')
    return []
  }
  if (redirectsResult.ok) {
    const data = await redirectsResult.json()
    const dataResult = data.results

    // Extract all redirects from the data.urlList
    const redirects = Array.isArray(dataResult)
      ? dataResult
          .map((content: any) => {
            const urlList = content.data?.urlList || []
            return urlList.map(
              (urlItem: { sourceUrl: any; destinationUrl: any; redirectToPermanent: any }) => ({
                sourceUrl: urlItem.sourceUrl,
                destinationUrl: urlItem.destinationUrl,
                permanent: !!urlItem.redirectToPermanent,
              })
            )
          })
          .flat()
      : []
    return redirects // Return the parsed JSON
  } else {
    return []
  }
}
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000 // 1 hour in milliseconds
const STALE_WHILE_REVALIDATE_TIME = 60 * 1000 // 1 minute in milliseconds

let cachedRedirects: { source: string; destination: string; permanent: boolean }[] | null = null
let cachedRedirectsTimestamp: number | null = null
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hs-scripts.com https://js.hsforms.net https://*.hsforms.com https://js.hscollectedforms.net https://js.hs-banner.com https://js.hs-analytics.net https://static.hsappstatic.net https://forms.hscollectedforms.net https://*.hubspotusercontent-na1.net https://cdn.builder.io https://*.builder.io https://www.google.com https://www.google.co.in https://analytics.google.com https://www.gstatic.com https://*.mozu.com https://www.googletagmanager.com https://www.google-analytics.com https://*.citeab.com https://*.clarity.ms https://*.snitcher.com https://*.hotjar.com https://app.secureprivacy.ai https://*.secureprivacy.ai https://*.doubleclick.net https://googleads.g.doubleclick.net https://stats.g.doubleclick.net https://www.googleadservices.com https://pagead2.googlesyndication.com https://ad.doubleclick.net https://*.hubspotusercontent-na1.net https://cmp.secureprivacy.ai https://www.redditstatic.com https://snap.licdn.com`,

  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.builder.io https://www.gstatic.com`,
  `img-src 'self' data: blob: https:`,
  `media-src 'self' https://cdn.builder.io https://*.builder.io`,
  `font-src 'self' data: https://fonts.gstatic.com https://cdn.builder.io https://*.builder.io https://script.hotjar.com  https://*.hotjar.com`,
  `connect-src 'self' https://*.mozu.com https://*.kibocommerce.com https://cdn.builder.io https://*.builder.io https://www.google.com https://www.google.co.in https://analytics.google.com https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.algolia.net https://*.algolianet.com https://go.bethyl.com https://www.fortislife.com https://insights.algolia.io https://api-prod.secureprivacy.ai https://*.secureprivacy.ai https://track.hubspot.com https://*.hsforms.com https://forms.hscollectedforms.net https://*.clarity.ms https://*.snitcher.com https://*.hubspotusercontent-na1.net https://*.hotjar.com https://*.hotjar.in https://vc.hotjar.io wss://ws.hotjar.com https://content.hotjar.io/ https://metrics.hotjar.io https://surveystats.hotjar.io https://www.googleadservices.com https://pixel-config.reddit.com/ https://googleads.g.doubleclick.net`,

  `frame-src 'self' https://*.builder.io https://www.google.com https://recaptcha.google.com https://pmts.mozu.com https://go.fortislife.com https://*.hsforms.com https://*.mozu.com https://*.citeab.com https://js.hsforms.net`,
  `frame-ancestors 'self'`,
  `worker-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self' https://*.mozu.com`,
  `upgrade-insecure-requests`,
].join('; ')
function applySecurityHeaders(response: NextResponse) {
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')

  return response
}
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const fullUrl = new URL(request.url)
  const match = pathname.match(/^\/cms\/files\/(.+)/)
  // Handle CDN file redirects from /cms/files/* to Kibo CDN
  if ((fullUrl.hostname === 'www.fortislife.com' || pathname.startsWith('/cms/files/')) && match) {
    const relativePath = pathname.replace('/cms/files/', '')
    const redirectUrl = `https://t31165-s51694.tp1.mozu.com/cms/files/${relativePath}`
    return applySecurityHeaders(NextResponse.redirect(redirectUrl, 308))
  }

  // Fetch redirects from Edge Config
  if (
    !(
      pathname.startsWith('/my-account') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/p/') ||
      pathname.startsWith('/product/')
    )
  ) {
    if (cachedRedirects && cachedRedirectsTimestamp) {
      const currentTime = Date.now()
      if (currentTime - cachedRedirectsTimestamp < CACHE_EXPIRATION_TIME * 1000) {
        console.log('Using cached redirects')
        return handleRedirects(request, cachedRedirects)
      } else {
        // Cache is stale but within stale-while-revalidate window, serve stale data and re-fetch
        if (
          currentTime - cachedRedirectsTimestamp <
          (CACHE_EXPIRATION_TIME + STALE_WHILE_REVALIDATE_TIME) * 1000
        ) {
          console.log('Serving stale redirects while revalidating')
          // Serve the stale cached redirects while fetching fresh data in the background
          fetchEdgeConfigRedirects()
          return handleRedirects(request, cachedRedirects)
        }
      }
    } else {
      const edgeRedirects = await fetchEdgeConfigRedirects()

      console.log('edgeRedirects in middlware function:', edgeRedirects)

      if (!Array.isArray(edgeRedirects)) {
        console.error('Error: Edge Config data is not an array')
        return applySecurityHeaders(NextResponse.next())
      }

      const customEdgeRedirect = edgeRedirects.find((entry) => entry.source === pathname)

      if (customEdgeRedirect) {
        console.log('Match found customEdgeRedirect:', customEdgeRedirect)
        const finalUrl = new URL(customEdgeRedirect.destination, request.url)

        return applySecurityHeaders(
          NextResponse.redirect(finalUrl, customEdgeRedirect.permanent ? 308 : 307)
        )
      }
      return applySecurityHeaders(NextResponse.next())
    }
  }
  if (
    request.nextUrl.pathname.startsWith('/my-account') ||
    request.nextUrl.pathname.startsWith('/checkout')
  ) {
    if (checkIsAuthenticated(request)) {
      return applySecurityHeaders(NextResponse.next())
    } else if (request.nextUrl.pathname.startsWith('/checkout')) {
      const cartUrl = new URL('/cart', request.url)
      return applySecurityHeaders(NextResponse.redirect(cartUrl))
    }

    const homeUrl = new URL('/', request.url)
    return applySecurityHeaders(NextResponse.redirect(homeUrl))
  }

  // Custom routes requests for product page
  if (pathname.startsWith('/p/') || pathname.startsWith('/product/')) {
    const authToken = await getApiAuthToken()
    const urlProductCode = pathname.split('/')[2]

    // Make an Product API call using Fetch
    if (urlProductCode && authToken) {
      try {
        const apiUrl = `https://${apiUrlStart}/api/commerce/catalog/storefront/products/${urlProductCode}`
        const productData = await fetchApi(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })

        const { productCode, categories, content } = productData || {}
        const categoryCode = categories?.[0]?.categoryCode
        const productSlug = content?.seoFriendlyUrl

        if (urlProductCode === productCode) {
          const slugUrl =
            productSlug && categoryCode
              ? `/products/${categoryCode}/${productSlug}/${productCode}`
              : null

          const redirects = await getCustomRedirects()

          const customRedirect = redirects.find((redirect) => redirect.sourceUrl === pathname)

          if (customRedirect) {
            console.log('Match found in builder redirect:', customRedirect)
            const finalUrl = new URL(customRedirect.destinationUrl, request.url)
            // Clean query parameters to remove productCode and keep others
            const cleanedSearch = cleanQueryParams(search)
            if (cleanedSearch) {
              finalUrl.search = `?${cleanedSearch}`
            }
            return applySecurityHeaders(
              NextResponse.redirect(finalUrl, customRedirect.permanent ? 308 : 307)
            )
          }

          if (slugUrl && request.nextUrl.pathname !== slugUrl) {
            const slugRedirectUrl = new URL(slugUrl, request.url)
            // Clean query parameters to remove productCode and append others
            const cleanedSearch = cleanQueryParams(search)
            if (cleanedSearch) {
              slugRedirectUrl.search = `?${cleanedSearch}`
            }
            const slugRedirect = applySecurityHeaders(NextResponse.redirect(slugRedirectUrl))
            slugRedirect.headers.set('Cache-Control', 'no-store')
            return applySecurityHeaders(slugRedirect)
          }

          // If no custom redirect and slug URL or it's the same as the current URL, continue to the product page
          return applySecurityHeaders(NextResponse.next())
        }
      } catch (error) {
        console.error(error)
      }
    }

    return applySecurityHeaders(NextResponse.next())
  }
  return applySecurityHeaders(NextResponse.next())
}

async function handleRedirects(
  request: NextRequest,
  redirectsCached: { source: string; destination: string; permanent: boolean }[]
) {
  const { pathname, search } = request.nextUrl

  if (!Array.isArray(redirectsCached)) {
    console.error('Error: in handlredirects method: Edge Config data is not an array')
    return applySecurityHeaders(NextResponse.next())
  }

  const customCachedEdgeRedirect = redirectsCached.find((entry) => entry.source === pathname)

  if (customCachedEdgeRedirect) {
    console.log(
      'Match found customCachedEdgeRedirect in handlredirects method:',
      customCachedEdgeRedirect
    )
    const finalUrl = new URL(customCachedEdgeRedirect.destination, request.url)
    return applySecurityHeaders(
      NextResponse.redirect(finalUrl, customCachedEdgeRedirect.permanent ? 308 : 307)
    )
  }

  return applySecurityHeaders(NextResponse.next())
}

async function fetchEdgeConfigRedirects(): Promise<
  { source: string; destination: string; permanent: boolean }[] | null
> {
  try {
    const edgeRedirectsFromApi = await get<
      { source: string; destination: string; permanent: boolean }[]
    >('redirects')
    if (Array.isArray(edgeRedirectsFromApi) && edgeRedirectsFromApi.length > 0) {
      // Cache the redirects for subsequent requests
      cachedRedirects = edgeRedirectsFromApi
      cachedRedirectsTimestamp = Date.now()
      console.log('Fetched edgeRedirectsFromApi from Edge Config:', edgeRedirectsFromApi)
      return edgeRedirectsFromApi
    } else {
      console.error('Error: Edge Config data is not a valid array or is empty')
      return null
    }
  } catch (error) {
    console.error('Error fetching redirects from Edge Config api:', error)
    return null
  }
}
