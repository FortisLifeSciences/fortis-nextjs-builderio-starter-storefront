import { InputLabel, MenuItem, OutlinedInput, SxProps, Theme, alpha } from '@mui/material'
import { FormControl, FormHelperText, Select } from '@mui/material'
import { styled } from '@mui/material/styles'

// Define a styled OutlinedInput to incorporate KiboInput's styling
const StyledOutlinedInput = styled(OutlinedInput)(({ theme, error }) => ({
  // Don't pad the OutlinedInput root - `.MuiSelect-select` inside it already carries its own
  // default padding, and the two were stacking (14px root + 14px inner ≈ 28px), which is the
  // oversized text-to-border gap. Padding belongs on `.MuiSelect-select` alone.
  padding: 0,
  '& .MuiSelect-select': {
    padding: '10px 14px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderWidth: '1px', // Ensure consistent border width
    borderColor: error ? theme.palette.error.main : '#D3D7D9',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: '1px', // Keep border width consistent on focus
    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
    boxShadow: `${alpha(
      error ? theme.palette.error.main : theme.palette.primary.main,
      0.25
    )} 0 0 0 0.2rem`,
  },
}))

export interface KiboSelectProps {
  name: string
  value?: string
  required?: boolean
  helperText?: string
  error?: boolean
  placeholder?: string
  label?: string
  children: React.ReactNode
  sx?: SxProps<Theme>
  disabled?: boolean
  onChange: (name: string, value: string) => void
  onBlur?: (name: string, value: string) => void
}

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
    // MenuList/MenuItem render inside this Paper, not under the Select root - so the
    // Select's own fontFamily/fontSize sx never reaches them. fontFamily inherits fine,
    // but MenuItem carries its own fontSize (1rem) that wins over an inherited value, so
    // it has to be overridden on the class directly rather than set on the Paper itself.
    sx: {
      fontFamily: 'Poppins',
      '& .MuiMenuItem-root': {
        fontFamily: 'Poppins',
        fontSize: '14px',
      },
    },
  },
}

const KiboSelect = (props: KiboSelectProps) => {
  const {
    name,
    value = '',
    required = false,
    helperText = '',
    error = false,
    placeholder,
    label,
    children,
    onChange,
    onBlur,
    sx,
    ...rest
  } = props

  return (
    <FormControl
      sx={{ minWidth: 120, marginTop: label ? 3 : 0, ...sx }}
      size="small"
      fullWidth
      variant="outlined"
      hiddenLabel={!label}
      required={required}
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
        value={value}
        MenuProps={MenuProps}
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
          'aria-hidden': false,
          'aria-label': label || name,
          'aria-labelledby': name,
        }}
        input={<StyledOutlinedInput error={error} />}
        onChange={(event) => onChange(event.target.name, event.target.value)}
        onBlur={(event) => onBlur && onBlur(event.target.name, event.target.value)}
        {...rest}
      >
        {placeholder && (
          <MenuItem value={''} disabled sx={{ display: 'none' }}>
            {placeholder}
          </MenuItem>
        )}
        {children}
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

export default KiboSelect
