'use client'

import React, { useEffect, useRef } from 'react'

import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js'
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions'
import { liteClient as algoliasearch } from 'algoliasearch/lite'
import '@algolia/autocomplete-theme-classic'
import getConfig from 'next/config'
import { useRouter } from 'next/router'

import fortisLogo from '@/assets/fortisLogo.png'
import resourceTypeArr from '@/components/common/ResourceTypeArr'
import abcoreLogo from '@/public/BrandLogos/abcore_logo.png'
import aristaLogo from '@/public/BrandLogos/arista_logo.png'
import bethylLogo from '@/public/BrandLogos/bethyl_logo.png'
import empiricalLogo from '@/public/BrandLogos/empirical_logo.png'
import nanocomposixLogo from '@/public/BrandLogos/nanocomposix_logo.png'
import vectorLogo from '@/public/BrandLogos/vector_logo.png'
import DefaultImage from '@/public/noImage.png'

const h = React.createElement
import type { AutocompletePlugin, AutocompleteSource } from '@algolia/autocomplete-js'

type QuickAccessHit = {
  title: string
  targetURL: string
  iconURL?: string
  cssStyle?: string
  __autocomplete_id: string
}
type CssStyle = 'darkPurple' | 'lightPurple' | 'lightGrey'

interface QuickAccessItem {
  title: string
  targetURL?: string
  cssStyle?: CssStyle
  iconURL?: string
  __autocomplete_id?: string
  [key: string]: unknown // 👈 add this line
}

const brandLogos: Record<string, string> = {
  abcore: abcoreLogo.src,
  arista: aristaLogo.src,
  bethyl: bethylLogo.src,
  empirical: empiricalLogo.src,
  nanocomposix: nanocomposixLogo.src,
  vector: vectorLogo.src,
  fortis: fortisLogo.src,
  // fallback for brands not in the list
  default: DefaultImage.src,
}

const { publicRuntimeConfig } = getConfig()
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || publicRuntimeConfig?.ALGOLIA_APP_ID
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || publicRuntimeConfig?.ALGOLIA_SEARCH_KEY
const searchClient = algoliasearch(appId, apiKey) as any

