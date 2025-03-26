// Assuming this is your localStorage utility file

// Save search query to localStorage
export const saveSearch = (query: string) => {
  const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]') // Default to an empty array if null
  if (query && !recentSearches.includes(query)) {
    recentSearches.unshift(query) // Add new search at the beginning
    if (recentSearches.length > 5) recentSearches.pop() // Limit to 5 searches
  }
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches))
}

// Retrieve recent searches from localStorage
export const getRecentSearches = (): string[] => {
  const recentSearches = localStorage.getItem('recentSearches')
  return recentSearches ? JSON.parse(recentSearches) : [] // Default to an empty array if null
}
