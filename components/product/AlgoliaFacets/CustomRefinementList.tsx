import { useState } from 'react'

import { Add, ArrowForwardIos, CheckBox, CheckBoxOutlineBlank, Remove } from '@mui/icons-material'
import {
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  TextField,
  useMediaQuery,
  SxProps,
  Box,
  Typography,
} from '@mui/material'
import { Theme, useTheme } from '@mui/material/styles'
import { useRefinementList } from 'react-instantsearch-hooks-web'

interface CustomRefinementListProps {
  attribute: string
  searchableAttributes: string[]
}
const style = {
  formControlLabel: {
    width: '100%',
    fontSize: (theme: Theme) => theme.typography.body2,
    '& .MuiFormControlLabel-label': {
      fontSize: '16px',
      fontWeight: '300',
      lineHeight: 'normal',
    },
  } as SxProps<Theme> | undefined,
  viewMore: {
    textTransform: 'capitalize',
    color: 'text.primary',
    pl: 0,
  },
  searchInput: {
    marginBottom: '8px',
    width: '100%',
    '& input': {
      padding: '8px',
      fontSize: '14px',
      height: '32px',
      borderRadius: '4px',
      width: '100%',
      margin: '16px 0',
      borderBottom: 'none',
    },
  },
}

function CustomRefinementList({ attribute, searchableAttributes }: CustomRefinementListProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const isSearchable =
    isMobile && Array.isArray(searchableAttributes) && searchableAttributes.includes(attribute)

  const { items, refine, isShowingMore, canToggleShowMore, toggleShowMore, searchForItems } =
    useRefinementList({
      attribute,
      showMore: true,
      limit: 6,
    })

  const [query, setQuery] = useState('')
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    searchForItems?.(value)
  }

  return (
    <div>
      {/* Search Input (Mobile only) */}
      {isMobile && isSearchable && (
        <TextField
          value={query}
          onChange={handleSearch}
          placeholder="Begin typing..."
          variant="standard"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <ArrowForwardIos fontSize="small" sx={{ color: 'rgb(90, 72, 251)' }} />
              </InputAdornment>
            ),
            disableUnderline: true, // remove default underline
            sx: {
              borderBottom: '1px solid',
              borderColor: 'rgb(90, 72, 251)',
              paddingBottom: '4px',
            },
          }}
          sx={{
            marginBottom: '8px',
            width: '100%',
            '& input': {
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgb(48, 41, 154)',
              '&::placeholder': {
                color: 'text.secondary',
              },
            },
            '& .MuiInput-root': {
              '&:before, &:after': {
                display: 'none',
              },
              '&:hover:not(.Mui-disabled):before': {
                display: 'none',
              },
            },
          }}
        />
      )}

      {/* Facet Items */}
      {items.map((item) => (
        <Box
          key={item.label}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          {/* <Box display="flex" alignItems="center" flex="1">
            <Checkbox
              icon={<CheckBoxOutlineBlank />}
              checkedIcon={<CheckBox />}
              checked={item.isRefined}
              onChange={() => refine(item.value)}
              size="small"
              inputProps={{
                'aria-label': isMobile
                  ? `${item.label} (${item.count})`
                  : item.label,
              }}
            />
            <Typography variant="body2" fontSize={'16px'}>{item.label}</Typography>
          </Box> */}
          <FormControlLabel
            control={
              <Checkbox
                icon={<CheckBoxOutlineBlank />}
                checkedIcon={<CheckBox />}
                checked={item.isRefined}
                onChange={() => refine(item.value)}
                size="small"
                inputProps={{
                  'aria-label': `${item.label} (${item.count})`,
                }}
              />
            }
            label={item.label}
            sx={style.formControlLabel}
          />

          {/* Count */}
          <Typography variant="body2" color="text.primary" fontSize={'16px'}>
            ({item.count})
          </Typography>
        </Box>
      ))}

      {canToggleShowMore && (
        <Button
          onClick={toggleShowMore}
          variant="text"
          sx={{ ...style.viewMore, marginTop: '8px', fontSize: '16px' }}
          startIcon={isShowingMore ? <Remove fontSize="small" /> : <Add fontSize="small" />}
        >
          {isShowingMore ? 'View Less' : 'View More'}
        </Button>
      )}
    </div>
  )
}

export default CustomRefinementList
