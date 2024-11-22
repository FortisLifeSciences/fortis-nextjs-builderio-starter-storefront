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
} from '@mui/material'

interface FortisRadioProps {
  name?: string
  title?: string | React.ReactNode
  selected?: string
  align?: 'baseline' | 'center' | 'flex-start'
  row?: boolean
  skuStatusText?: string | null
  showPrices?: boolean | null
  radioOptions: {
    variationProductCode?: string
    price?: any
    label: string | number | ReactElement<any, string | JSXElementConstructor<any>>
    value: string
    name: string
    disabled?: boolean
    optionIndicator?: string
  }[]
  sx?: SxProps<Theme>
  onChange: (value: string) => void
}

export const FortisRadio = (props: FortisRadioProps) => {
  const {
    name,
    title,
    radioOptions,
    skuStatusText,
    showPrices,
    selected = '',
    sx,
    align = 'center',
    row = false,
    onChange,
  } = props

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <FormControl sx={{ width: '100%' }}>
      {/* <FormLabel
                id="kibo-radio-buttons-group-label"
                sx={{ fontSize: 'body2', color: 'text.primary', pb: 1 }}
            >
                {title}
            </FormLabel> */}

      {/* Headers for the radio options */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '8px 11px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="body2" sx={{ color: 'grey.900', flex: '1', textAlign: 'left' }}>
          Option
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'grey.900', flex: '0 0 100px', textAlign: 'left' }}
        >
          Catalog #
        </Typography>
        {(skuStatusText === 'CustomCTA' ? showPrices : true) && (
          <Typography
            variant="body2"
            sx={{ color: 'grey.900', flex: '0 0 80px', textAlign: 'right' }}
          >
            Price
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          paddingTop: '5px',
          paddingBottom: '5px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <RadioGroup
          aria-label={name ?? 'kibo-radio'}
          name="radio-buttons-group"
          value={selected}
          onChange={handleChange}
        >
          {radioOptions?.map((radio, index) => (
            <Box
              key={radio.value + index}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: '5px',
                height: '36px',
                padding: '0px 11px',
                borderRadius: '4px',
                bgcolor: selected === radio.value ? 'secondary.main' : 'transparent',
                border:
                  selected === radio.value
                    ? '0px solid rgba(0, 0, 255, 0.3)'
                    : '0px solid transparent',
                width: '100%',
                cursor: 'pointer', // Add this to show a pointer cursor
                '&:hover': {
                  bgcolor: selected === radio.value ? 'secondary.main' : 'grey.200',
                },
              }}
              onClick={() => {
                // Manually trigger the change when clicking the row
                onChange(radio.value)
              }}
            >
              {/* Radio Button and Label */}
              <Radio
                value={radio.value}
                checked={selected === radio.value}
                onChange={handleChange}
                inputProps={{ 'aria-label': radio.name }}
                sx={{
                  padding: '0px 9px 0px 0px', // Adjust padding for better alignment
                }}
                {...(radio.disabled && { disabled: radio.disabled })}
              />
              <Typography
                variant="body2"
                sx={{
                  flex: '1',
                  width: 'fit-content',
                  alignItems: align,
                  marginRight: 2,
                }}
              >
                {radio.label}
              </Typography>

              {/* Catalog Number */}
              <Typography
                variant="body2"
                sx={{
                  flex: '0 0 100px',
                  color: 'text.primary',
                  textAlign: 'left',
                  paddingRight: 2,
                }}
              >
                {radio.variationProductCode}
              </Typography>

              {/* Price */}
              {(skuStatusText === 'CustomCTA' ? showPrices : true) && (
                <Typography
                  variant="body2"
                  sx={{
                    flex: '0 0 80px',
                    color: 'text.primary',
                    textAlign: 'right',
                  }}
                >
                  ${radio.price?.price}
                </Typography>
              )}
            </Box>
          ))}
        </RadioGroup>
      </Box>
    </FormControl>
  )
}

export default FortisRadio
