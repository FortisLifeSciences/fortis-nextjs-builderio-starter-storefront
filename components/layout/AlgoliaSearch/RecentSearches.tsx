import { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import { Box, IconButton } from '@mui/material'
import { useRouter } from 'next/router'

const RecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    setRecentSearches(searches)
  }, [])

  // Handle a click on a recent search
  const handleSearchClick = (searchQuery: string) => {
    router.push(`/?query=${searchQuery}`)
  }

  // Handle removal of a search from recent searches
  const handleRemoveSearch = (search: string) => {
    const updatedSearches = recentSearches.filter((item) => item !== search)
    setRecentSearches(updatedSearches)
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches)) // Save to localStorage
  }

  return (
    <Box>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: '400',
          marginBottom: '10px',
          color: '#020027',
        }}
      >
        Recent Searches
      </h3>
      {recentSearches.length === 0 ? (
        <Box>No recent searches</Box>
      ) : (
        recentSearches.map((search, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fff',
              padding: '8px',
              color: '#30299A',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#30299A',
                cursor: 'pointer',
              }}
              onClick={() => handleSearchClick(search)}
            >
              <RefreshOutlinedIcon
                sx={{ fontSize: '18px', marginRight: '8px', transform: 'rotate(260deg)' }}
              />
              {search}
            </Box>
            <IconButton
              onClick={() => handleRemoveSearch(search)}
              sx={{
                padding: '4px',
                backgroundColor: '#fff',
              }}
            >
              <CloseIcon sx={{ fontSize: '16px', color: '#30299A' }} />
            </IconButton>
          </Box>
        ))
      )}
    </Box>
  )
}

export default RecentSearches
