import React, { useState, useEffect, useRef, PropsWithChildren, useCallback } from 'react'

import { BuilderComponent, builder } from '@builder.io/react'
import Add from '@mui/icons-material/Add'
import Apps from '@mui/icons-material/Apps'
import ReorderRounded from '@mui/icons-material/ReorderRounded'
import {
  Grid,
  MenuItem,
  Box,
  Button,
  Link,
  Typography,
  Breadcrumbs,
  Stack,
  useMediaQuery,
} from '@mui/material'
import algoliasearch from 'algoliasearch'
import getConfig from 'next/config'
import ErrorPage from 'next/error'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  InstantSearch,
  SearchBox,
  RefinementList,
  useInfiniteHits,
  useConfigure,
} from 'react-instantsearch-hooks-web'

import { PLPStyles } from '@/components/page-templates/ProductListingTemplate/ProductListingTemplate.styles'
import { ProductHitListView, ProductHitGridView } from '@/components/product'
import { productIndex, searchClient } from '@/lib/api/util/algolia'
import type { MetaData, PageWithMetaData } from '@/lib/types'

import type { BaseHit } from 'instantsearch.js'
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

const MyHitsComponent = ({ categoryCode }: { categoryCode: string }) => {
  const infiniteHits = useInfiniteHits<BaseHit>(),
    hits = infiniteHits.hits,
    results = infiniteHits.results,
    isLast = (infiniteHits as any).isLast,
    showMore = (infiniteHits as any).showMore,
    isMobile = useMediaQuery('(max-width:600px)')
  const [isListView, setIsListView] = useState<boolean>(true)
  const { t } = useTranslation('common')

  useConfigure({
    hitsPerPage: 15,
    filters: `category_pages:${categoryCode}`,
  } as any)

  const handleLoadMore = useCallback(() => {
    if (!isLast) {
      showMore()
    }
  }, [isLast, showMore])

  return (
    <div style={{ display: isMobile ? 'block' : 'flex' }}>
      {/* Left Column – Filters */}
      <div
        style={{
          width: isMobile ? '100%' : '250px',
          padding: '20px',
          borderRight: isMobile ? 'none' : '1px solid #ddd',
        }}
      >
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
      <Box sx={{ flex: 1, padding: '20px' }}>
        <Box id="product-listing-section" sx={{ ...PLPStyles.plpGrid }}>
          <Box sx={{ ...PLPStyles.navBar }}>
            <Box sx={{ ...PLPStyles.navBarMain }}>
              <Box sx={{ ...PLPStyles.navBarView }}>
                <Box
                  onClick={() => setIsListView(true)}
                  title="List View"
                  sx={{ cursor: 'pointer' }}
                  tabIndex={0}
                >
                  <ReorderRounded fontSize="medium" {...(isListView && { color: 'primary' })} />
                </Box>
                <Box
                  onClick={() => setIsListView(false)}
                  title="Grid View"
                  sx={{ cursor: 'pointer' }}
                  tabIndex={0}
                >
                  <Apps fontSize="medium" {...(!isListView && { color: 'primary' })} />
                </Box>
              </Box>

              <Box sx={{ ...PLPStyles.navBarSort }}>
                <Box sx={{ ...PLPStyles.filterBy }}></Box>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', margin: '1rem 0 0 1rem' }}></Box>
            <Box sx={{ ...PLPStyles.totalResults }} pb={1}>
              {t('no-of-products', { count: results?.nbHits ?? 0 })}
            </Box>
          </Box>
          <Box>
            {isMobile ? (
              <Grid container sx={{ flexWrap: 'wrap', rowGap: 2 }}>
                {hits.map((hit) => (
                  <Grid
                    key={hit.objectID}
                    item
                    display={'flex'}
                    justifyContent={'center'}
                    lg={isListView ? 12 : 4}
                    md={isListView ? 12 : 4}
                    sm={isListView ? 12 : 4}
                    xs={isListView ? 12 : 6}
                  >
                    <ProductHitGridView hit={hit as any} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container sx={{ flexWrap: 'wrap', rowGap: 2 }}>
                {hits.map((hit) =>
                  isListView ? (
                    <Grid
                      key={hit.objectID}
                      item
                      display={'flex'}
                      justifyContent={'center'}
                      lg={isListView ? 12 : 4}
                      md={isListView ? 12 : 4}
                      sm={isListView ? 12 : 4}
                      xs={isListView ? 12 : 6}
                    >
                      <ProductHitListView key={hit.objectID} hit={hit as any} />
                    </Grid>
                  ) : (
                    <Grid
                      key={hit.objectID}
                      item
                      display={'flex'}
                      justifyContent={'center'}
                      lg={isListView ? 12 : 4}
                      md={isListView ? 12 : 4}
                      sm={isListView ? 12 : 4}
                      xs={isListView ? 12 : 6}
                    >
                      <ProductHitGridView key={hit.objectID} hit={hit as any} />
                    </Grid>
                  )
                )}
              </Grid>
            )}
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
          <Box sx={{ ...PLPStyles.productResults, color: 'grey.900', margin: '56px 0 12px 0' }}>
            {t('products-to-show', {
              m: `${hits.length}`,
              n: `${results?.nbHits ?? 0}`,
            })}
          </Box>
          {!isLast && (
            <Box sx={{ ...PLPStyles.productResults }}>
              <Button
                onClick={handleLoadMore}
                id="show-more-button"
                sx={{ ...PLPStyles.showMoreButton }}
                variant="outlined"
              >
                {t('show-more')}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </div>
  )
}

const CategoryPage: NextPage<CategoryPageType> = (props) => {
  const router = useRouter()
  const { publicRuntimeConfig } = getConfig()
  const categoryCode = (props.categoryCode as string) || (router.query.categoryCode as string)

  return (
    <>
      <BuilderComponent
        model={publicRuntimeConfig?.builderIO?.modelKeys?.categoryTopSection}
        content={props.section}
      />

      <InstantSearch searchClient={searchClient} indexName="products">
        <MyHitsComponent categoryCode={categoryCode} />
      </InstantSearch>
    </>
  )
}

export default CategoryPage
