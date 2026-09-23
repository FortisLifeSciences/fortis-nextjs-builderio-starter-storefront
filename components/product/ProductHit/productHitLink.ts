export type ProductHitLike = {
  parent_id?: string | null
  product_url?: string | null
  sku?: string | null
}

export const resolveProductCodeFromHit = (hit?: ProductHitLike | null): string | null => {
  if (!hit) return null

  const rawUrl = hit.product_url
  if (rawUrl) {
    try {
      const pathname = rawUrl.startsWith('http') ? new URL(rawUrl).pathname : rawUrl
      const cleaned = pathname.replace(/^\/+|\/+$/g, '')
      const segments = cleaned ? cleaned.split('/').filter(Boolean) : []

      if (segments.length >= 3 && segments[0] === 'products') {
        const candidate = segments[segments.length - 1]
        return candidate || null
      }

      if (segments.length === 2 && segments[0] === 'products') {
        return null
      }

      if (segments.length >= 1) {
        const candidate = segments[segments.length - 1]
        if (candidate && candidate !== 'products') return candidate
      }
    } catch {
      // Fall back to the explicit hit values below if the URL cannot be parsed
    }
  }

  const parentId = hit.parent_id?.toString().trim()
  if (parentId && parentId !== 'products') {
    return parentId
  }

  const sku = hit.sku?.toString().trim()
  return sku || null
}

export const buildProductHitLink = (hit?: ProductHitLike | null) => {
  const productCode = resolveProductCodeFromHit(hit)

  if (!productCode) {
    return {
      href: '#',
      as: '#',
      isValid: false,
    }
  }

  const fallbackAs = (() => {
    const url = hit?.product_url || '#'
    if (!url || url === '#') return `/product/${productCode}`
    if (!url.startsWith('http')) return url
    try {
      const parsed = new URL(url)
      return parsed.pathname + parsed.search + parsed.hash
    } catch {
      return `/product/${productCode}`
    }
  })()

  return {
    href: `/product/${productCode}`,
    as: fallbackAs,
    isValid: true,
  }
}
