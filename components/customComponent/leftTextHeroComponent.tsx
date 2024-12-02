import React from 'react'

import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material'
import Image from 'next/image'

import { LeftTextHeroStyle } from './leftTextHeroComponent.style'

interface LeftTextHeroProps {
  leftTextImage: string
  leftTextHeading: string
  ImageAltText: string
  backgroundImage?: string
  leftTextParagraph: string
  primaryButtonText: string
  primaryButtonUrl: string
  secondaryButtonText: string
  secondaryButtonUrl: string
}

const LeftTextHero: React.FC<LeftTextHeroProps> = ({
  leftTextImage,
  ImageAltText,
  leftTextHeading,
  backgroundImage,
  leftTextParagraph,
  primaryButtonText,
  primaryButtonUrl,
  secondaryButtonText,
  secondaryButtonUrl,
}) => {
  const theme = useTheme()
  const mdScreen = useMediaQuery(theme.breakpoints.up('md'))
  const smScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const xsScreen = useMediaQuery(theme.breakpoints.between('xs', 'sm'))

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ ...LeftTextHeroStyle.leftTxtHeroContainer }}>
        <Box
          sx={{
            ...LeftTextHeroStyle.leftTxtBox,
            backgroundImage: `url(${backgroundImage || '/leftTxtBoxBackgroundImage.svg'})`,
          }}
        >
          {(mdScreen || smScreen || xsScreen) && (
            <>
              <Box>
                <Typography component="h1" sx={{ ...LeftTextHeroStyle.leftTxtHeading }}>
                  {leftTextHeading}
                </Typography>
              </Box>
              <Box>
                <Typography component="div" sx={{ ...LeftTextHeroStyle.leftTxtParagraph }}>
                  {leftTextParagraph}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {primaryButtonText && (
                  <Button
                    sx={{ ...LeftTextHeroStyle.leftTxtPrimaryButton }}
                    component="a"
                    href={primaryButtonUrl}
                    target="_blank"
                  >
                    {primaryButtonText}
                  </Button>
                )}
                {secondaryButtonText && (
                  <Button
                    sx={{ ...LeftTextHeroStyle.leftTxtSecondaryButton }}
                    component="a"
                    href={secondaryButtonUrl}
                    target="_blank"
                  >
                    {secondaryButtonText}
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
        <Box sx={{ ...LeftTextHeroStyle.leftTxtImage }}>
          <Image src={leftTextImage} alt={ImageAltText} fill />
        </Box>
      </Box>
    </Box>
  )
}

export default LeftTextHero
