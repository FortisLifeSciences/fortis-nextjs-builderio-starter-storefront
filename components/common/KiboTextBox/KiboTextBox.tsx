import React from 'react'

import { FormControl, FormHelperText, IconButton, InputBase, InputLabel } from '@mui/material'
import { styled } from '@mui/material/styles'

export interface KiboTextBoxProps {
  label?: string
  value?: string | null | React.ReactNode
  required?: boolean
  error?: boolean
  helperText?: any
  placeholder?: string
  icon?: React.ReactNode
  onChange?: (name: string, value: string) => void
  onBlur?: (name: string, value: string) => void
  onIconClick?: () => void

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  sx?: any
  [x: string]: any
}

const KiboInput = styled(InputBase)(({ theme, error }) => ({
  '&.MuiInputBase-root:focus-within': {
    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${error ? theme.palette.error.main : theme.palette.primary.main}`,
  },
  '& .MuiInputBase-input': {
    position: 'relative',
    padding: '10px 14px',
    fontFamily: 'Poppins',
    fontSize: '14px',
    lineHeight: '140%',
    color: '#454545',
    transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
    '&::placeholder': {
      color: '#8A8A8A',
      opacity: 1,
    },
  },
}))

const KiboTextBox = (props: KiboTextBoxProps) => {
  const {
    label,
    required = false,
    error = false,
    helperText = '',
    placeholder,
    onKeyDown,
    icon,
    sx,
    value,
    onChange,
    onBlur,
    onIconClick,
    onInput,
    name,
    multiline = false,
    ...rest
  } = props

  return (
    <FormControl variant="standard" error={error} required={required} {...rest} fullWidth>
      <InputLabel
        sx={{
          // MUI floats InputLabel absolutely by default (built for the overlap-then-shrink
          // pattern). We always render shrunk, so take it out of that flow entirely and lay
          // it out as a normal block above the input, spaced by marginBottom.
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
      <KiboInput
        sx={{
          borderColor: error ? 'error.main' : '#D3D7D9',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '8px',
          boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)',
          fontSize: { xs: '14px !important', md: '14px !important' },
          ...sx,
          // A fixed height only makes sense for single-line inputs - forcing it on a
          // multiline field crushes/clips the textarea instead of letting it grow.
          ...(!multiline && { height: '42px' }),
          backgroundColor: '#fff',
        }}
        value={value}
        id={label}
        size="small"
        error={error}
        multiline={multiline}
        inputProps={{
          'aria-invalid': error,
          'aria-label': label || (name as string),
        }}
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.name, e.target.value)}
        onBlur={(e) => {
          onBlur && onBlur(e.target.name, e.target.value)
        }}
        onKeyDown={onKeyDown}
        onInput={onInput}
        {...(icon && {
          endAdornment: onIconClick ? (
            <IconButton aria-label="toggle icon visibility" size="small" onClick={onIconClick}>
              {icon}
            </IconButton>
          ) : (
            icon
          ),
        })}
        {...rest}
      />

      {/* Only reserve space for this when there's actually something to say - an always-on
          empty helper row was eating an extra ~20px on every field. */}
      {helperText && (
        <FormHelperText
          id="helper-text"
          aria-errormessage={helperText}
          dangerouslySetInnerHTML={{ __html: helperText }}
          sx={{
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontWeight: '400',
            lineHeight: '16px',
            margin: '4px 0 0',
          }}
        />
      )}
    </FormControl>
  )
}

export default KiboTextBox
