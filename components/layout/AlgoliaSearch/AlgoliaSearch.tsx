import React, { useState, useRef, useEffect } from 'react'

import SearchIcon from '@mui/icons-material/Search'
import { Box, Paper, InputBase, IconButton } from '@mui/material'

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
        <IconButton
          sx={{
            padding: '5px',
            color: '#443ec6',
            transition: 'all 0.3s ease',
            fontWeight: '500',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: '50%',
            },
          }}
          disableRipple
        >
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
            fontFamily: 'Poppins',
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
          {/*<p>Explore Fortis</p>
            <Box
                  sx={{
                    padding: '5px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '0 0 30px 0',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#f9f9f9',
                    color: '#333',
                  }}
                >
              </Box>*/}

          {results.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                justifyContent: 'flex-start',
              }}
            >
              {results.flatMap((indexResult: { hits: any[] }) =>
                indexResult.hits.map((hit, index) => (
                  <Box
                    key={index}
                    sx={{
                      padding: '5px 10px',
                      border: '1px solid #ddd',
                      borderRadius: '0 0 30px 0',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#f9f9f9',
                      color: '#333',
                      position: 'relative',
                      width: '200px', // Fixed width for all boxes
                      alignItems: 'flex-start',
                    }}
                  >
                    {hit.new_product && (
                      <Box
                        sx={{
                          width: '80px',
                          height: '41px',
                          backgroundSize: 'cover',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          marginRight: '15px',
                          marginTop: '12px',
                          zIndex: '100',
                          position: 'absolute',
                          top: '-12px',
                          left: '0px',
                        }}
                        style={{
                          backgroundImage: "url('/NewTag.svg')", // Correct usage
                        }}
                      />
                    )}

                    <a href={hit.product_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={
                          hit.product_images?.[0]
                            ? `https://cdn-tp1.mozu.com/31165-m1/cms/files/${hit.product_images[0]}`
                            : fortisLogoUrl
                        }
                        alt="Product"
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'contain',
                          border: '1px solid #ddd',
                          padding: '5px',
                          margin: '0 auto',
                        }}
                      />
                    </a>

                    <p
                      style={{
                        marginBottom: '5px',
                        fontSize: '13px',
                        color: '#8D8D8D',
                        textAlign: 'left',
                      }}
                    >
                      {hit.brand}
                    </p>

                    <a
                      href={hit.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '16px',
                        fontWeight: '400',
                        margin: '5px 0',
                        textAlign: 'left',
                        color: '#333',
                        width: '100%',
                      }}
                    >
                      {hit.slice_product ? hit.product_name_variant : hit.product_name}
                    </a>

                    <p style={{ fontSize: '14px', margin: '5px 0', textAlign: 'left' }}>
                      {hit.slice_product ? hit.sku : hit.plp_catalog_number}
                    </p>
                  </Box>
                ))
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default AlgoliaSearch
