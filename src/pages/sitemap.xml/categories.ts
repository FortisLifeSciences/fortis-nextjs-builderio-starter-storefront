import { GetServerSideProps } from 'next'

import { fetchCategoryTree } from '@/hooks'

import { Maybe, PrCategory } from '@/lib/gql/types'
//pages/sitemap.xml.js

export const generateSiteMap = (categoryItems: Array<PrCategory>): string => {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.fortislife.com/'

  // Recursive function to generate category URLs
  const generateCategoryUrls = (categories: Maybe<PrCategory>[] = []): string => {
    return categories
      .filter((category): category is PrCategory => category !== null) // Remove null values
      .filter((category) => category.isDisplayed) // Exclude hidden categories
      .map((category) => {
        const categoryUrl = `${baseUrl}products/${category.categoryCode}/`
        const lastmod = category?.updateDate
          ? new Date(category?.updateDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
        return `
            <url>
              <loc>${categoryUrl}</loc>
              <lastmod>${lastmod}</lastmod>
            </url>
            ${generateCategoryUrls(
              category.childrenCategories?.filter((c): c is PrCategory => c !== null) ?? []
            )}
          `
      })
      .join('')
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${generateCategoryUrls(categoryItems)}
    </urlset>`
}

const getLastModDate = (): string => {
  return new Date().toISOString().split('T')[0]
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
