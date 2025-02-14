import { GetServerSideProps } from 'next'

//pages/sitemap.xml.js

async function fetchBuilderPages() {
  const builderApiKey = process.env.BUILDER_IO_API_KEY
  let allPages: string | any[] = []
  let offset = 0
  const limit = 500 // Adjust as needed (Builder.io allows higher limits)

  try {
    while (true) {
      const url = `https://cdn.builder.io/api/v2/content/page?apiKey=${builderApiKey}&fields=data.url,data.noIndex&query.data.includeInSitemap.$ne=false&limit=${limit}&offset=${offset}`
      const response = await fetch(url)
      const data = await response.json()

      if (!data?.results?.length) break // Stop if no more results

      const pageUrls = data.results
        .filter((page: { data: { noIndex: any } }) => !page.data?.noIndex) // Exclude pages where noIndex = true
        .map((page: { data: { url: any } }) => page.data.url)

      allPages = [...allPages, ...pageUrls]

      if (data.results.length < limit) break // Stop if last page reached

      offset += limit // Move to next batch
    }
  } catch (error) {
    console.error('Error fetching Builder.io pages', error)
  }

  return allPages
}

export const generateSiteMap = (builderPages: string[]): string => {
  const baseUrl = process.env.NEXT_PUBLIC_URL?.replace(/\/+$/, '') || 'https://www.fortislife.com'

  // Recursive function to generate category URLs
  const generateCategoryUrls = (builderPages: string[] = []): string => {
    return builderPages
      .map((pageUrl) => {
        const cleanPageUrl = pageUrl.replace(/^\/+/, '') // Remove leading slashes
        return `
             <url>
              <loc>${baseUrl}/${cleanPageUrl}</loc>
              <changefreq>daily</changefreq>
              <priority>0.7</priority>
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
  const sitemap = generateSiteMap(builderPages)

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
