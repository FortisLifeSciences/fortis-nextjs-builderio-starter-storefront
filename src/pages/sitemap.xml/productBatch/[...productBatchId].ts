import { GetServerSideProps } from 'next'

import { fetchProductSearchWithCursorMarks } from '@/hooks/queries/product/useGetProducts/useGetProductWithCursors'

import { Product } from '@/lib/gql/types'

function generateSiteMap(categoryItems: Array<Product>) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset>
     ${(categoryItems || [])
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
    const productBatch = await fetchProductSearchWithCursorMarks(query.productBatchId?.[0])
    //console.log(productBatch)
    // We generate the XML sitemap with the posts data
    const sitemap = generateSiteMap(productBatch)

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
