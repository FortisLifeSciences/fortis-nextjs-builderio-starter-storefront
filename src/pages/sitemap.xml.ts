import { GetServerSideProps } from 'next'

import { getRandomAccessCursorsResult } from '@/hooks/queries/search/useGetRandomAccessCursors/useGetRandomAccessCursors'

import { ProductSearchRandomAccessCursor } from '@/lib/gql/types'
//pages/sitemap.xml.js

function generateSiteMap(cursors: ProductSearchRandomAccessCursor) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
  <loc>${process.env.NEXT_PUBLIC_URL}sitemap.xml/categories</loc>
  </sitemap>
  <sitemap>
     ${(cursors.cursorMarks || [])
       .map((id: string) => {
         return `
           <loc>${process.env.NEXT_PUBLIC_URL}sitemap.xml/productBatch/${`${id}`}</loc>
           `
       })
       .join('')}
   </sitemap>
    <sitemap>
        <loc>${process.env.NEXT_PUBLIC_URL}sitemap.xml/general-Urls</loc>
    </sitemap>
   </sitemapindex>
`
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We make an API call to gather the URLs for our site

  const cursors = await getRandomAccessCursorsResult()
  //console.log(cursors)

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(cursors)

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
