import React, { useEffect, useState } from 'react'

import { ArrowForwardIos } from '@mui/icons-material'
import { Box, Typography, IconButton } from '@mui/material'
import Image from 'next/image'

import { buttonStyle } from './metaDataComponent.style'

interface Metadata {
  title: string | null
  image: string | null
  description: string | null
}

interface MetadataComponentProps {
  url: string
  styleType: 'primary' | 'secondary'
  manualImage?: string
  manualTitle?: string
  manualDescription?: string
}

const truncateDescription = (desc: string | null | undefined): string | null => {
  return desc && desc.length > 160 ? `${desc.slice(0, 160)}…` : desc || null
}

const MetadataComponent: React.FC<MetadataComponentProps> = ({
  url,
  styleType,
  manualImage,
  manualTitle,
  manualDescription,
}) => {
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    async function loadMetadata() {
      if (!url) return
      try {
        const response = await fetch(`/api/fetchMetadata?url=${encodeURIComponent(url)}`)
        const data = await response.json()
        setMetadata(data)
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
      }
    }
    loadMetadata()
  }, [url])

  console.log('This is the metaData -----> ', metadata)

  const resolvedImage = metadata?.image || manualImage
  const resolvedTitle = metadata?.title || manualTitle
  const resolvedDescription = truncateDescription(metadata?.description || manualDescription)

  if (!resolvedImage && !resolvedTitle && !resolvedDescription) {
    return <div>Loading...</div>
  }

  return (
    <Box
      sx={{
        ...buttonStyle.featuredButtonContainer,
        flexDirection: {
          xs: 'column',
          sm: 'column',
          md: 'column',
        },
        padding: { xs: '0', sm: '0', md: '0 20px' },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        sx={{
          ...buttonStyle.imageContainer,
          width: '100%',
          height: { xs: 'auto', sm: 'auto', md: '255px' },
          marginBottom: { xs: '0', sm: '0', md: '0' },
        }}
      >
        {resolvedImage && (
          <Image
            src={resolvedImage}
            alt={resolvedImage || 'Image'}
            width={388}
            height={255}
            style={{ objectFit: 'cover' }}
          />
        )}
      </Box>

      <Box
        sx={[
          buttonStyle.featuredButtonContent,
          styleType === 'primary',
          {
            marginTop: { xs: 0, sm: 0, md: 0 },
            paddingTop: { xs: '10px', sm: '10px', md: '0' },
          },
        ]}
      >
        <Box
          sx={[
            styleType === 'primary'
              ? buttonStyle.primaryHeadingText
              : buttonStyle.secondaryHeadingText,
            isHovered && { color: '#4C47C4' },
            { paddingTop: { xs: '20px', md: '90px' } },
          ]}
        >
          {resolvedTitle}
        </Box>

        <Typography
          variant="body2"
          sx={[
            styleType === 'primary'
              ? buttonStyle.primaryParagraphText
              : buttonStyle.secondaryParagraphText,
            isHovered && { color: '#4C47C4' },
            { paddingTop: { xs: '10px', md: '24px' } },
          ]}
        >
          {resolvedDescription}
        </Typography>

        <Box sx={buttonStyle.iconContainer}>
          <IconButton
            sx={[
              styleType === 'primary'
                ? buttonStyle.arrowPrimaryButton
                : buttonStyle.arrowSecondaryButton,
              isHovered && { backgroundColor: '#4C47C4' },
            ]}
          >
            <ArrowForwardIos
              sx={[
                styleType === 'primary'
                  ? buttonStyle.primaryArrowIcon
                  : buttonStyle.secondaryArrowIcon,
                isHovered && { color: '#fff' },
              ]}
            />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default MetadataComponent