const AlgoliaAutocomplete = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  //redirect to search page
  const router = useRouter()
  const handleEnterSearch = (value: string) => {
    const safeValue = String(value || '').slice(0, 512)
    router.push({ pathname: '/search', query: { query: safeValue } })
  }
  useEffect(() => {
    const wrapper = document.getElementById('autocomplete') as HTMLElement | null

    const getPanel = () => document.querySelector<HTMLElement>('.aa-Panel') ?? null

    const updateContentOffset = () => {
      if (wrapper) {
        const panel = getPanel()
        if (panel) {
          const navbar = document.querySelector<HTMLElement>('[data-testid="header-container"]')
          const navbarBottom = navbar
            ? navbar.getBoundingClientRect().bottom
            : wrapper.getBoundingClientRect().bottom + 8
          panel.style.top = `${navbarBottom}px`
        }
      }
    }

    if (!wrapper) return

    // 1. Watch wrapper size
    const resizeObs = new ResizeObserver(updateContentOffset)
    resizeObs.observe(wrapper)

    // 2. Watch for the panel being added/removed
    const mutationObs = new MutationObserver(updateContentOffset)
    mutationObs.observe(document.body, { childList: true, subtree: true })

    // Initial run
    updateContentOffset()

    return () => {
      resizeObs.disconnect()
      mutationObs.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    let justRedirected = false

    /// quick access plugin start
    const quickAccessPlugin: AutocompletePlugin<any, any> = {
      getSources({ query }) {
        if (query) return []

        const source: AutocompleteSource<QuickAccessItem> = {
          sourceId: 'quickAccessPlugin',
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: 'products_query_suggestions',
                  query,
                  params: {
                    hitsPerPage: 0, // we’re using userData only
                    ruleContexts: ['autocomplete'],
                  },
                },
              ] as any,
              transformResponse({ results }) {
                const userDataSections = results
                  .map((result) => {
                    if ('userData' in result && result.userData && result.userData[0]) {
                      const sectionItems = result.userData[0].sections
                      return Array.isArray(sectionItems) ? sectionItems : []
                    } else {
                      return []
                    }
                  })
                  .flat()

                return [userDataSections]
              },
            })
          },
          templates: {
            header({ html }: { html: any }) {
              return html`<div class="aa-quickAccess-header">
                <h4>Explore Fortis</h4>
              </div>`
            },
            item({ item, html }: { item: any; html: any }) {
              const cssStyleClassMap: Record<CssStyle, string> = {
                darkPurple: 'dark-purple',
                lightPurple: 'light-purple',
                lightGrey: 'light-grey',
              }

              const extraClass =
                item.cssStyle && item.cssStyle in cssStyleClassMap
                  ? cssStyleClassMap[item.cssStyle as CssStyle]
                  : ''

              const iconHTML = item.iconURL
                ? html`<img class="aa-ItemIcon" src="${item.iconURL}" alt="${item.title || ''}" />`
                : ''

              return html`<a
                class="aa-item-wrapper ${extraClass}"
                id="quickAccessPlugin-item-${item.__autocomplete_id}"
                href="${item.targetURL || '#'}"
                role="link"
              >
                <div class="aa-ItemContent">
                  ${iconHTML}
                  <div class="aa-ItemContentTitle">${item.title}</div>
                </div>
              </a>`
            },
          },
        }

        return [source]
      },
    }
    ///////////////quick access plugin end

    ///query suggestion plugin start
    const querySuggestionsPlugin = createQuerySuggestionsPlugin({
      searchClient,
      indexName: 'products_query_suggestions',
      getSearchParams() {
        return { hitsPerPage: 5 }
      },
      transformSource({ source }) {
        return {
          ...source,
          sourceId: 'querySuggestions',
          onSelect({ item, setIsOpen }) {
            if (typeof window !== 'undefined') {
              justRedirected = true
              handleEnterSearch(item.query)
            }
          },
          templates: {
            ...source.templates,
            header({ html }) {
              return html`<h4>Suggestions</h4>`
            },
          },
        }
      },
    })
    ///query suggestion plugin end

    ///popular plugin start
    const popularPlugin = createQuerySuggestionsPlugin({
      searchClient,
      indexName: 'products_query_suggestions',
      getSearchParams() {
        return {
          query: '',
          hitsPerPage: 6,
        }
      },
      transformSource({ source }) {
        return {
          ...source,
          sourceId: 'popularPlugin',
          getItemInputValue({ item }) {
            return item.query
          },
          onSelect({ item, setIsOpen }) {
            if (typeof window !== 'undefined') {
              justRedirected = true
              handleEnterSearch(item.query)
            }
          },
          templates: {
            header({ html }) {
              return html`<h4>Popular Searches</h4>`
            },
            item({ item, html }: { item: any; html: any }) {
              return html`<div
                class="aa-itemWrapper"
                id="popularPlugin-item-${item.__autocomplete_id}"
              >
                <div class="aa-ItemContentTitle">${item.query}</div>
              </div>`
            },
          },
        }
      },
    })
    ///popular plugin end

    ///getsources function start
    const getSourcesForAlgolia = ({
      query,
      searchClient,
    }: {
      query: string
      searchClient: any
    }) => {
      const sources: any[] = []
      const safeQuery = String(query || '').slice(0, 512)

      if (safeQuery.length < 1) return sources

      sources.push(
        // Products source
        {
          sourceId: 'products',
          getItems({ setContext }: { setContext: (context: any) => void }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: 'products',
                  query: safeQuery,
                  params: {
                    hitsPerPage: 4,
                  },
                },
              ] as any,
              transformResponse({ results, hits }) {
                if ('nbHits' in results[0]) {
                  setContext({
                    productHits: results[0].nbHits,
                  })
                }

                const items = (results[0] as any)?.hits || []

                for (let i = 0; i < items.length; i++) {
                  const item = items[i] as any
                  item.__autocomplete_position = i + 1
                }

                return items
              },
            })
          },
          //updated for algolia version update -WEB-1657
          //getItemInputValue(query: string) {
          // return query
          //},
          getItemInputValue() {
            return ''
          },
          getItemUrl({ item }: { item: any }) {
            return item?.product_url || '#'
          },
          templates: {
            header({ html }: { html: any }) {
              return html`<h4>Products</h4>`
            },
            item({ item, html }: { item: any; html: any }) {
              // const link = (item && item.product_url) || '#'
              const link =
                item && item.product_url
                  ? item.product_url +
                    (item.product_url.includes('?selected=')
                      ? '&queryID=' + item.__autocomplete_queryID
                      : '?queryID=' + item.__autocomplete_queryID)
                  : '#'
              const title =
                typeof item && item.product_name === 'string'
                  ? item.product_name.split(' | ')[0]
                  : typeof item.name === 'string'
                  ? item.name
                  : 'Untitled'
              ////
              const rawBrandCode = item.brand_code || item.brand || ''
              const normalizedBrand = rawBrandCode.toLowerCase().trim()
              const fallbackImage = brandLogos[normalizedBrand] || brandLogos.default
              const imageSrc = item.product_images?.[0]
                ? `https://cdn-tp1.mozu.com/31165-m1/cms/files/${item.product_images[0]}`
                : fallbackImage
              /*console.log('Product:', {
                  rawBrand: rawBrandCode,
                  normalizedBrand,
                  imageUsed: imageSrc,
                  foundLogo: brandLogos[normalizedBrand] ? true : false,
                  knownBrands: Object.keys(brandLogos),
                })*/
              ////
              const brand = item.brand || ''
              const name = item.slice_product ? item.product_name_variant : item.product_name
              const sku = item.slice_product ? item.sku : item.plp_catalog_number
              const showNewTag = item.new_product
              const dataInsightMethod = 'clickedObjectIDsAfterSearch'

              return html`<div class="aa-ItemWrapper">
                <a
                  href="${link}"
                  target="_self"
                  rel="noopener noreferrer"
                  class="aa-CustomCard"
                  data-insights-object-id="${item.objectID}"
                  data-insights-position="${item.__autocomplete_position}"
                  data-insights-query-id="${item.__autocomplete_queryID}"
                  data-insights-index="${item.__autocomplete_indexName}"
                  data-insights-method="${dataInsightMethod}"
                >
                  ${showNewTag
                    ? html`<div
                        class="aa-NewTag"
                        style="background-image: url('/NewTag.svg');"
                      ></div>`
                    : ''}
                  <span class="aa-CardImageLink">
                    <img src="${imageSrc}" alt="Product" class="aa-CardImage" />
                  </span>
                  <p class="aa-CardBrand">${brand}</p>
                  <span class="aa-CardTitle"> ${name || title} </span>
                  <p class="aa-CardSku">${sku || ''}</p>
                </a>
              </div>`
            },
            footer({ state, html }: { state: any; html: any }) {
              const totalHits = state.context.productHits
              const encodedQuery = encodeURIComponent(safeQuery)
              if (totalHits > 4) {
                return html`
                  <a class="aa-products-see-all" href="/search?query=${encodedQuery}">
                    See All Products (${totalHits})
                  </a>
                `
              } else {
                return ''
              }
            },
          },
        },

        // Builder Page Source
        {
          sourceId: 'builder-page',
          getItems({ setContext }: { setContext: (context: any) => void }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: 'builder-page',
                  query: safeQuery,
                  params: {
                    hitsPerPage: 3,
                  },
                },
              ] as any,
              transformResponse({ results, hits }) {
                if ('nbHits' in results[0]) {
                  setContext({
                    pageHits: results[0].nbHits,
                  })
                }
                const items = (results[0] as any)?.hits || []
                for (let i = 0; i < items.length; i++) {
                  const item = items[i] as any
                  item.__autocomplete_position = i + 1
                }

                return items
              },
            })
          },
          //updated for website search algolia version update - WEB-1657
          //getItemInputValue(query: string) {
          //return query
          //},
          getItemInputValue() {
            return ''
          },
          getItemUrl({ item }: { item: any }) {
            return item?.query?.[0]?.value || item?.meta?.lastPreviewUrl || '#'
          },
          templates: {
            header({ html }: { html: any }) {
              return html`<h4>More from Fortis</h4>`
            },
            item({ item, html }: { item: any; html: any }) {
              const link =
                (item?.query && item?.query?.[0]?.value) ||
                (item.meta && item.meta.lastPreviewUrl) ||
                '#'
              const title =
                typeof (item.data && item.data.title) === 'string'
                  ? item.data.title.split(' | ')[0]
                  : typeof item.name === 'string'
                  ? item.name
                  : 'Untitled'

              const image = item.data && item.data.image
              const resourceTypeIcon = resourceTypeArr.find(
                (data) => data.resourceType === item?.data?.resourceType
              )

              const iconHTML = resourceTypeIcon
                ? html`<span class="material-symbols-outlined">${resourceTypeIcon.value}</span>`
                : html`<span class="material-symbols-outlined">description</span>`
              const dataInsightMethod = 'clickedObjectIDsAfterSearch'

              return html`<div class="aa-itemWrapper">
                <div class="aa-ItemContent">
                  <div class="aa-ItemImageWrapper">
                    ${image
                      ? html`<img src="${image}" alt="${title}" class="aa-ItemImage" />`
                      : iconHTML}
                  </div>
                  <a
                    class="aa-ItemTitle"
                    href="${link}"
                    target="_self"
                    rel="noopener noreferrer"
                    data-insights-object-id="${item.objectID}"
                    data-insights-position="${item.__autocomplete_position}"
                    data-insights-query-id="${item.__autocomplete_queryID}"
                    data-insights-index="${item.__autocomplete_indexName}"
                    data-insights-method="${dataInsightMethod}"
                  >
                    ${title.split(' | ')[0]}
                  </a>
                </div>
              </div>`
            },
            footer({ state, html }: { state: any; html: any }) {
              const totalHits = state.context.pageHits
              const encodedQuery = encodeURIComponent(safeQuery)

              if (typeof totalHits === 'number' && totalHits > 3) {
                return html`<a class="aa-builder-see-all" href="/search?query=${encodedQuery}">
                  See All
                </a>`
              } else {
                return ''
              }
            },
          },
        }
      )

      return sources
    }
    ///getsources function end

    const search = autocomplete<QuickAccessHit>({
      container: containerRef.current,
      placeholder: 'Search',
      openOnFocus: true,
      insights: true,
      navigator: {
        navigate({ itemUrl }: { itemUrl: string }) {
          window.location.assign(itemUrl)
        },
      },
      plugins: [querySuggestionsPlugin, popularPlugin, quickAccessPlugin],
      onSubmit({ state }) {
        justRedirected = true
        //handleEnterSearch(state.query) // 👈 This runs on enter
        //updated for algolia version update -WEB-1657
        handleEnterSearch(String(state.query || '').slice(0, 512))
      },
      shouldPanelOpen({ state }) {
        if (justRedirected) {
          return false
        }
        if (!state.query) {
          return false
        }
        return state.collections.some((collection) => collection.items.length > 0)
      },
      onStateChange({ state }) {
        const input = document.querySelector('#autocomplete input')
        if (input) {
          // Reset the redirect flag on actual user focus
          input.addEventListener(
            'focus',
            () => {
              justRedirected = false
            },
            { once: true }
          )
        }
      },
      //update for algolia version update -WEB-1657
      //getSources: ({ query }) => getSourcesForAlgolia({ query, searchClient }),
      getSources: ({ query }) =>
        getSourcesForAlgolia({
          query: String(query || '').slice(0, 512),
          searchClient,
        }),
    })
    return () => search.destroy()
  }, [])

  return <div ref={containerRef} id="autocomplete" />
}

export default AlgoliaAutocomplete
