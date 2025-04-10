'use client'

import React, { useEffect, useRef } from 'react'

import { autocomplete } from '@algolia/autocomplete-js'
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions'
import algoliasearch from 'algoliasearch'
import '@algolia/autocomplete-theme-classic'

import fortisLogo from '@/assets/fortisLogo.png'
import resourceTypeArr from '@/components/common/ResourceTypeArr'

const h = React.createElement

const appId = 'YQAIETZ5F1'
const apiKey = 'c2cc99ace97599deaf1606dba442f9ae'
const searchClient = algoliasearch(appId, apiKey)

const AlgoliaAutocomplete = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

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
          onSelect({ setIsOpen }) {
            setIsOpen(true)
          },
          templates: {
            header() {
              // Prevent server-side execution
              if (typeof window === 'undefined') return ''

              console.log('[PopularPlugin] Rendering header template')

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
              console.log('item.query', item.query)

              const wrapper = document.createElement('div')
              wrapper.className = 'aa-ItemWrapper'
              wrapper.id = `popularPlugin-item-${item.__autocomplete_id}`
              console.log('wrapper.id', wrapper.id)

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

    const search = autocomplete({
      container: containerRef.current,
      placeholder: 'SEARCH',
      openOnFocus: true,
      insights: true,
      plugins: [querySuggestionsPlugin, popularPlugin],

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
            getItemInputValue({ item }: { item: any }) {
              return item.product_name || ''
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
                  <div class="aa-CustomCard">
                    ${
                      showNewTag
                        ? `<div class="aa-NewTag" style="background-image: url('/NewTag.svg');"></div>`
                        : ''
                    }
                    <a href="${link}" class="aa-CardImageLink" target="_blank" rel="noopener noreferrer">
                      <img src="${imageSrc}" alt="Product" class="aa-CardImage" />
                    </a>
                    <p class="aa-CardBrand">${brand}</p>
                    <a href="${link}" class="aa-CardTitle" target="_blank" rel="noopener noreferrer">
                      ${name || title}
                    </a>
                    <p class="aa-CardSku">${sku || ''}</p>
                  </div>
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
            getItemInputValue({ item }: { item: any }) {
              return item.data?.title || ''
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
                // Prevent server-side execution
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
                const resourceTypeIcon = resourceTypeArr.find(
                  (data) => data.resourceType === item.data?.resourceType
                )
                const iconHTML = resourceTypeIcon
                  ? `<span class="material-symbols-outlined">${resourceTypeIcon.value}</span>`
                  : '<span class="material-symbols-outlined"></span>'

                div.innerHTML = `
                  <div class="aa-ItemContent">
                    <div class="aa-ItemImageWrapper">
                      ${
                        image
                          ? `<img src="${image}" alt="${title}" class="aa-ItemImage" />`
                          : iconHTML
                      }
                    </div>
                    <a class="aa-ItemTitle" href="${link}" target="_blank" rel="noopener noreferrer">
                      ${title.split(' | ')[0]}
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
                  totalHits = articleResults.nbHits
                  console.log('****Total Hits for builder-page:', totalHits)
                }

                if (articleWrapper) {
                  let articlefooterEl = articleWrapper.querySelector('.aa-SourceFooter')
                  if (!articlefooterEl) {
                    articlefooterEl = document.createElement('div')
                    articlefooterEl.className = 'aa-SourceFooter'
                    articleWrapper.appendChild(articlefooterEl)
                  }

                  if (totalHits > 3) {
                    articlefooterEl.innerHTML = `
                      <a class="aa-builder-see-all" href="https://www.fortislife.com/resources">
                        See All 
                      </a>
                    `
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

    return () => search.destroy()
  }, [])

  return <div ref={containerRef} id="autocomplete" />
}

export default AlgoliaAutocomplete
