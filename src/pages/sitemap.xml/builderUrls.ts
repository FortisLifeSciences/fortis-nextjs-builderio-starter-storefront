import { GetServerSideProps } from 'next'

//pages/sitemap.xml.js
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
          .filter((p: any) => !!p.url)

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

export const generateSiteMap = (builderPages: BuilderPage[]): string => {
  const baseUrl = process.env.NEXT_PUBLIC_URL?.replace(/\/+$/, '') || 'https://www.fortislife.com'

  // Recursive function to generate category URLs
  const generateCategoryUrls = (builderPages: BuilderPage[] = []): string => {
    return builderPages
      .map((page) => {
        const cleanPageUrl = page?.url.replace(/^\/+/, '') //Remove leading slashes

        const lastmod = page.lastUpdated
          ? new Date(page.lastUpdated).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]

        return `
      <url>
        <loc>${baseUrl}/${cleanPageUrl}</loc>
        <lastmod>${lastmod}</lastmod>
      </url>
    `
      })
      .join('')
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${generateCategoryUrls(builderPages)}
    </urlset>`
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We make an API call to gather the URLs for our site
  const builderPages = await fetchBuilderPages()
  // We generate the XML sitemap with the posts data
  //const sitemap = generateSiteMap()

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  //res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
