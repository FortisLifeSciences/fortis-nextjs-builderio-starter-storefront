import { GetServerSideProps } from 'next'

import { getCachedSitemap, setCachedSitemap } from '@/lib/sitemapCache'

const CACHE_KEY = 'sitemap:builderUrls'

type BuilderPage = {
  url: string
  lastUpdated: string
}

// Models that hold sitemap pages. category-section = the Protocols/Resources landing pages.
const BUILDER_MODELS = ['page', 'category-section']

function resolveUrl(entry: any): string | undefined {
  // page → data.url (string)
  const direct = entry?.data?.url
  if (typeof direct === 'string') return direct

  // category-section → urlPath targeting rule.
  // Builder.io stores targeting-rule values as either a string or an array of strings.
  const value = entry?.query?.find((q: any) => q.property === 'urlPath')?.value
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.find((v) => typeof v === 'string')

  return undefined
}

async function fetchBuilderPages(): Promise<{ pages: BuilderPage[]; ok: boolean }> {
  const builderApiKey = process.env.BUILDER_IO_API_KEY
  let allPages: BuilderPage[] = []
  const limit = 100 // Builder.io caps results per request at 100
  const MAX_BATCHES = 100

  try {
    for (const model of BUILDER_MODELS) {
      let offset = 0
      for (let i = 0; i < MAX_BATCHES; i++) {
        const url = `https://cdn.builder.io/api/v2/content/${model}?apiKey=${builderApiKey}&fields=data.url,data.noIndex,query,lastUpdated&query.data.includeInSitemap.$ne=false&limit=${limit}&offset=${offset}`
        const response = await fetch(url)

        if (!response.ok) {
          console.error(`Builder.io (${model}) returned ${response.status}`)
          return { pages: [], ok: false }
        }

        const data = await response.json()
        const results = data?.results ?? []
        if (!results.length) break

        const pageUrls = results
          .filter((page: any) => !page.data?.noIndex)
          .map((page: any) => ({ url: resolveUrl(page), lastUpdated: page.lastUpdated }))
          // resolveUrl now always yields a string or undefined; keep only strings
          .filter((p: any) => typeof p.url === 'string' && p.url.length > 0)

        allPages = [...allPages, ...pageUrls]
        if (results.length < limit) break
        offset += limit
      }
    }

    // de-dupe in case a URL exists in more than one model
    const seen = new Set<string>()
    const unique = allPages.filter((p) => (seen.has(p.url) ? false : seen.add(p.url)))
    return { pages: unique, ok: true }
  } catch (error) {
    console.error('Error fetching Builder.io pages', error)
    return { pages: [], ok: false }
  }
}

export const generateSiteMap = (builderPages: BuilderPage[] = []): string => {
  const baseUrl = process.env.NEXT_PUBLIC_URL?.replace(/\/+$/, '') || 'https://www.fortislife.com'

  const urls = builderPages
    // Safety net: never let a single malformed entry 500 the whole sitemap.
    .filter((page) => typeof page?.url === 'string')
    .map((page) => {
      const cleanPageUrl = page.url.replace(/^\/+/, '')
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
