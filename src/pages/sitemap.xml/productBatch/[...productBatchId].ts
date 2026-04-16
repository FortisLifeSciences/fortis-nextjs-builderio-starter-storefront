import { GetServerSideProps } from 'next'

import redirectsData from '@/customRedirects/redirects.json'
import { apiAuthClient } from '@/lib/api/util/api-auth-client'

import { Product } from '@/lib/gql/types'

// Type definition for redirect entries
interface RedirectEntry {
  source: string
  destination: string
}

//pages/sitemap.xml.js

async function fetchCursorsData(cursorMark: any) {
  const authToken = await apiAuthClient.getAccessToken()
  const baseUrl = process.env.KIBO_API_HOST
  const url = `https://${baseUrl}/api/commerce/catalog/storefront/productsearch/search?collapse=true&pageSize=200&startIndex=0&enableSearchTuningRules=true&cursorMark=${cursorMark}&includeAllImages=false&spellcorrectOverride=Default&useSubscriptionPricing=false`

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

  // Key the map by path only (strip domain) so it works across environments
  ;(redirectsData as RedirectEntry[]).forEach((redirect) => {
    const sourcePath = new URL(redirect.source).pathname
    const destinationPath = new URL(redirect.destination).pathname
    redirectMap.set(sourcePath, destinationPath)
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
     ${(categoryItems?.items || [])
       .map((product: Product) => {
         let productUrl = process.env.NEXT_PUBLIC_URL + 'product/' + product.productCode
         if (product?.categories?.[0]?.categoryCode && product.content?.seoFriendlyUrl) {
           productUrl =
             process.env.NEXT_PUBLIC_URL +
             'products/' +
             product?.categories?.[0]?.categoryCode +
             '/' +
             product.content?.seoFriendlyUrl +
             '/' +
             product.productCode
         }

         // Check redirect for all product URLs (domain-agnostic path comparison)
         const productPath = new URL(productUrl).pathname
         const redirectedPath = redirectMap.get(productPath)
         if (redirectedPath && process.env.NEXT_PUBLIC_URL) {
           console.log(`[Sitemap Redirect] MATCH: ${productPath} → ${redirectedPath}`)
           productUrl = process.env.NEXT_PUBLIC_URL + redirectedPath.slice(1)
         } else {
           console.log(`[Sitemap Redirect] NO MATCH (kept as-is): ${productPath}`)
         }
         const lastmod = product?.updateDate
           ? new Date(product?.updateDate).toISOString().split('T')[0]
           : new Date().toISOString().split('T')[0]
         return `
         <url>
           <loc>${productUrl}</loc>
           <lastmod>${lastmod}</lastmod>
         </url>`
       })
       .join('')}
  </urlset>
`
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res, query }) => {
  // We make an API call to gather the URLs for our site

  if (typeof query.productBatchId?.[0] == 'string') {
    // const productBatch = await fetchProductSearchWithCursorMarks(query.productBatchId?.[0])
    // We generate the XML sitemap with the posts data
    const cursorMark = query.productBatchId?.[0]
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
