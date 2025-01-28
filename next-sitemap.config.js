module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000', // change to prod url when deploying
  changefreq: 'daily',
  priority: 0.8,
  sitemapSize: 7000,
  generateIndexSitemap: true,
  generateRobotsTxt: true, // (optional)
  // ...other options
  robotsTxtOptions: {
    transformRobotsTxt: async (_, robotsTxt) =>
      `#robots.txt for ${
        process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
      } updated ${new Date().toISOString()}  \n\n${robotsTxt}`,
    policies: [
      {
        userAgent: 'Googlebot',
        disallow: '/',
      },
      {
        userAgent: 'PowerMapper',
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: [
          '/admin*',
          '/cart*',
          '/checkout*',
          '/search*',
          '/my-account*',
          '/user*',
          '/util*',
          '/storefront/email/render/*',
          '/print-return*',
          '/guest-checkout*',
          '/print-order*',
          '/nomore*',
          '/registrations-sign-in*',
          '/home-temp*',
          '/test-pricelist*',
          '/*?*',
        ],
      },
      {
        userAgent: 'AhrefsSiteAudit',
        allow: '/',
      },
      {
        userAgent: 'Baiduspider',
        disallow: '/',
      },
      {
        userAgent: '*',
        disallow: '/*',
      },
      {
        userAgent: '*',
        crawlDelay: 5,
      },
    ],
  },
}
