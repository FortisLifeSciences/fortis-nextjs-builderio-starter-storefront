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
  // page → data.url ; category-section → urlPath targeting rule
  return entry?.data?.url ?? entry?.query?.find((q: any) => q.property === 'urlPath')?.value
}

// Safely turn an unknown timestamp into a YYYY-MM-DD string.
// Builder.io's `lastUpdated` is usually a ms epoch number, but a malformed or
// unexpected value would make new Date(...).toISOString() throw "Invalid time value".
function toDateString(value: unknown): string {
  const date = value ? new Date(value as string | number) : new Date()
  const safe = isNaN(date.getTime()) ? new Date() : date
  return safe.toISOString().split('T')[0]
}

async function fetchBuilderPages(): Promise<{ pages: BuilderPage[]; ok: boolean }> {
  const builderApiKey = process.env.BUILDER_IO_API_KEY
  let allPages: BuilderPage[] = []
  const limit = 100 // Builder.io caps results per request at 100
  const MAX_BATCHES = 100

  try {
    for (const model of BUILDER_MODELS) {
      let offset = 0
      let modelCount = 0
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
          .filter((p: any) => !!p.url)

        // Surface entries we received but couldn't turn into a URL — the most
        // common cause of "missing pages": no data.url AND no urlPath query.
        const dropped = results.length - pageUrls.length
        if (dropped > 0) {
          console.warn(
            `Sitemap: ${model} dropped ${dropped} entr(y/ies) at offset ${offset} (noIndex or unresolved url)`
          )
        }

        allPages = [...allPages, ...pageUrls]
        modelCount += pageUrls.length
        if (results.length < limit) break
        offset += limit
      }
      console.log(`Sitemap: ${model} contributed ${modelCount} url(s)`)
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
    .map((page) => {
      const cleanPageUrl = page?.url?.replace(/^\/+/, '') ?? ''
      const lastmod = toDateString(page?.lastUpdated)
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
  // getServerSideProps does the heavy lifting; nothing to render.
  return null
}

// Send a retryable 503 instead of an empty sitemap (empty can cause de-indexing).
// Only touches status/headers if the response hasn't started yet.
function serveRetryLater(res: Parameters<GetServerSideProps>[0]['res']) {
  if (!res.headersSent) {
    res.statusCode = 503
    res.setHeader('Retry-After', '3600')
    res.write(generateSiteMap([]))
  }
  res.end()
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'application/xml')
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=604800, stale-if-error=604800'
  )

  try {
    const { pages, ok } = await fetchBuilderPages()

    // 1) Fresh data available → cache it, then serve it.
    //    The cache write is AWAITED (so it actually completes on serverless,
    //    where the function may freeze right after the response is sent), but
    //    wrapped in try/catch so a cache outage logs instead of throwing a 500.
    if (ok && pages.length > 0) {
      const sitemap = generateSiteMap(pages)
      try {
        await setCachedSitemap(CACHE_KEY, sitemap)
      } catch (error) {
        console.error('setCachedSitemap failed', error)
      }
      res.write(sitemap)
      res.end()
      return { props: {} }
    }

    // 2) No fresh data → fall back to the last good cached copy.
    //    The cache read is best-effort: a cache outage must not 500 the route.
    let cached: string | null = null
    try {
      cached = await getCachedSitemap(CACHE_KEY)
    } catch (error) {
      console.error('getCachedSitemap failed', error)
    }

    if (cached) {
      res.write(cached)
      res.end()
      return { props: {} }
    }

    // 3) No data and no fallback yet → 503 tells Google to retry.
    serveRetryLater(res)
    return { props: {} }
  } catch (error) {
    // Last line of defence: never surface a hard 500. Degrade to a retryable 503.
    console.error('sitemap/builderUrls failed unexpectedly', error)
    serveRetryLater(res)
    return { props: {} }
  }
}

export default SiteMap
