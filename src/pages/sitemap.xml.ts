import { GetServerSideProps } from 'next'

import { apiAuthClient } from '@/lib/api/util/api-auth-client'

import { ProductSearchRandomAccessCursor } from '@/lib/gql/types'
//pages/sitemap.xml.js

async function fetchCursorsData() {
  const authToken = await apiAuthClient.getAccessToken()
  const baseUrl = process.env.KIBO_API_HOST
  const url = `https://${baseUrl}/api/commerce/catalog/storefront/productsearch/randomAccessCursor?pageSize=2000`

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

function generateSiteMap(cursors: ProductSearchRandomAccessCursor) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>${process.env.NEXT_PUBLIC_URL}/sitemap.xml/categories</loc>
    </sitemap>
    ${cursors.cursorMarks
      ?.map(
        (id: string) =>
          `<sitemap><loc>${
            process.env.NEXT_PUBLIC_URL
          }/sitemap.xml/productBatch/${encodeURIComponent(id)}</loc></sitemap>`
      )
      .join('')}
    <sitemap>
      <loc>${process.env.NEXT_PUBLIC_URL}/sitemap.xml/builderUrls</loc>
    </sitemap>
  </sitemapindex>`
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const cursors = await fetchCursorsData()
  const sitemap = generateSiteMap(cursors?.response)

  res.setHeader('Content-Type', 'application/xml') // ✅ Ensure correct MIME type
  res.write(sitemap)
  res.end()

  return { props: {} }
}

export default SiteMap
