import React from 'react'

import { Box, Typography, useTheme, useMediaQuery } from '@mui/material'
import Image from 'next/image'

import { TextHeroStyle } from './textHeroComponent.style'

interface TextHeroProps {
  FirstImage: string
  SecondImage: string
  paragraphText?: string
}

const TextHero: React.FC<TextHeroProps> = ({ FirstImage, SecondImage, paragraphText }) => {
  const theme = useTheme()
  const mdScreen = useMediaQuery(theme.breakpoints.up('md'))
  const smScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  const truncatedText =
    paragraphText && paragraphText.length > 160
      ? `${paragraphText.substring(0, 160)}`
      : paragraphText

  return (
    <Box sx={{ ...TextHeroStyle.containerBox }}>
      <Box sx={{ ...TextHeroStyle.heroComponent }}>
        {(mdScreen || smScreen) && (
          <>
            {/* First Image */}
            <Box sx={{ ...TextHeroStyle.image1 }}>
              <Image src={FirstImage} alt="First Image" fill />
            </Box>

            {/* Second Image */}
            <Box sx={{ ...TextHeroStyle.image2 }}>
              <Image src={SecondImage} alt="Second Image" fill />
            </Box>
          </>
        )}

        <Box
          sx={{ ...TextHeroStyle.paragraphText }}
          style={{
            backgroundImage: `url('/Center Text Hero Background (1).svg')`,
          }}
        >
          {truncatedText && (
            <Typography
              component="div"
              sx={{ ...TextHeroStyle.paragraphTextP, color: '#30299a' }}
              dangerouslySetInnerHTML={{ __html: truncatedText }}
              style={{
                color: '#30299a',
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default TextHero
