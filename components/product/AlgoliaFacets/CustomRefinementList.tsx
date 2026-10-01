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
  facetRow: {
    padding: '8px 0',
  },
  formControlLabel: {
    width: '100%',
    margin: 0,
    '& .MuiFormControlLabel-label': {
      fontFamily: 'Poppins',
      fontSize: '13.5px',
      lineHeight: '22px',
      color: '#5C5A70',
    },
    '&.item-selected .MuiFormControlLabel-label': {
      fontWeight: 600,
      color: '#1B1A24',
    },
  } as SxProps<Theme> | undefined,
  checkbox: {
    padding: '4px 8px 4px 0',
    color: '#C9C7D6',
    '& .MuiSvgIcon-root': {
      fontSize: '18px',
      borderRadius: '4px',
    },
    '&.Mui-checked': {
      color: '#30299A',
    },
  } as SxProps<Theme> | undefined,
  count: {
    fontFamily: 'Poppins',
    fontSize: '11.5px',
    lineHeight: '18px',
    color: '#8B8AA0',
    whiteSpace: 'nowrap',
  } as SxProps<Theme> | undefined,
  viewMore: {
    textTransform: 'none',
    color: '#30299A',
    fontFamily: 'Poppins',
    fontWeight: 600,
    fontSize: '12.5px',
    pl: 0,
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
    },
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
      showMoreLimit: 100, //useRefinementList sends only 20 values by default when clicking “View More”, so I increased the limit to 100 using the showMoreLimit attribute.
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
          sx={{ width: '100%', ...style.facetRow }}
        >
          <FormControlLabel
            control={
              <Checkbox
                icon={<CheckBoxOutlineBlank />}
                checkedIcon={<CheckBox />}
                checked={item.isRefined}
                onChange={() => refine(item.value)}
                size="small"
                sx={style.checkbox}
                inputProps={
                  {
                    'aria-label': `${item.label} (${item.count})`,
                    'data-insights-filter': `${attribute}:${item.label}`,
                  } as React.InputHTMLAttributes<HTMLInputElement>
                }
                className="algolia-facet-label"
              />
            }
            label={item.label}
            className={item.isRefined ? 'item-selected' : undefined}
            sx={style.formControlLabel}
          />

          {/* Count */}
          <Typography component="span" sx={style.count}>
            {item.count}
          </Typography>
        </Box>
      ))}

      {canToggleShowMore && (
        <Button
          onClick={toggleShowMore}
          variant="text"
          sx={{ ...style.viewMore, marginTop: '8px' }}
          startIcon={isShowingMore ? <Remove fontSize="small" /> : <Add fontSize="small" />}
        >
          {isShowingMore ? 'View Less' : 'View More'}
        </Button>
      )}
    </div>
  )
}

export default CustomRefinementList
