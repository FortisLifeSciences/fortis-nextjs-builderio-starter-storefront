import React, { useState, useRef, useEffect } from 'react'

import SearchIcon from '@mui/icons-material/Search'
import { Box, Paper, InputBase, IconButton } from '@mui/material'
import Link from 'next/link'

import fortisLogo from '@/assets/fortisLogo.png'
import resourceTypeArr from '@/components/common/ResourceTypeArr'
import AutocompleteComponent from '@/components/layout/Algolia/AlgoliaAutocomplete'
//import { fetchAlgoliaResults } from 'src/pages/api/algolia-search/algolia-fetch-index'

const fortisLogoUrl = fortisLogo.src

const AlgoliaSearch = ({ placeholderText = 'SEARCH' }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [breadcrumb, setBreadcrumb] = useState('') // Store breadcrumb here
  const searchContainerRef = useRef<HTMLDivElement | null>(null)

  /*const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  }*/

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
        setResults([])
        setBreadcrumb('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="container">
      <AutocompleteComponent />
      {breadcrumb && <div className="breadcrumb">{breadcrumb}</div>} {/* Display Breadcrumb */}
    </div>
  )
}

export default AlgoliaSearch
