import { GetServerSideProps } from 'next'

import redirectsData from '@/customRedirects/redirects.json'
import { apiAuthClient } from '@/lib/api/util/api-auth-client'
import { getCachedSitemap, setCachedSitemap } from '@/lib/sitemapCache'

import { Product, ProductSearchResult } from '@/lib/gql/types'
//type definitiion for redirect entries
interface RedirectEntry {
  source: string
  destination: string
}

const CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=604800, stale-if-error=604800'
const KIBO_REQUEST_TIMEOUT_MS = 10_000

// Fetch data using cursor

async function fetchCursorsData(cursorMark: string): Promise<ProductSearchResult | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), KIBO_REQUEST_TIMEOUT_MS)
  try {
    const authToken = await apiAuthClient.getAccessToken()
    const baseUrl = process.env.KIBO_API_HOST
    const url = `https://${baseUrl}/api/commerce/catalog/storefront/productsearch/search?collapse=true&pageSize=200&enableSearchTuningRules=true&cursorMark=${cursorMark}&includeAllImages=false&spellcorrectOverride=Default&useSubscriptionPricing=false`
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
    })
    if (!response.ok) {
      console.error(`Product sitemap API returned ${response.status} for cursor ${cursorMark}`)
      return null
    }

    const data = await response.json()
    if (!Array.isArray(data?.items) || data.items.length === 0 || data?.errors?.length) {
      console.error(`Product sitemap API returned an invalid response for cursor ${cursorMark}`)
      return null
    }

    return data as ProductSearchResult
  } catch (error) {
    console.error(`Error fetching product sitemap batch for cursor ${cursorMark}`, error)
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function generateSiteMap(categoryItems: any) {
  // Create a map for quick lookup of redirects
  const redirectMap = new Map<string, string>()
  const seenProducts = new Set<string>()
  const uniqueUrls = new Set<string>()

  ;(redirectsData as RedirectEntry[]).forEach((redirect) => {
    try {
      const sourcePath = new URL(redirect.source).pathname
      const destinationPath = new URL(redirect.destination).pathname
      redirectMap.set(sourcePath, destinationPath)
    } catch (e) {
      console.warn('Invalid redirect URL:', redirect)
    }
  })

  const baseUrl = process.env.NEXT_PUBLIC_URL || ''

  const urls = (categoryItems?.items || [])
    // Remove duplicate products
    .filter((product: Product) => {
      if (!product?.productCode) return false

      if (seenProducts.has(product.productCode)) {
        console.log('Duplicate productCode:', product.productCode)
        return false
      }

      seenProducts.add(product.productCode)
      return true
    })
    // Generate URLs
    .map((product: Product) => {
      let productUrl = `${baseUrl}product/${product.productCode}`

      if (product?.categories?.[0]?.categoryCode && product?.content?.seoFriendlyUrl) {
        productUrl = `${baseUrl}products/${product.categories[0].categoryCode}/${product.content.seoFriendlyUrl}/${product.productCode}`
      }
      // Lowercase product URL for libraries
      const lowercaseProductCodes = [
        'abnano-anti-nk-cell-vhh',
        'abnano-anti-t-cell-vhh',
        'abnano-vhh-naive',
      ]

      const productCodeFromUrl: any = productUrl.split('/').pop()?.toLowerCase()

      if (lowercaseProductCodes.includes(productCodeFromUrl)) {
        productUrl = productUrl.toLowerCase()
      }
      // Apply redirect
      try {
        const productPath = new URL(productUrl).pathname
        const redirectedPath = redirectMap.get(productPath)

        if (redirectedPath) {
          productUrl = baseUrl + redirectedPath.replace(/^\/+/, '')
        }
      } catch (e) {
        console.warn('Invalid product URL:', productUrl)
      }

      const lastmod = product?.updateDate
        ? new Date(product.updateDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      return {
        url: productUrl,
        lastmod,
      }
    })
    // Remove duplicate URLs
    .filter((item: any) => {
      if (uniqueUrls.has(item.url)) {
        console.log('Duplicate URL:', item.url)
        return false
      }

      uniqueUrls.add(item.url)
      return true
    })

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        (item: any) => `
      <url>
        <loc>${item.url}</loc>
        <lastmod>${item.lastmod}</lastmod>
      </url>`
      )
      .join('')}
  </urlset>`
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res, query }) => {
  const cursorMark = query.productBatchId?.[0]
  if (typeof cursorMark !== 'string') {
    res.statusCode = 400
    res.end()
    return { props: {} }
  }

  const cacheKey = `sitemap:productBatch:${cursorMark}`
  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', CACHE_CONTROL)

  const productBatch = await fetchCursorsData(cursorMark)
  if (productBatch) {
    const sitemap = generateSiteMap(productBatch)
    await setCachedSitemap(cacheKey, sitemap)
    res.write(sitemap)
    res.end()
    return { props: {} }
  }

  const cached = await getCachedSitemap(cacheKey)
  if (cached) {
    res.write(cached)
    res.end()
    return { props: {} }
  }

  res.statusCode = 503
  res.setHeader('Retry-After', '3600')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end()
  return { props: {} }
}

export default SiteMap
