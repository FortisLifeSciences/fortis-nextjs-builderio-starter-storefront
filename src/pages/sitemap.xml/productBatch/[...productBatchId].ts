import { GetServerSideProps } from 'next'

import redirectsData from '@/customRedirects/redirects.json'
import { apiAuthClient } from '@/lib/api/util/api-auth-client'

import { Product } from '@/lib/gql/types'
//type definitiion for redirect entries
interface RedirectEntry {
  source: string
  destination: string
}

// Fetch data using cursor

async function fetchCursorsData(cursorMark: any) {
  const authToken = await apiAuthClient.getAccessToken()
  const baseUrl = process.env.KIBO_API_HOST
  const url = `https://${baseUrl}/api/commerce/catalog/storefront/productsearch/search?collapse=true&pageSize=200&enableSearchTuningRules=true&cursorMark=${cursorMark}&includeAllImages=false&spellcorrectOverride=Default&useSubscriptionPricing=false`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
    })
    const data = await response.json()
    return { response: data }
  } catch (error) {
    console.error('Error in getting cursor', error)
    return { error }
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
const getLastModDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res, query }) => {
  if (typeof query.productBatchId?.[0] === 'string') {
    const cursorMark = query.productBatchId[0]

    const productBatch = await fetchCursorsData(cursorMark)
    const sitemap = generateSiteMap(productBatch?.response)

    res.setHeader('Content-Type', 'text/xml')
    // we send the XML to the browser
    res.write(sitemap)
    res.end()

    return {
      props: {},
    }
  } else {
    res.setHeader('Content-Type', 'text/xml')
    // we send the XML to the browser
    res.write('')
    res.end()

    return {
      props: {},
    }
  }
}

export default SiteMap
