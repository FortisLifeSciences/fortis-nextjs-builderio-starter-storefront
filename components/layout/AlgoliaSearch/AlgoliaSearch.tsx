import React, { useState } from 'react'

import SearchIcon from '@mui/icons-material/Search'
import { Box, Paper, InputBase, IconButton } from '@mui/material'

import fortisLogo from '@/assets/fortisLogo.png'
import { fetchAlgoliaResults } from 'src/pages/api/algolia-search/algolia-fetch-index'

const fortisLogoUrl = fortisLogo.src

const AlgoliaSearch = ({ placeholderText = 'SEARCH' }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleSearchChange = async (event: any) => {
    const queryValue = event.target.value.trim()
    setQuery(queryValue)
    if (queryValue.length < 2) {
      setResults([])
      return
    }

    try {
      const searchResults = await fetchAlgoliaResults(queryValue)
      setResults(searchResults as any)
    } catch (error) {
      console.error('Error fetching Algolia results:', error)
    }
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Search Input */}
      <Paper
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '3px 10px',
          borderRadius: '9px', // Rounded corners
          backgroundColor: '#fff', // Light purple background
          width: '100%',
          maxWidth: 1500, // Adjust width as needed
          boxShadow: 'none',
          marginRight: '13px',
        }}
      >
        {/* Search Icon */}
        <IconButton
          sx={{
            padding: '5px',
            color: '#443ec6',
            transition: 'all 0.3s ease',
            fontWeight: '500',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)', // Gray background on hover
              borderRadius: '50%', // Makes it circular
            },
          }}
          disableRipple
        >
          <SearchIcon sx={{ fontSize: '1.125rem' }} />
        </IconButton>

        {/* Input Field */}
        <InputBase
          sx={{
            flex: 1,
            height: '27px',
            padding: '4px 0 5px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#30299A', // Light gray text
            fontFamily: 'Poppins',
          }}
          value={query}
          onChange={handleSearchChange}
          placeholder={placeholderText}
        />
      </Paper>

      {/* Search Results */}
      {results.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            maxHeight: 400,
            overflowY: 'auto',
            border: '1px solid #ddd',
            background: 'white',
            zIndex: 10,
            padding: '10px',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '15px',
            }}
          >
            {results.flatMap((indexResult: { hits: any[] }) =>
              indexResult.hits.map((hit: any, index: any) => (
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
                  }}
                >
                  <a href={hit.product_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={hit.product_image || fortisLogoUrl}
                      alt="Product"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'contain',
                        border: '1px solid #ddd',
                        padding: '5px',
                      }}
                    />
                  </a>

                  <p
                    style={{
                      marginBottom: '5px',
                      fontSize: '13px',
                      color: '#737373',
                      textAlign: 'left',
                    }}
                  >
                    {hit.brand}
                  </p>

                  {/* Conditional Rendering based on hit.slice_product */}
                  {hit.slice_product ? (
                    <>
                      <p
                        style={{
                          fontSize: '16px',
                          fontWeight: '400',
                          margin: '5px 0',
                          textAlign: 'left',
                          color: '#333',
                        }}
                      >
                        {hit.product_name_variant}
                      </p>
                      <p style={{ fontSize: '14px', margin: '5px 0', textAlign: 'left' }}>
                        {hit.sku}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          fontSize: '16px',
                          fontWeight: '400',
                          margin: '5px 0',
                          textAlign: 'left',
                          color: '#333',
                        }}
                      >
                        {hit.product_name}
                      </p>
                      <p style={{ fontSize: '14px', margin: '5px 0', textAlign: 'left' }}>
                        {hit.plp_catalog_number}
                      </p>
                    </>
                  )}
                </Box>
              ))
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default AlgoliaSearch
