import { useRef, useState } from 'react'

import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material'

import { StyledOutlinedInput } from '@/components/common/KiboSelect/KiboSelect'
import KiboTextBox from '@/components/common/KiboTextBox/KiboTextBox'

import type { SxProps, Theme } from '@mui/material'

export interface KiboStateSelectOption {
  code: string
  name: string
}

export interface KiboStateSelectProps {
  name: string
  value?: string
  options?: KiboStateSelectOption[] | null
  required?: boolean
  helperText?: string
  error?: boolean
  placeholder?: string
  label?: string
  sx?: SxProps<Theme>
  disabled?: boolean
  onChange: (name: string, value: string) => void
  onBlur?: (name: string, value: string) => void
}

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

// State/province picker with type-ahead filtering (type "t" and the list narrows to the "T"
// states) instead of a plain scrolling dropdown. The closed field is the exact same MUI
// `Select` + `StyledOutlinedInput` KiboSelect uses everywhere else - not a lookalike - so it
// stays pixel-identical to it; only the opened menu gets a search box added above the list.
const KiboStateSelect = (props: KiboStateSelectProps) => {
  const {
    name,
    value = '',
    options,
    required = false,
    helperText = '',
    error = false,
    placeholder,
    label,
    sx,
    disabled,
    onChange,
    onBlur,
  } = props

  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = (options ?? [])
    .filter((option) => option.name.toLowerCase().startsWith(search.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const selectedLabel = options?.find((option) => option.code === value)?.name ?? ''

  return (
    <FormControl
      sx={{ minWidth: 120, marginTop: label ? 3 : 0, ...sx }}
      size="small"
      fullWidth
      variant="outlined"
      hiddenLabel={!label}
      required={required}
      disabled={disabled}
    >
      {label && (
        <InputLabel
          shrink
          htmlFor={name}
          sx={{
            top: -23,
            left: 0,
            color: error ? 'error.main' : '#3B3B3B',
            ...sx,
            fontFamily: 'Poppins',
            fontSize: '15px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '150%',
            letterSpacing: '-0.005em',
            transform: 'translate(0, -1.5px) scale(1)',
            zIndex: '0',
          }}
        >
          {label}
        </InputLabel>
      )}
      <Select
        size="small"
        displayEmpty
        name={name}
        aria-label={name}
        error={error}
        disabled={disabled}
        value={value}
        // The list filters while open, so the option matching the current value can briefly
        // not be among the rendered children - look the label up from the full option list
        // instead of relying on Select's default "find the matching child" rendering.
        renderValue={() => selectedLabel || placeholder || ''}
        MenuProps={{
          autoFocus: false,
          // Select's own Menu always needs to own `onClose` to actually close (it builds the
          // menu as `{ onClose: <its real close handler>, ...MenuProps }`, so a custom
          // `onClose` here would silently replace it, not add to it, and the dropdown would
          // stop closing on an outside click/backdrop press). Reset the search text via the
          // exit transition instead, which doesn't touch the close mechanism at all.
          TransitionProps: {
            onEntered: () => searchInputRef.current?.focus(),
            onExited: () => setSearch(''),
          },
          MenuListProps: { autoFocusItem: false },
          PaperProps: {
            style: {
              maxHeight: ITEM_HEIGHT * 5.5 + ITEM_PADDING_TOP,
              width: 250,
            },
            sx: {
              fontFamily: 'Poppins',
              '& .MuiMenuItem-root': {
                fontFamily: 'Poppins',
                fontSize: '14px',
              },
            },
          },
        }}
        sx={{
          borderColor: error ? 'error.main' : '#D3D7D9',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '8px',
          boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)',
          fontFamily: 'Poppins',
          fontSize: { xs: '14px !important', md: '14px !important' },
          color: '#454545',
          ...sx,
          height: '42px',
        }}
        inputProps={{
          id: name,
          'aria-label': label || name,
          'aria-labelledby': name,
        }}
        input={<StyledOutlinedInput error={error} />}
        onChange={(event) => onChange(event.target.name, event.target.value as string)}
        onBlur={(event) => onBlur && onBlur(event.target.name, event.target.value as string)}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: '#fff',
            px: 1,
            py: 0.75,
            borderBottom: '1px solid #eee',
          }}
          // Keep typing/clicking in the search box from reaching the Select's own keyboard
          // handling (which would otherwise close the menu or jump-select on each keystroke).
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <KiboTextBox
            inputRef={searchInputRef}
            placeholder="Search..."
            value={search}
            onChange={(_fieldName: string, searchValue: string) => setSearch(searchValue)}
            sx={{ height: '34px' }}
          />
        </Box>
        {filteredOptions.length === 0 && (
          <MenuItem disabled sx={{ fontFamily: 'Poppins', fontSize: '14px' }}>
            No matches
          </MenuItem>
        )}
        {filteredOptions.map((option) => (
          <MenuItem key={option.code} value={option.code}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
      {error && (
        <FormHelperText
          error={error}
          {...(error && { 'aria-errormessage': helperText })}
          sx={{ margin: '3px 0' }}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}

export default KiboStateSelect
