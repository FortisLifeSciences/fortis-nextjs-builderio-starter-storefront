import { useEffect, useState } from 'react'

import algoliasearch from 'algoliasearch/lite'
import 'swiper/css'
import 'swiper/css/navigation'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ResourceSearchSliders from '@/components/layout/Algolia/ResourceSearchSliders'
import { useGetSearchedProducts } from '@/hooks'
import { productSearch } from '@/lib/api/operations'
import type { CategorySearchParams, MetaData, PageWithMetaData } from '@/lib/types'

import type { ProductSearchResult } from '@/lib/gql/types'
import type { SearchResponse } from '@algolia/client-search'
import type { NextPage, GetServerSidePropsContext, GetServerSideProps, NextApiRequest } from 'next'

const searchClient = algoliasearch('YQAIETZ5F1', 'c2cc99ace97599deaf1606dba442f9ae')

type BuilderPageHit = {
  objectID: string
  data?: {
    title?: string
    image?: string
    description?: string
    contentType?: string
    resourceType?: string
    resourceCategory?: string
  }
  meta?: {
    lastPreviewUrl?: string
  }
}
interface SearchPageType extends PageWithMetaData {
  results: ProductSearchResult
}

function getMetaData(): MetaData {
  return {
    title: 'Search Results',
    description: null,
    keywords: null,
    canonicalUrl: null,
    robots: 'noindex,nofollow',
  }
}
const { publicRuntimeConfig } = getConfig()

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const response = await productSearch(
    {
      pageSize: publicRuntimeConfig.productListing.pageSize,
      ...context.query,
    } as CategorySearchParams,
    context.req as NextApiRequest
  )
  const { locale } = context

  return {
    props: {
      results: response?.data?.products || [],
      metaData: getMetaData(),
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const SearchPage: NextPage<SearchPageType> = (props) => {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<CategorySearchParams>(
    router.query as unknown as CategorySearchParams
  )

  const [manualSearchResults, setManualSearchResults] = useState<SearchResponse<unknown>[] | null>(
    null
  )

  const searchQuery = router?.query?.query || ''
  console.log('searchQuery:', searchQuery)

  useEffect(() => {
    if (!searchQuery && router.query.search && !router.query.query) {
      const { search, ...rest } = router.query
      router.replace({
        pathname: router.pathname,
        query: {
          ...rest,
          query: search,
        },
      })
    }
  }, [router.query, router])

  const { data: searchPageResults, isFetching } = useGetSearchedProducts(
    {
      ...searchParams,
      pageSize: searchParams.pageSize || publicRuntimeConfig.productListing.pageSize,
    },
    props.results
  )

  const breadcrumbs = [{ text: 'Home > Search Results', link: '/' }]
  const searchPageHeading = searchQuery
    ? t('search-results', {
        m: `${searchPageResults?.totalCount || 0}`,
        n: `"${searchQuery}"`,
      })
    : breadcrumbs[breadcrumbs.length - 1].text

  useEffect(() => {
    if (searchQuery) {
      const query = Array.isArray(searchQuery) ? searchQuery.join(' ') : searchQuery

      searchClient
        .search([
          {
            indexName: 'builder-page',
            params: {
              query,
            },
          },
          {
            indexName: 'products',
            params: {
              query,
              hitsPerPage: 10,
            },
          },
        ])
        .then((res) => {
          console.log('Manual multi-index search results:', res)
          const filteredResults = res.results.filter(
            (result) => (result as SearchResponse<unknown>).hits !== undefined
          )
          setManualSearchResults(filteredResults as SearchResponse<unknown>[])
        })
        .catch((err) => {
          console.error('Search error:', err)
        })
    } else {
      setManualSearchResults(null)
    }
  }, [searchQuery, searchClient])

  return (
    <>
      {/* Manual Search Results Display */}
      {manualSearchResults === null ? (
        <p> Loading search results...</p>
      ) : (
        manualSearchResults.map((result, index) => {
          if (result.index === 'builder-page') {
            const hits = result.hits as BuilderPageHit[]
            const resourceHits = hits
              .filter((hit) => hit.data?.contentType === 'Resource')
              .slice(0, 10)
            const nonResourceHits = hits
              .filter((hit) => hit.data?.contentType !== 'Resource')
              .slice(0, 10)

            return (
              <ResourceSearchSliders
                key={index}
                nonResourceHits={nonResourceHits}
                resourceHits={resourceHits}
                query={result.query || ''}
                index={index}
              />
            )
          }

          return (
            <div key={index} style={{ marginBottom: '2rem' }}>
              <h4>Index: {result.index}</h4>
              <ul>
                {result.hits.slice(0, 10).map((hit: any, i: number) => (
                  <li key={`prod-${i}`}>
                    <strong>{hit.product_name || 'No title'}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )
        })
      )}
    </>
  )
}

export default SearchPage
