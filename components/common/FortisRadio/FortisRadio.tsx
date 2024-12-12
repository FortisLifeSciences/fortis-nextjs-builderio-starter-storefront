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
import * as cookieNext from 'cookies-next'
interface FortisRadioProps {
  name?: string
  title?: string | React.ReactNode
  selected?: string
  align?: 'baseline' | 'center' | 'flex-start'
  row?: boolean
  skuStatusText?: string | null
  showPrices?: boolean | null
  ousShowPrices?: boolean | null
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
    ousShowPrices,
    selected = '',
    sx,
    align = 'center',
    row = false,
    onChange,
  } = props

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }
  const countryCode = cookieNext.getCookie('ipBasedCountryCode') || ''
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
          gap: '10px',
          padding: '8px 10px',
          borderBottom: '1px solid #8D8D8D',
        }}
      >
        <Typography
          sx={{
            flex: '1',
            textAlign: 'left',
            color: '#020027',
            fontFamily: 'Poppins',
            fontSize: { md: '16px', sm: '14px', xs: '14px' },
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 'normal',
          }}
        >
          Option
        </Typography>
        <Typography
          sx={{
            flex: { md: '0 0 120px', sm: '0 0 100px', xs: '0 0 80px' },
            flexShrink: '0',
            textAlign: 'center',
            color: '#020027',
            fontFamily: 'Poppins',
            fontSize: { md: '16px', sm: '14px', xs: '14px' },
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 'normal',
          }}
        >
          Catalog #
        </Typography>
        {((countryCode !== 'US' && ousShowPrices) || countryCode === 'US') &&
          (skuStatusText === 'CustomCTA' ? showPrices : true) && (
            <Typography
              sx={{
                flex: { md: '0 0 120px', sm: '0 0 100px', xs: '0 0 80px' },
                flexShrink: '0',
                textAlign: 'right',
                color: '#020027',
                fontFamily: 'Poppins',
                fontSize: { md: '16px', sm: '14px', xs: '14px' },
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: 'normal',
              }}
            >
              Price
            </Typography>
          )}
      </Box>

      <Box
        sx={{
          padding: '5px 0px',
          borderBottom: '1px solid #8D8D8D',
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
                gap: '10px',
                padding: '0px 10px',
                paddingLeft: '0',
                borderRadius: '3px',
                bgcolor: selected === radio.value ? 'secondary.main' : 'transparent',
                border:
                  selected === radio.value
                    ? '0px solid rgba(0, 0, 255, 0.3)'
                    : '0px solid transparent',
                width: '100%',
                marginBottom: '5px',
                '&:last-child': {
                  marginBottom: '0',
                },
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
              <Box sx={{ display: 'flex', alignItems: 'center', flex: '1' }}>
                {/* Radio Button and Label */}
                <Radio
                  sx={{ flexShrink: '0' }}
                  value={radio.value}
                  checked={selected === radio.value}
                  onChange={handleChange}
                  inputProps={{ 'aria-label': radio.name }}
                  {...(radio.disabled && { disabled: radio.disabled })}
                />
                <Typography
                  sx={{
                    flex: '1',
                    color: '#000',
                    fontFamily: 'Poppins',
                    fontSize: { md: '16px', sm: '14px', xs: '14px' },
                    fontStyle: 'normal',
                    fontWeight: '300',
                    lineHeight: { md: '40px', sm: '20px', xs: '20px' },
                  }}
                >
                  {radio.label}
                </Typography>
              </Box>

              {/* Catalog Number */}
              <Typography
                sx={{
                  flex: { md: '0 0 120px', sm: '0 0 100px', xs: '0 0 80px' },
                  flexShrink: '0',
                  textAlign: 'center',
                  color: '#000',
                  fontFamily: 'Poppins',
                  fontSize: { md: '16px', sm: '14px', xs: '14px' },
                  fontStyle: 'normal',
                  fontWeight: '300',
                  lineHeight: { md: '40px', sm: '20px', xs: '20px' },
                }}
              >
                {radio.variationProductCode}
              </Typography>

              {/* Price */}
              {((countryCode !== 'US' && ousShowPrices) || countryCode === 'US') &&
                (skuStatusText === 'CustomCTA' ? showPrices : true) && (
                  <Typography
                    sx={{
                      flex: { md: '0 0 120px', sm: '0 0 100px', xs: '0 0 80px' },
                      flexShrink: '0',
                      textAlign: 'right',
                      color: '#000',
                      fontFamily: 'Poppins',
                      fontSize: { md: '16px', sm: '14px', xs: '14px' },
                      fontStyle: 'normal',
                      fontWeight: '300',
                      lineHeight: { md: '40px', sm: '20px' },
                    }}
                  >
                    ${radio.price?.price.toFixed(2)}
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
