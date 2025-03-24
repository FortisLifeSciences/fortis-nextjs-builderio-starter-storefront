import React, { useState, useRef, useEffect } from 'react'

import SearchIcon from '@mui/icons-material/Search'
import { Box, Paper, InputBase, IconButton } from '@mui/material'
import Link from 'next/link'

import fortisLogo from '@/assets/fortisLogo.png'
import { fetchAlgoliaResults } from 'src/pages/api/algolia-search/algolia-fetch-index'

const fortisLogoUrl = fortisLogo.src

const AlgoliaSearch = ({ placeholderText = 'SEARCH' }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement | null>(null)

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const queryValue = event.target.value.trim()
    setQuery(queryValue)

    if (queryValue.length < 2) {
      setResults([])
      return
    }

    try {
      const searchResults = await fetchAlgoliaResults(queryValue)
      console.log('All data', searchResults)
      setResults(searchResults)
    } catch (error) {
      console.error('Error fetching Algolia results:', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
        setResults([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <Box sx={{ position: 'relative', width: '100%' }} ref={searchContainerRef}>
      <Paper
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '3px 10px',
          borderRadius: '9px',
          backgroundColor: '#fff',
          width: '100%',
          maxWidth: 600,
          boxShadow: 'none',
          marginRight: '13px',
        }}
      >
        <IconButton sx={{ padding: '5px', color: '#443ec6' }} disableRipple>
          <SearchIcon sx={{ fontSize: '1.125rem' }} />
        </IconButton>
        <InputBase
          sx={{
            flex: 1,
            height: '27px',
            padding: '4px 0 5px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#30299A',
          }}
          value={query}
          onChange={handleSearchChange}
          placeholder={placeholderText}
          onFocus={() => setIsFocused(true)}
        />
      </Paper>

      {isFocused && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: '-35%',
            width: '1000px',
            maxHeight: 400,
            overflowY: 'auto',
            border: '2px solid #ddd',
            background: 'white',
            zIndex: 10,
            padding: '10px',
          }}
        >
          {results.length > 0 && (
            <>
              {/* Products Section */}
              {results.some((resultData) => resultData.resultsData.index === 'products') && (
                <>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '400',
                      marginBottom: '10px',
                      color: '#020027',
                    }}
                  >
                    Products
                  </h3>
                  {results.map((resultData: any, index: number) =>
                    resultData.resultsData.index === 'products' ? (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '15px',
                          justifyContent: 'flex-start',
                          lineHeight: '18px',
                        }}
                      >
                        {resultData.resultsData.hits.map((hit: any, idx: number) => (
                          <Box
                            key={idx}
                            sx={{
                              padding: '5px 10px',
                              border: '1px solid #ddd',
                              borderRadius: '0 0 30px 0',
                              background: '#f9f9f9',
                              width: '200px',
                              alignItems: 'flex-start',
                              position: 'relative',
                            }}
                          >
                            {hit.new_product && (
                              <Box
                                sx={{
                                  width: '80px',
                                  height: '41px',
                                  backgroundSize: 'cover',
                                  position: 'absolute',
                                  top: '0px',
                                  left: '0px',
                                  border: 'none',
                                }}
                                style={{ backgroundImage: "url('/NewTag.svg')" }}
                              />
                            )}
                            <a
                              href={hit.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'grid' }}
                            >
                              <img
                                src={
                                  hit.product_images?.[0]
                                    ? `https://cdn-tp1.mozu.com/31165-m1/cms/files/${hit.product_images[0]}`
                                    : fortisLogoUrl
                                }
                                alt="Product"
                                style={{
                                  width: '120px',
                                  height: '100px',
                                  objectFit: 'contain',
                                  border: 'none',
                                  margin: '0 auto',
                                }}
                              />
                            </a>
                            <p
                              style={{
                                fontSize: '13px',
                                color: '#8D8D8D',
                                lineHeight: '18px',
                                margin: '10px 0',
                              }}
                            >
                              {hit.brand}
                            </p>
                            <a
                              href={hit.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '14px',
                                color: '#020027',
                                fontWeight: '500',
                                margin: '10px 0',
                              }}
                            >
                              {hit.slice_product ? hit.product_name_variant : hit.product_name}
                            </a>
                            <p
                              style={{
                                fontSize: '14px',
                                color: '#020027',
                                lineHeight: '18px',
                                margin: '10px 0',
                              }}
                            >
                              {hit.slice_product ? hit.sku : hit.plp_catalog_number}
                            </p>
                          </Box>
                        ))}
                      </Box>
                    ) : null
                  )}
                  <button
                    style={{
                      textAlign: 'center',
                      marginTop: '10px',
                      marginBottom: '15px',
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#fff',
                      background: '#30299A',
                      fontFamily: 'Poppins',
                      padding: '10px 25px',
                      border: 'none',
                      lineHeight: '18px',
                      borderRadius: '0 18px 0 18px',
                    }}
                  >
                    See All Products (
                    {results.reduce(
                      (acc, curr) =>
                        acc +
                        (curr.resultsData.index === 'products' ? curr.resultsData.nbHits || 0 : 0),
                      0
                    )}
                    )
                  </button>
                </>
              )}

              {/* Builder Pages Section */}
              {results.some((resultData) => resultData.resultsData.index === 'builder-page') && (
                <>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '400',
                      marginBottom: '10px',
                      color: '#020027',
                    }}
                  >
                    More from Fortis
                  </h3>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '15px',
                      justifyContent: 'flex-start',
                      lineHeight: '18px',
                    }}
                  >
                    {results.map((resultData: any, index: number) => {
                      if (resultData.resultsData.index === 'builder-page') {
                        const hits = resultData.resultsData.hits.slice(0, 3) // Show only first 3 results
                        const hasMore = resultData.resultsData.hits.length > 3 // Check if there are more than 3

                        return (
                          <React.Fragment key={index}>
                            {hits.map((hit: any, idx: number) => (
                              <Box
                                key={idx}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '10px',
                                  border: '1px solid #ddd',
                                  borderRadius: '8px',
                                  background: '#f4f4f4',
                                  width: '250px',
                                  height: '80px',
                                  marginBottom: '10px',
                                }}
                              >
                                {/* Image/Icon on the left */}
                                <Box
                                  sx={{
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: hit.data.image ? 'transparent' : '#30299A',
                                    borderRadius: '5px',
                                    flexShrink: 0,
                                  }}
                                >
                                  {hit.data.image ? (
                                    <img
                                      src={hit.data.image}
                                      alt={hit.data.title}
                                      style={{
                                        width: '50px',
                                        height: '50px',
                                        objectFit: 'cover',
                                        borderRadius: '5px',
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={fortisLogoUrl}
                                      alt="Default Icon"
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        objectFit: 'contain',
                                      }}
                                    />
                                  )}
                                </Box>

                                {/* Title on the right with 3-line truncation */}
                                <Box sx={{ marginLeft: '10px', flex: 1 }}>
                                  <a
                                    href={hit.meta.lastPreviewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '13px',
                                      color: '#30299A',
                                      fontWeight: '500',
                                      textDecoration: 'underline',
                                      display: '-webkit-box',
                                      WebkitBoxOrient: 'vertical',
                                      WebkitLineClamp: 3, // Limits title to 3 lines
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {hit.data.title}
                                  </a>
                                </Box>
                              </Box>
                            ))}

                            {/* "See All" Link */}
                            {hasMore && (
                              <Box sx={{ display: 'flex', alignItems: 'center', height: '80px' }}>
                                <Link
                                  href="/all-builder-pages"
                                  style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#30299A',
                                    textDecoration: 'underline',
                                    marginLeft: '10px',
                                  }}
                                >
                                  See All
                                </Link>
                              </Box>
                            )}
                          </React.Fragment>
                        )
                      }
                      return null
                    })}
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  )
}

export default AlgoliaSearch
