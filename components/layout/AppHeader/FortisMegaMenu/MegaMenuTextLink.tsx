import { useState, useEffect } from 'react'

import { Box } from '@mui/system'

const MegaMenuTextLink = ({ text }: { text: string }) => {
  // Initialize state with an array of strings
  const [wrapTextArr, setWrapTextArr] = useState<string[]>([])
  const [isHovered, setIsHovered] = useState<boolean>(false)

  useEffect(() => {
    if (!text) {
      console.warn('Text is undefined or null.')
      setWrapTextArr([])
      return
    }

    const result = text.match(/.{1,36}/g)
    if (result) {
      setWrapTextArr(result)
    }
  }, [text])

  return (
    <>
      {wrapTextArr.map((item: string, index: number) => (
        <Box
          key={index}
          sx={{
            display: 'inline-block',
            width: 'fit-content',
            position: 'relative',
            color: 'primary.main',
            cursor: 'pointer',
            '&:before': {
              content: `""`,
              position: 'absolute',
              width: '100%',
              height: '1px',
              bottom: 0,
              left: 0,
              backgroundColor: 'primary.main',
            },
            '&:after': {
              content: `""`,
              position: 'absolute',
              width: '100%',
              transform: 'scaleX(0)',
              height: '1px',
              bottom: 0,
              left: 0,
              backgroundColor: 'primary.main',
              transformOrigin: 'bottom left',
              transition: 'transform 0.7s ease-in-out',
            },
            '&:hover::before': {
              display: 'none',
            },
            '&:hover::after': {
              transform: 'scaleX(1)',
              transformOrigin: 'bottom left',
            },
            // Apply hover effect on all siblings when any item is hovered
            ...(isHovered && {
              '&::before': {
                display: 'none',
              },
              '&::after': {
                transform: 'scaleX(1)',
                transformOrigin: 'bottom left',
              },
            }),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {item}
        </Box>
      ))}
    </>
  )
}

export default MegaMenuTextLink
