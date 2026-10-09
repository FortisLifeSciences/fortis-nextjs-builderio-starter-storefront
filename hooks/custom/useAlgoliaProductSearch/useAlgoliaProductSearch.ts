import { useEffect, useState } from 'react'

import { productIndex } from '@/lib/api/util/algolia'

export interface AlgoliaProductHit {
  objectID: string
  catalogNumber: string
  productName: string
  productUrl?: string
  sku?: string
}

interface UseAlgoliaProductSearchParams {
  query: string
  hitsPerPage?: number
  enabled?: boolean
}

const asText = (value: unknown): string => (typeof value === 'string' ? value : '')

const mapHit = (hit: Record<string, unknown>): AlgoliaProductHit => ({
  objectID: asText(hit?.objectID),
  catalogNumber: asText(hit?.sku) || asText(hit?.plp_catalog_number) || asText(hit?.objectID),
  productName: asText(hit?.product_name_variant) || asText(hit?.product_name),
  productUrl: asText(hit?.product_url),
  sku: asText(hit?.sku),
})

export const useAlgoliaProductSearch = (params: UseAlgoliaProductSearchParams) => {
  const { query, hitsPerPage = 8, enabled = true } = params

  const [hits, setHits] = useState<AlgoliaProductHit[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const trimmed = query?.trim()

    if (!enabled || !trimmed) {
      setHits([])
      setIsLoading(false)
      return
    }

    let isStale = false
    setIsLoading(true)

    productIndex
      .search(trimmed, { hitsPerPage })
      .then((response) => {
        if (isStale) return
        const returnedHits = (response as { hits?: Record<string, unknown>[] })?.hits ?? []
        setHits(returnedHits.map(mapHit))
      })
      .catch((error: unknown) => {
        if (isStale) return
        console.error('Error: Algolia product search', error)
        setHits([])
      })
      .finally(() => {
        if (!isStale) setIsLoading(false)
      })

    return () => {
      isStale = true
    }
  }, [query, hitsPerPage, enabled])

  return { hits, isLoading }
}
