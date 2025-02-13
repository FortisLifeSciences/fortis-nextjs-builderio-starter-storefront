import { GetServerSideProps } from 'next'

//pages/sitemap.xml.js

export const generateSiteMap = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://example.com'

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>${baseUrl}</loc>
            <changefreq>daily</changefreq>
            <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}cart</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}my-account</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}my-account/b2b/account-hierarchy</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}my-account/b2b/lists</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}my-account/b2b/quick-order</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}my-account/b2b/quotes</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}my-account/b2b/users</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}my-account/order-history</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}my-account/subscription</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}order-confirmation</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}order-status</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}search</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
        <url>
        <loc>${baseUrl}user/resetpasswordconfirm</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
        </url>
    </urlset>`
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap()

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
