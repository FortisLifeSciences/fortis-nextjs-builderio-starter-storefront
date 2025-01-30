import React, { useEffect, useState } from 'react'

import { ArrowForwardIos } from '@mui/icons-material'
import { Box, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material'
import Image from 'next/image'

import { buttonStyle } from './featuredPageButtonComponent.style'
import MetadataComponent from '../MetaDataComponent/metaDataComponent'

interface FeaturedPageButtonProps {
  selectMode: 'metadata' | 'manual'
  featuredButtonStyle: 'primary' | 'secondary'
  url?: string
  primaryImage?: string
  primaryHeadingText?: string
  primaryParagraphText?: string
  secondaryImage?: string
  secondaryHeadingText?: string
  secondaryParagraphText?: string
}

const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '…' : text
}

const FeaturedPageButton: React.FC<FeaturedPageButtonProps> = ({
  selectMode = 'manual',
  featuredButtonStyle = 'primary',
  url,
  primaryImage,
  primaryHeadingText,
  primaryParagraphText,
  secondaryImage,
  secondaryHeadingText,
  secondaryParagraphText,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<'primary' | 'secondary'>(featuredButtonStyle)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setSelectedStyle(featuredButtonStyle)
  }, [featuredButtonStyle])

  const theme = useTheme()
  const isMdScreen = useMediaQuery(theme.breakpoints.up('md'))

  // Only render content if Select Mode is set to "manual"
  if (selectMode === 'metadata') {
    if (!url) {
      return <Typography variant="body1">No URL provided to fetch metadata.</Typography>
    }
    return (
      <MetadataComponent
        url={url}
        styleType={selectedStyle}
        manualImage={selectedStyle === 'primary' ? primaryImage : secondaryImage}
        manualTitle={selectedStyle === 'primary' ? primaryHeadingText : secondaryHeadingText}
        manualDescription={
          selectedStyle === 'primary' ? primaryParagraphText : secondaryParagraphText
        }
      />
    )
  }

  return (
    <Box sx={buttonStyle.featuredButtonContainer}>
      <Box sx={{ flexDirection: isMdScreen ? 'row' : 'column' }}>
        <Box
          sx={
            selectedStyle === 'primary'
              ? buttonStyle.primaryImageContainer
              : buttonStyle.secondaryImageContainer
          }
        >
          {selectedStyle === 'primary'
            ? primaryImage && (
                <Image
                  src={primaryImage}
                  alt="Primary Image"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              )
            : secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt="Secondary Image"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              )}
        </Box>

        <Box
          sx={[buttonStyle.featuredButtonContent, selectedStyle === 'primary']}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Box
            sx={[
              selectedStyle === 'primary'
                ? buttonStyle.primaryHeadingText
                : buttonStyle.secondaryHeadingText,
              isHovered && { color: '#4C47C4' },
            ]}
          >
            {selectedStyle === 'primary' ? primaryHeadingText : secondaryHeadingText}
          </Box>

          <Typography
            variant="body2"
            sx={[
              selectedStyle === 'primary'
                ? buttonStyle.primaryParagraphText
                : buttonStyle.secondaryParagraphText,
              isHovered && { color: '#4C47C4' },
            ]}
          >
            {selectedStyle === 'primary'
              ? truncateText(primaryParagraphText, 160)
              : truncateText(secondaryParagraphText, 160)}
          </Typography>

          <Box sx={buttonStyle.iconContainer}>
            {selectedStyle === 'primary' && (
              <IconButton
                aria-label="Primary Navigate forward"
                sx={[buttonStyle.arrowPrimaryButton, isHovered && { backgroundColor: '#4C47C4' }]}
              >
                <ArrowForwardIos
                  sx={[buttonStyle.primaryArrowIcon, isHovered && { color: '#fff' }]}
                />
              </IconButton>
            )}

            {selectedStyle === 'secondary' && (
              <IconButton
                aria-label="Secondary Navigate forward"
                sx={[buttonStyle.arrowSecondaryButton, isHovered && { backgroundColor: '#4C47C4' }]}
              >
                <ArrowForwardIos
                  sx={[buttonStyle.secondaryArrowIcon, isHovered && { color: '#fff' }]}
                />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default FeaturedPageButton
