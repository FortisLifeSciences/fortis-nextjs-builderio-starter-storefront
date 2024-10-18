import React from 'react'

import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material'
import Image from 'next/image'

import { LeftTextHeroStyle } from './leftTextHeroComponent.style'

interface LeftTextHeroProps {
  leftTextImage: string
  leftTextHeading: string
  backgroundImage?: string
  leftTextParagraph: string
  primaryButtonText: string
  primaryButtonUrl: string
  secondaryButtonText: string
  secondaryButtonUrl: string
}

const LeftTextHero: React.FC<LeftTextHeroProps> = ({
  leftTextImage,
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

  const truncatedParagraph =
    leftTextParagraph && leftTextParagraph.length > 175
      ? `${leftTextParagraph.substring(0, 175)}...`
      : leftTextParagraph

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
                  {truncatedParagraph}
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
          <Image src={leftTextImage} alt="Left Text Image" fill />
        </Box>
      </Box>
    </Box>
  )
}

export default LeftTextHero
