import { GetServerSideProps } from 'next'

import { apiAuthClient } from '@/lib/api/util/api-auth-client'
import { getCachedSitemap, setCachedSitemap } from '@/lib/sitemapCache'

import { ProductSearchRandomAccessCursor } from '@/lib/gql/types'

const CACHE_KEY = 'sitemap:index'

async function fetchCursorsData(): Promise<ProductSearchRandomAccessCursor | null> {
  const authToken = await apiAuthClient.getAccessToken()
  const baseUrl = process.env.KIBO_API_HOST
  const url = `https://${baseUrl}/api/commerce/catalog/storefront/productsearch/randomAccessCursor?pageSize=200`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
    })
    if (!response.ok) {
      console.error(`Cursor API returned ${response.status}`)
      return null
    }
    return (await response.json()) as ProductSearchRandomAccessCursor
  } catch (error) {
    console.error('Error in getting cursor', error)
    return null
  }
}

function generateSiteMap(cursors: ProductSearchRandomAccessCursor | null) {
  const base = process.env.NEXT_PUBLIC_URL
  const productSitemaps =
    cursors?.cursorMarks
      ?.map(
        (id: string) =>
          `<sitemap><loc>${base}sitemap.xml/productBatch/${encodeURIComponent(id)}</loc></sitemap>`
      )
      .join('') ?? ''

  return `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>${base}sitemap.xml/categories</loc>
    </sitemap>
    ${productSitemaps}
    <sitemap>
      <loc>${base}sitemap.xml/builderUrls</loc>
    </sitemap>
  </sitemapindex>`
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const cursors = await fetchCursorsData()

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=604800, stale-if-error=604800'
  )

  if (cursors?.cursorMarks?.length) {
    const sitemap = generateSiteMap(cursors)
    await setCachedSitemap(CACHE_KEY, sitemap)
    res.write(sitemap)
    res.end()
    return { props: {} }
  }

  const cached = await getCachedSitemap(CACHE_KEY)
  if (cached) {
    res.write(cached)
    res.end()
    return { props: {} }
  }

  // Last record: static entries (categories, builderUrls) are still valid, instead of giving errors
  res.write(generateSiteMap(null))
  res.end()
  return { props: {} }
}

export default function SiteMap() {
  return null
}
