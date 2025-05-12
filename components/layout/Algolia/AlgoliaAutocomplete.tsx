'use client'

import React, { useEffect, useRef } from 'react'

import { autocomplete, getAlgoliaResults, AutocompletePlugin } from '@algolia/autocomplete-js'
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions'
import algoliasearch from 'algoliasearch'
import '@algolia/autocomplete-theme-classic'
import getConfig from 'next/config'
import { useRouter } from 'next/router'

import fortisLogo from '@/assets/fortisLogo.png'
import resourceTypeArr from '@/components/common/ResourceTypeArr'

const h = React.createElement

type QuickAccessHit = {
  title: string
  targetURL: string
  iconURL?: string
  cssStyle?: string
  __autocomplete_id: string
}

const { publicRuntimeConfig } = getConfig()
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || publicRuntimeConfig?.ALGOLIA_APP_ID
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || publicRuntimeConfig?.ALGOLIA_SEARCH_KEY
const searchClient = algoliasearch(appId, apiKey)

const AlgoliaAutocomplete = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  //redirect to search page
  const router = useRouter()
  const handleEnterSearch = (value: string) => {
    router.push({ pathname: '/search', query: { query: value } }) // 👈 updated
  }

  useEffect(() => {
    if (!containerRef.current) return

    /// quick access plugin
    const quickAccessPlugin: AutocompletePlugin<QuickAccessHit, unknown> = {
      getSources({ query }) {
        // Show Quick Access only when there's no search query
        if (query) return []
        return [
          {
            sourceId: 'quickAccessPlugin',
            getItems() {
              return getAlgoliaResults<QuickAccessHit>({
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
                ],
                transformResponse({ results }) {
                  const userDataSections = results
                    .map((result) => {
                      const sectionItems = (result as any)?.userData?.[0]?.sections
                      return Array.isArray(sectionItems) ? sectionItems : []
                    })
                    .flat()
                  return [userDataSections] // ✅ Wrap in array to match QuickAccessHit[][]
                },
              })
            },
            templates: {
              header() {
                // Prevent server-side execution
                if (typeof window === 'undefined') return ''
                const container = document.querySelector(
                  '[data-autocomplete-source-id="quickAccessPlugin"]'
                )
                const alreadyHasHeader = container?.querySelector('.aa-quickAccess-header')
                if (container && !alreadyHasHeader) {
                  const header = document.createElement('div')
                  header.className = 'aa-quickAccess-header'
                  const heading = document.createElement('h4')
                  heading.textContent = 'Explore Fortis'
                  header.appendChild(heading)
                  container.prepend(header)
                }
                return ''
              },
              item({ item }: { item: QuickAccessHit }) {
                if (typeof window === 'undefined') return ''
                const wrapper = document.createElement('a')
                wrapper.className = `aa-ItemWrapper ${item.cssStyle || ''}`
                wrapper.id = `quickAccessPlugin-item-${item.__autocomplete_id}`
                wrapper.href = item.targetURL || '#'
                wrapper.setAttribute('role', 'link')
                // Optional: map camelCase values to kebab-case class names
                const cssStyleClassMap: Record<string, string> = {
                  darkPurple: 'dark-purple',
                  lightPurple: 'light-purple',
                  lightGrey: 'light-grey',
                }
                const extraClass = item.cssStyle ? cssStyleClassMap[item.cssStyle] || '' : ''
                const iconHTML = item.iconURL
                  ? `<img class="aa-ItemIcon" src="${item.iconURL}" alt="${item.title || ''}" />`
                  : ''
                wrapper.innerHTML = `
                  <a class="aa-ItemContent ${extraClass}" href="${item.targetURL}">
                    ${iconHTML}
                    <div class="aa-ItemContentTitle">${item.title}</div>
                  </a>
                `
                // Optional: Replace content in already existing DOM node
                const el = document.querySelector(
                  `[id*="quickAccessPlugin-item-${item.__autocomplete_id}"]`
                )
                if (el) {
                  el.innerHTML = wrapper.innerHTML
                }
                return ''
              },
            },
          },
        ]
      },
    }
    ///////////////quick access plugin end

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
          templates: {
            ...source.templates,
            header() {
              // Prevent server-side execution
              if (typeof window === 'undefined') return ''

              const querySuggestionsTitle = document.querySelector(
                '[data-autocomplete-source-id="querySuggestions"]'
              )

              if (
                querySuggestionsTitle &&
                !querySuggestionsTitle.querySelector('.aa-suggestion-header')
              ) {
                const header = document.createElement('div')
                header.className = 'aa-suggestion-header'
                header.innerHTML = '<h4>Suggestions</h4>'
                querySuggestionsTitle.prepend(header)
              }

              return ''
            },
          },
        }
      },
    })
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
          /*onSelect({ setIsOpen }) {
            setIsOpen(true)
          },*/
          onSelect({ item, setIsOpen }) {
            if (typeof window !== 'undefined') {
              router.push({ pathname: '/search', query: { query: item.query } })
              setIsOpen(true)
            }
          },
          templates: {
            header() {
              // Prevent server-side execution
              if (typeof window === 'undefined') return ''

              const container = document.querySelector(
                '[data-autocomplete-source-id="popularPlugin"]'
              )
              const alreadyHasHeader = container?.querySelector('.aa-popular-header')

              if (container && !alreadyHasHeader) {
                const header = document.createElement('div')
                header.className = 'aa-popular-header'

                const heading = document.createElement('h4')
                heading.textContent = 'Popular Searches'

                header.appendChild(heading)
                container.prepend(header)
              }

              return ''
            },

            item({ item }: { item: any }) {
              const wrapper = document.createElement('div')
              wrapper.className = 'aa-ItemWrapper'
              wrapper.id = `popularPlugin-item-${item.__autocomplete_id}`
              const title = document.createElement('div')
              title.className = 'aa-ItemContentTitle'
              title.textContent = item.query

              wrapper.appendChild(title)

              // Safe selection even with Algolia's autocomplete prefix
              const el = document.querySelector(
                `[id*="popularPlugin-item-${item.__autocomplete_id}"]`
              )
              if (el) {
                // You can modify the inner content of the matched element if needed
                el.innerHTML = ''
                el.appendChild(title.cloneNode(true))
              }

              return ''
            },
          },
        }
      },
    })

    const search = autocomplete<QuickAccessHit>({
      container: containerRef.current,
      placeholder: 'SEARCH',
      openOnFocus: true,
      insights: true,
      plugins: [querySuggestionsPlugin, popularPlugin, quickAccessPlugin],
      onSubmit({ state }) {
        handleEnterSearch(state.query) // 👈 This runs on enter
      },

      getSources: async ({ query }) => {
        const sources: any[] = []
        // Only fetch products and builder-page if query length >= 2
        if (query.length < 2) return sources

        const searchRequests = [
          {
            indexName: 'products',
            query,
            params: { hitsPerPage: 4 },
          },
          {
            indexName: 'builder-page',
            query,
            params: { hitsPerPage: 3 },
          },
        ]

        const { results } = await searchClient.search(searchRequests)

        sources.push(
          {
            sourceId: 'products',
            getItems() {
              const productResults = results.find((r: any) => r.index === 'products')
              return (productResults as any)?.hits || []
            },
            /*getItemInputValue({ item }: { item: any }) {
              return item.product_name || ''
            },*/
            getItemInputValue({ item }: { item: any; query: string }) {
              return query
            },

            templates: {
              header() {
                // Prevent server-side execution
                if (typeof window === 'undefined') return ''
                const wrapper = document.querySelector('[data-autocomplete-source-id="products"]')
                if (wrapper && !wrapper.querySelector('.aa-products-header')) {
                  const header = document.createElement('div')
                  header.className = 'aa-products-header'
                  header.innerHTML = '<h4>Products</h4>'
                  wrapper.prepend(header)
                }
              },
              item({ item }: { item: any }) {
                // Prevent server-side execution
                if (typeof window === 'undefined') return ''
                const productDiv = document.createElement('div')
                productDiv.className = 'aa-ItemWrapper'

                const link = item?.product_url || '#'
                const title =
                  typeof item?.product_name === 'string'
                    ? item.product_name.split(' | ')[0]
                    : typeof item.name === 'string'
                    ? item.name
                    : 'Untitled'

                const imageSrc = item.product_images?.[0]
                  ? `https://cdn-tp1.mozu.com/31165-m1/cms/files/${item.product_images[0]}`
                  : fortisLogo.src

                const brand = item.brand || ''
                const name = item.slice_product ? item.product_name_variant : item.product_name
                const sku = item.slice_product ? item.sku : item.plp_catalog_number
                const showNewTag = item.new_product

                productDiv.innerHTML = `
                    <a href="${link}"  target="_self" rel="noopener noreferrer" class="aa-CustomCard">
                      ${
                        showNewTag
                          ? `<div class="aa-NewTag" style="background-image: url('/NewTag.svg');"></div>`
                          : ''
                      }
                      <span class="aa-CardImageLink">
                        <img src="${imageSrc}" alt="Product" class="aa-CardImage" />
                      </span>
                      <p class="aa-CardBrand">${brand}</p>
                      <span class="aa-CardTitle">
                        ${name || title}
                      </span>
                      <p class="aa-CardSku">${sku || ''}</p>
                    </a>
                `

                const itemProductId = item.__autocomplete_id
                const partialproductId = `products-item-${itemProductId}`
                const el = document.querySelector(`[id*='${partialproductId}']`)
                if (el && productDiv) {
                  el.innerHTML = productDiv.innerHTML
                }

                return productDiv
              },
              footer() {
                const wrapper = document.querySelector('[data-autocomplete-source-id="products"]')
                const productResults = results.find((r: any) => r.index === 'products')
                let totalHits = 0
                if (productResults && 'nbHits' in productResults) {
                  totalHits = productResults.nbHits
                }

                if (wrapper) {
                  let footerEl = wrapper.querySelector('.aa-SourceFooter')
                  if (!footerEl) {
                    footerEl = document.createElement('div')
                    footerEl.className = 'aa-SourceFooter'
                    wrapper.appendChild(footerEl)
                  }
                  if (totalHits > 4) {
                    footerEl.innerHTML = `
                    <a class="aa-products-see-all" href="https://www.fortislife.com/products">
                      See All Products (${totalHits})
                    </a>
                  `
                  }

                  return footerEl
                }

                return null
              },
            },
          },
          {
            sourceId: 'builder-page',
            getItems() {
              const builderResults = results.find((r: any) => r.index === 'builder-page')
              return (builderResults as any)?.hits || []
            },
            /*getItemInputValue({ item }: { item: any }) {
              return item.data?.title || ''
            },*/
            getItemInputValue({ item }: { item: any; query: string }) {
              return query
            },
            templates: {
              header() {
                // Prevent server-side execution
                if (typeof window === 'undefined') return ''
                const builderTitle = document.querySelector(
                  '[data-autocomplete-source-id="builder-page"]'
                )
                if (builderTitle && !builderTitle.querySelector('.aa-builder-header')) {
                  const header = document.createElement('div')
                  header.className = 'aa-builder-header'
                  header.innerHTML = '<h4>More from Fortis</h4>'
                  builderTitle.prepend(header)
                }
              },
              item({ item }: { item: any }) {
                if (typeof window === 'undefined') return ''
                const div = document.createElement('div')
                div.className = 'aa-ItemWrapper'

                const link = item.meta?.lastPreviewUrl || '#'
                const title =
                  typeof item.data?.title === 'string'
                    ? item.data.title.split(' | ')[0]
                    : typeof item.name === 'string'
                    ? item.name
                    : 'Untitled'

                const image = item.data?.image

                // Default resource type to 'Whitepaper' if not present
                const resourceType = item.data?.resourceType || 'Whitepaper'

                // Try to get resourceType object from the array
                const resourceTypeObj = resourceTypeArr.find(
                  (data) => data.resourceType === resourceType
                )

                const iconHTML = `<span class="material-symbols-outlined">${
                  resourceTypeObj?.value || resourceType
                }</span>`

                div.innerHTML = `
                  <div class="aa-ItemContent">
                    <div class="aa-ItemImageWrapper">
                      ${
                        image
                          ? `<img src="${image}" alt="${title}" class="aa-ItemImage" />`
                          : iconHTML
                      }
                    </div>
                    <a class="aa-ItemTitle" href="${link}" target="_self" rel="noopener noreferrer">
                      ${title}
                    </a>
                  </div>
                `

                const itemId = item.__autocomplete_id
                const partialId = `builder-page-item-${itemId}`
                const el = document.querySelector(`[id*='${partialId}']`)

                if (el && div) {
                  el.innerHTML = div.innerHTML
                }

                return div
              },

              footer() {
                const articleWrapper = document.querySelector(
                  '[data-autocomplete-source-id="builder-page"]'
                )
                const articleResults = results.find((r: any) => r.index === 'builder-page')

                let totalHits = 0
                if (articleResults && 'nbHits' in articleResults) {
                  totalHits = Number(articleResults.nbHits) // Coerce to number
                }

                if (articleWrapper) {
                  let articlefooterEl = articleWrapper.querySelector('.aa-SourceFooter')
                  if (!articlefooterEl) {
                    articlefooterEl = document.createElement('div')
                    articlefooterEl.className = 'aa-SourceFooter'
                    articleWrapper.appendChild(articlefooterEl)
                  }

                  //console.log("nbHits value:", totalHits, "Condition result:", totalHits > 3);

                  if (typeof totalHits === 'number' && totalHits > 3) {
                    articlefooterEl.innerHTML = `
                      <a class="aa-builder-see-all" href="https://www.fortislife.com/resources">
                        See All 
                      </a>
                    `
                  } else {
                    articlefooterEl.innerHTML = ''
                  }

                  return articlefooterEl
                }

                return null
              },
            },
          }
        )

        return sources
      },
    })

    /////////////////////
    // 👇 Fix for paste issue start
    const input = containerRef.current.querySelector('input')
    if (input) {
      // Adding event listener for 'paste'
      input.addEventListener('paste', () => {
        // Wait for the pasted value to be applied and trigger input event
        setTimeout(() => {
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }, 10) // Wait for value to be pasted before triggering input
      })
      // You can add other events like 'cut', 'drop', etc. if needed.
      ;['change', 'cut', 'drop'].forEach((eventName) => {
        input.addEventListener(eventName, () => {
          setTimeout(() => {
            input.dispatchEvent(new Event('input', { bubbles: true }))
          }, 10)
        })
      })
    }
    ////  Fix for paste issue end

    return () => search.destroy()
  }, [])

  return <div ref={containerRef} id="autocomplete" />
}

export default AlgoliaAutocomplete
