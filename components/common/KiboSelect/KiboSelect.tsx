import { InputLabel, MenuItem, OutlinedInput, SxProps, Theme, alpha } from '@mui/material'
import { FormControl, FormHelperText, Select } from '@mui/material'
import { styled } from '@mui/material/styles'

// Define a styled OutlinedInput to incorporate KiboInput's styling
const StyledOutlinedInput = styled(OutlinedInput)(({ theme, error }) => ({
  padding: '4.5px 12px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderWidth: '1px', // Ensure consistent border width
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
          sx={{ top: -18, left: -13, color: error ? 'error.main' : 'black', ...sx }}
        >
          {label}
        </InputLabel>
      )}
      <Select
        size="small"
        displayEmpty
        name={name}
        error={error}
        value={value}
        MenuProps={MenuProps}
        sx={{
          height: '34px',
          ...sx,
          color: 'black',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
          },
        }}
        inputProps={{ 'aria-hidden': false, 'aria-label': label || name }}
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
