import React, { useMemo, useState } from 'react'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  MenuList,
  Popover,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import PhoneInput, { getCountryCallingCode, type Value } from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css'

export interface KiboPhoneInputProps {
  label?: string
  value?: string | null
  required?: boolean
  error?: boolean
  helperText?: string
  placeholder?: string
  defaultCountry?: string
  onChange?: (name: string, value: string) => void
  onBlur?: (name: string, value: string) => void
  name?: string
  [x: string]: any
}

type CountryOption = { value?: string; label: string }

// Custom, searchable replacement for react-phone-number-input's default native <select> -
// the library hands this everything it needs (current value, the country list, a setter) via
// `countrySelectComponent`, so the whole popover/search UI lives here instead of relying on a
// native <select>'s (non-searchable) browser dropdown.
const CountrySelect = ({
  value,
  options,
  onChange,
  iconComponent: Icon,
  disabled,
  readOnly,
  ...rest
}: {
  value?: string
  options: CountryOption[]
  onChange: (country?: string) => void
  iconComponent?: React.ElementType<{ country?: string; label?: string }>
  disabled?: boolean
  readOnly?: boolean
  [x: string]: any
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const open = Boolean(anchorEl)

  const countries = useMemo(
    () => options.filter((o): o is Required<CountryOption> => !!o.value),
    [options]
  )

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    const qDigits = q.replace(/^\+/, '')
    return countries.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        (qDigits && getCountryCallingCode(c.value as any).includes(qDigits))
    )
  }, [countries, query])

  const handleClose = () => {
    setAnchorEl(null)
    setQuery('')
  }

  return (
    <>
      <Box
        component="button"
        type="button"
        disabled={disabled || readOnly}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: 'none',
          background: 'none',
          padding: 0,
          cursor: disabled || readOnly ? 'default' : 'pointer',
        }}
        {...rest}
      >
        {Icon && <Icon country={value} label={value} />}
        <KeyboardArrowDownIcon sx={{ fontSize: '18px', color: '#6A6A6A' }} />
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { width: 300, borderRadius: '10px' } }}
      >
        <Box sx={{ p: '10px 12px', borderBottom: '1px solid #EDEDED' }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Search country"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '36px',
                fontFamily: 'Poppins',
                fontSize: '13px',
                borderRadius: '8px',
              },
            }}
          />
        </Box>
        <MenuList
          sx={{
            maxHeight: 280,
            overflowY: 'auto',
            pt: 0,
            // Slim, unobtrusive scrollbar instead of the bulky browser default.
            scrollbarWidth: 'thin',
            scrollbarColor: '#D3D7D9 transparent',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#D3D7D9',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#B7BBBD' },
          }}
        >
          {filteredCountries.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === value}
              onClick={() => {
                onChange(option.value)
                handleClose()
              }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              {Icon && <Icon country={option.value} label={option.label} />}
              <Typography sx={{ flex: 1, fontFamily: 'Poppins', fontSize: '14px' }}>
                {option.label}
              </Typography>
              <Typography sx={{ color: '#8A8A8A', fontFamily: 'Poppins', fontSize: '13px' }}>
                +{getCountryCallingCode(option.value as any)}
              </Typography>
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  )
}

// Re-skin react-phone-number-input's own markup (PhoneInput/PhoneInputCountry/PhoneInputInput
// classes) to match KiboTextBox's chrome instead of the library's default look.
const PhoneInputWrapper = styled('div')<{ error?: boolean }>(({ theme, error }) => ({
  width: '100%',
  boxSizing: 'border-box',
  '& *': { boxSizing: 'border-box' },
  '& .PhoneInput': {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '42px',
    padding: '0 14px',
    gap: '8px',
    border: `1px solid ${error ? theme.palette.error.main : '#D3D7D9'}`,
    borderRadius: '8px',
    boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)',
    backgroundColor: '#fff',
    transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
    '&:focus-within': {
      boxShadow: `${alpha(
        error ? theme.palette.error.main : theme.palette.primary.main,
        0.25
      )} 0 0 0 0.2rem`,
    },
  },
  '& .PhoneInputCountry': {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: '6px',
    marginRight: '8px',
    paddingRight: '8px',
    borderRight: '1px solid #D3D7D9',
  },
  '& .PhoneInputCountryIcon': {
    width: '22px',
    height: '16px',
    boxShadow: 'none',
    flexShrink: 0,
  },
  '& .PhoneInputCountryIcon--border': {
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
  '& .PhoneInputInput': {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    fontFamily: 'Poppins',
    fontSize: '14px',
    lineHeight: '140%',
    color: '#454545',
    background: 'transparent',
    '&::placeholder': {
      color: '#8A8A8A',
      opacity: 1,
    },
  },
}))

const KiboPhoneInput = (props: KiboPhoneInputProps) => {
  const {
    label,
    required = false,
    error = false,
    helperText = '',
    placeholder,
    value,
    defaultCountry = 'US',
    onChange,
    onBlur,
    name,
    ...rest
  } = props

  // react-phone-number-input requires E.164 ("+1XXXXXXXXXX") to detect a country and format the
  // number - a saved contact's phone can come back as plain digits (no leading "+"), which the
  // library can't parse: it falls back to a generic globe icon and shows the raw digits verbatim.
  // Normalize for display only; typed input already round-trips through onChange as E.164.
  const normalizedValue = value && !value.startsWith('+') ? `+${value.replace(/\D/g, '')}` : value

  return (
    <FormControl variant="standard" error={error} required={required} fullWidth {...rest}>
      <InputLabel
        sx={{
          position: 'static',
          transform: 'none',
          color: '#3B3B3B',
          fontFamily: 'Poppins',
          fontSize: '15px',
          fontStyle: 'normal',
          fontWeight: '400',
          lineHeight: '150%',
          letterSpacing: '-0.005em',
          marginBottom: '6px',
        }}
        shrink
        htmlFor={label}
      >
        {label}
      </InputLabel>
      <PhoneInputWrapper error={error}>
        <PhoneInput
          id={label}
          international
          defaultCountry={defaultCountry as any}
          flags={flags}
          countrySelectComponent={CountrySelect}
          value={normalizedValue ?? undefined}
          placeholder={placeholder}
          aria-label={label || name}
          onChange={(newValue?: Value) => onChange && onChange(name as string, newValue ?? '')}
          onBlur={() => onBlur && onBlur(name as string, normalizedValue ?? '')}
        />
      </PhoneInputWrapper>

      {helperText && (
        <FormHelperText
          sx={{
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontWeight: '400',
            lineHeight: '16px',
            margin: '4px 0 0',
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}

export default KiboPhoneInput
