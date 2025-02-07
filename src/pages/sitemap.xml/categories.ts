import { GetServerSideProps } from 'next'

import { fetchCategoryTree, useGetCategoryTree } from '@/hooks'
import { getRandomAccessCursorsResult } from '@/hooks/queries/search/useGetRandomAccessCursors/useGetRandomAccessCursors'
import { CategoryTreeResponse } from '@/lib/types'

import { Maybe, PrCategory, ProductSearchRandomAccessCursor } from '@/lib/gql/types'
//pages/sitemap.xml.js

function generateSiteMap(categoryItems: Array<PrCategory>) {
  console.log('categoryItems', categoryItems)
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset>
     ${(categoryItems || [])
       .map((category: PrCategory) => {
         return `
         <url>
           <loc>${process.env.NEXT_PUBLIC_URL}products/${category.categoryCode}</loc>
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

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We make an API call to gather the URLs for our site
  const categoryTree = await fetchCategoryTree()
  //console.log(categoryTree)
  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(categoryTree)

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
