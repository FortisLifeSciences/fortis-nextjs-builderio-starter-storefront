// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    localeDetection: true,
  },
  localePath: path.resolve('./public/locales'),
  // Without this, next-i18next caches locale JSON in memory for the life of the server
  // process - editing public/locales/*.json during `next dev` has no effect until restart.
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
