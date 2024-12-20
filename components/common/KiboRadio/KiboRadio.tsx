import React, { JSXElementConstructor, ReactElement } from 'react'

import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Theme,
  SxProps,
  Typography,
  Box,
  Grid, // Import Grid from MUI
} from '@mui/material'

interface KiboRadioProps {
  name?: string
  title?: string | React.ReactNode
  selected?: string
  align?: 'baseline' | 'center' | 'flex-start'
  row?: boolean
  addressCheckout?: boolean
  radioOptions: {
    label: string | number | ReactElement<any, string | JSXElementConstructor<any>>
    value: string
    name: string
    disabled?: boolean
    optionIndicator?: string // use this to assign a specific property to an option. e.g: isPrimary
  }[]
  sx?: SxProps<Theme>
  boxSx?: SxProps<Theme>
  onChange: (value: string) => void
}

export const KiboRadio = (props: KiboRadioProps) => {
  const {
    name,
    title,
    radioOptions,
    selected = '',
    sx,
    boxSx,
    align = 'center',
    row = false,
    onChange,
    addressCheckout,
  } = props

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const renderRadioOption = (radio: KiboRadioProps['radioOptions'][0], index: number) => {
    const isSelected = selected === radio.value
    const optionContent = (
      <Box
        key={radio.value + index}
        sx={{
          width: '100%',
          p: 2,
          borderRadius: '5px',
          backgroundColor: isSelected ? 'secondary.main' : 'inherit',
          transition: 'background-color 0.3s',
          ...boxSx,
        }}
      >
        {radio.optionIndicator && (
          <Typography sx={{ fontSize: 'subtitle2', color: 'text.primary', fontWeight: 700, pl: 4 }}>
            {radio.optionIndicator}
          </Typography>
        )}
        <FormControlLabel
          sx={{ width: 'fit-content', alignItems: align, ...sx }}
          value={radio.value}
          control={
            <Radio
              inputProps={{ 'aria-label': radio.name }}
              {...(radio.disabled && { disabled: radio.disabled })}
            />
          }
          label={radio.label}
        />
      </Box>
    )

    return addressCheckout ? (
      <Grid item xs={12} sm={6} key={radio.value + index}>
        {optionContent}
      </Grid>
    ) : (
      optionContent
    )
  }

  return (
    <FormControl>
      {title && (
        <FormLabel
          id="kibo-radio-buttons-group-label"
          sx={{ fontSize: 'body2', color: 'text.primary', pb: 1 }}
        >
          {title}
        </FormLabel>
      )}
      <RadioGroup
        aria-label={name ?? 'kibo-radio'}
        name="radio-buttons-group"
        value={selected}
        onChange={handleChange}
        row={row}
      >
        {addressCheckout ? (
          <Grid container spacing={2}>
            {radioOptions?.map(renderRadioOption)}
          </Grid>
        ) : (
          radioOptions?.map(renderRadioOption)
        )}
      </RadioGroup>
    </FormControl>
  )
}

export default KiboRadio
