export const TRANSPARENT_PAGES = [
  '/',
  '/new-home-page',
  '/new-about',
  '/about',
  '/our-company',
  '/new-services-page',
  '/fortis-grant-2026-abnano-vhh-discovery',
  '/data-in-focus',
]

export const isTransparentPagePath = (asPath: string) =>
  TRANSPARENT_PAGES.includes(asPath.split('?')[0])
