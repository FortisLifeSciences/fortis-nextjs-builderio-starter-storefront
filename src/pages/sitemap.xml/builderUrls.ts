import { GetServerSideProps } from 'next'

import { getCachedSitemap, setCachedSitemap } from '@/lib/sitemapCache'

const CACHE_KEY = 'sitemap:builderUrls'

type BuilderPage = {
  url: string
  lastUpdated: string
}

async function fetchBuilderPages(): Promise<{ pages: BuilderPage[]; ok: boolean }> {
  const builderApiKey = process.env.BUILDER_IO_API_KEY
  let allPages: BuilderPage[] = []
  let offset = 0
  const limit = 500
  const MAX_BATCHES = 100

  try {
    for (let i = 0; i < MAX_BATCHES; i++) {
      const url = `https://cdn.builder.io/api/v2/content/page?apiKey=${builderApiKey}&fields=data.url,data.noIndex,lastUpdated&query.data.includeInSitemap.$ne=false&limit=${limit}&offset=${offset}`
      const response = await fetch(url)

      if (!response.ok) {
        console.error(`Builder.io returned ${response.status}`)
        return { pages: [], ok: false }
      }

      const data = await response.json()
      if (!data?.results?.length) break

      const pageUrls = data.results
        .filter((page: any) => !page.data?.noIndex && page.data?.url)
        .map((page: any) => ({
          url: page.data.url,
          lastUpdated: page.lastUpdated,
        }))

      allPages = [...allPages, ...pageUrls]
      if (data.results.length < limit) break
      offset += limit
    }
    return { pages: allPages, ok: true }
  } catch (error) {
    console.error('Error fetching Builder.io pages', error)
    return { pages: [], ok: false }
  }
}

export const generateSiteMap = (builderPages: BuilderPage[] = []): string => {
  const baseUrl = process.env.NEXT_PUBLIC_URL?.replace(/\/+$/, '') || 'https://www.fortislife.com'

  const urls = builderPages
    .map((page) => {
      const cleanPageUrl = page?.url?.replace(/^\/+/, '') ?? ''
      const lastmod = page.lastUpdated
        ? new Date(page.lastUpdated).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
      return `
      <url>
        <loc>${baseUrl}/${cleanPageUrl}</loc>
        <lastmod>${lastmod}</lastmod>
      </url>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`
}

function SiteMap() {
  // getServerSideProps does the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { pages, ok } = await fetchBuilderPages()

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=604800, stale-if-error=604800'
  )

  if (ok && pages.length > 0) {
    const sitemap = generateSiteMap(pages)
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

  // No data and no fallback yet: 503 tells Google to retry instead of sending empty sitemap (which can cause de-indexing).
  res.statusCode = 503
  res.setHeader('Retry-After', '3600')
  res.write(generateSiteMap([]))
  res.end()
  return { props: {} }
}

export default SiteMap
