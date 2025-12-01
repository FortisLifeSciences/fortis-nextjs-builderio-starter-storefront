import { GetServerSideProps } from 'next'

import { apiAuthClient } from '@/lib/api/util/api-auth-client'

import { Product } from '@/lib/gql/types'

//pages/sitemap.xml.js

async function fetchCursorsData(cursorMark: any) {
  const authToken = await apiAuthClient.getAccessToken()
  const baseUrl = process.env.KIBO_API_HOST
  const url = `https://${baseUrl}/api/commerce/catalog/storefront/productsearch/search?collapse=true&pageSize=2000&startIndex=0&enableSearchTuningRules=true&cursorMark=${cursorMark}&includeAllImages=false&spellcorrectOverride=Default&useSubscriptionPricing=false`

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
    // console.log("cursor data", data)
    return { response: data }
  } catch (error) {
    console.error('Error in getting cursor', error)
    return { error }
  }
}

function generateSiteMap(categoryItems: any) {
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
         return `
         <url>
           <loc>${productUrl}</loc>
           <changefreq>daily</changefreq>
            <priority>.7</priority>
          </url>
           `
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
