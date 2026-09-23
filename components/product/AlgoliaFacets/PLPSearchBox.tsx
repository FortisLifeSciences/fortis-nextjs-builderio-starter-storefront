import { useState } from 'react'

import SearchIcon from '@mui/icons-material/Search'
import { Box, InputBase } from '@mui/material'
import { useSearchBox } from 'react-instantsearch-hooks-web'

const PLPSearchBox = () => {
  const { query, refine } = useSearchBox()
  const [value, setValue] = useState(query)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    refine(e.target.value)
  }

  return (
    <Box>
      <Box
        component="span"
        sx={{
          display: 'block',
          fontFamily: 'Poppins',
          fontWeight: 800,
          fontSize: '12.5px',
          lineHeight: '20px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          verticalAlign: 'middle',
          color: '#1B1A24',
          padding: '0 0 8px',
        }}
      >
        Filter by keyword
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          height: '40.8px',
          padding: '0 12px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAEAF1',
          borderRadius: '10px',
        }}
      >
        <SearchIcon sx={{ fontSize: '15px', color: '#8B8AA0' }} />
        <InputBase
          value={value}
          onChange={handleChange}
          placeholder="Target, catalog #, host…"
          fullWidth
          inputProps={{ 'aria-label': 'Filter by keyword' }}
          sx={{
            fontFamily: 'Poppins',
            fontSize: '13px',
            color: '#1B1A24',
            '& input::placeholder': {
              color: '#757575',
              opacity: 1,
            },
          }}
        />
      </Box>
    </Box>
  )
}

export default PLPSearchBox
