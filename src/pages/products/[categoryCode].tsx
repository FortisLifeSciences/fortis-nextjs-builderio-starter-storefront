import { useEffect, useRef, useState, PropsWithChildren } from 'react'

import { BuilderComponent, builder } from '@builder.io/react'
import algoliasearch from 'algoliasearch'
import getConfig from 'next/config'
import ErrorPage from 'next/error'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  InstantSearch,
  SearchBox,
  RefinementList,
  Hits,
  Pagination,
  Configure,
} from 'react-instantsearch-dom'

import { ProductHit } from '@/components/product'
import { productIndex, searchClient } from '@/lib/api/util/algilia'
import type { MetaData, PageWithMetaData } from '@/lib/types'

import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from 'next'

interface CategoryPageType extends PageWithMetaData {
  seoFriendlyUrl?: string
  categoryCode?: string
  section?: any
}

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)

function getMetaData(data: any): MetaData {
  return {
    title: data?.title || null,
    description: data?.description || null,
    keywords: data?.metaTagKeywords || null,
    canonicalUrl: null,
    robots: null,
  }
}

export async function getStaticPaths() {
  const response = await productIndex.search('', {
    facets: ['category_pages'],
  })

  const categories = response?.facets?.category_pages

  const paths = categories
    ? Object.keys(categories).map((categoryCode) => ({
        params: { categoryCode },
      }))
    : []

  return { paths, fallback: 'blocking' }
}

export async function getStaticProps(
  context: GetStaticPropsContext
): Promise<GetStaticPropsResult<CategoryPageType>> {
  const { locale, params } = context
  const { publicRuntimeConfig } = getConfig()
  const { categoryCode } = params as { categoryCode: string }
  const categoryTopSection = publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection || ''
  const builderSection = await builder
    .get(categoryTopSection, {
      userAttributes: { slug: `category-${categoryCode}`, urlPath: `/products/${categoryCode}` },
    })
    .promise()

  return {
    props: {
      categoryCode,
      metaData: getMetaData(builderSection?.data),
      section: builderSection || null,
      ...(await serverSideTranslations(locale as string, ['common'])),
    } as CategoryPageType,
    revalidate: 60,
  }
}

const CategoryPage: NextPage<CategoryPageType> = (props) => {
  const router = useRouter()
  const { publicRuntimeConfig } = getConfig()
  const { categoryCode } = router.query
  const code = props.categoryCode || categoryCode
  return (
    <>
      <BuilderComponent
        model={publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection}
        content={props.section}
      />

      <InstantSearch searchClient={searchClient} indexName="products">
        <Configure hitsPerPage={12} filters={`category_pages:${code}`} />
        <div style={{ display: 'flex' }}>
          {/* Left Column – Filters */}
          <div style={{ width: '250px', padding: '20px', borderRight: '1px solid #ddd' }}>
            <h3>Filters</h3>
            {/* {facetKeys.map((facetKey) => (
              <div key={facetKey} style={{ marginBottom: '20px' }}>
                <h4
                  style={{ cursor: 'pointer', marginBottom: '10px' }}
                  onClick={() => toggleFacet(facetKey)}
                >
                  {getFacetLabel(facetKey)}
                </h4>
                {expandedFacets[facetKey] && (
                  <RefinementList
                    attribute={facetKey}
                    showMore={true}
                    limit={6}
                    transformItems={(items: RefinementListItem[]) =>
                      items.map((item) => ({
                        ...item,
                        label: item.label,
                      }))
                    }
                  />
                )}
              </div>
            ))} */}
          </div>

          {/* Right Column – Results */}
          <div style={{ flex: 1, padding: '20px' }}>
            <h1>Category: {categoryCode}</h1>

            {/* Optional: Add a search box */}
            {/* <SearchBox /> */}
            <div>
              {/* <button
                  onClick={() => setViewMode('list')}
                  disabled={viewMode === 'list'}
                  style={{ marginRight: 8 }}
                >
                  Grid
                </button>
                <button onClick={() => setViewMode('grid')} disabled={viewMode === 'grid'}>
                  List
                </button> */}
            </div>
            <div>
              <Hits hitComponent={ProductHit} />
            </div>

            <Pagination />
          </div>
        </div>
      </InstantSearch>
    </>
  )
}

export default CategoryPage
