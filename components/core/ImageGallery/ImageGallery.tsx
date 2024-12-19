import { useState, useRef, useEffect } from 'react'

import ArrowBackIos from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos'
import Clear from '@mui/icons-material/Clear'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp'
import Replay from '@mui/icons-material/Replay'
import ZoomIn from '@mui/icons-material/ZoomIn'
import ZoomOut from '@mui/icons-material/ZoomOut'
import { IconButton, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useTranslation } from 'next-i18next'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import { KiboImage } from '@/components/common'
import { PdpImageGalleryDialog } from '@/components/dialogs'
import { useModalContext } from '@/context/ModalContext'
import { productGetters } from '@/lib/getters'
import { swipeDetect } from '@/lib/helpers'
import DefaultImage from '@/public/noImage.png'

import type { ProductImage } from '@/lib/gql/types'

interface ImageGalleryProps {
  digitalAssets: any
  kiboImages: ProductImage[]
  brandImage: any
  title: string
  isZoomed?: boolean
  thumbnailDisplayCount?: number
  placeholderImageUrl?: string
}

const NumberOfPxToScroll = 136
const ThumbnailDimensionInPx = 120

const styles = {
  dots: {
    cursor: 'pointer',
    height: '10px',
    width: '10px',
    margin: '0 0.5rem',
    borderRadius: '50%',
    display: 'inline-block',
    transition: 'backgroundColor 0.6s ease',
  },
}

const ImageGallery = (props: ImageGalleryProps) => {
  const {
    digitalAssets,
    kiboImages,
    brandImage,
    title,
    isZoomed = false,
    thumbnailDisplayCount = 3,
    placeholderImageUrl = DefaultImage,
  } = props
  const [isLoading, setIsLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState({
    selectedIndex: 0,
  })

  const { showModal, closeModal } = useModalContext()

  const imageAssets = digitalAssets
    .filter(
      (asset: { properties: { assettype: string } }) =>
        asset.properties.assettype === 'ProductImage'
    )
    .map((asset: { properties: any }) => asset.properties)
    .sort((a: { sortorder: number }, b: { sortorder: number }) => a.sortorder - b.sortorder)

  function mergeAndSortArrays(array1: any[], array2: ProductImage[]) {
    // Create a map to efficiently find objects in array2 by cmsid
    const map = new Map(array2.map((obj) => [obj.cmsId, obj]))

    // Filter array1 to include only items with a matching cmsid in array2
    return (
      array1
        .filter((obj1) => map.has(obj1.cmsid)) // Retain only matching items
        .map((obj1) => {
          const obj2 = map.get(obj1.cmsid)
          return {
            ...obj1,
            // Add properties from array2 if a match is found
            ...(obj2 ? { imageUrl: obj2.imageUrl, altText: obj2.altText } : {}),
          }
        })
        // Sort the merged array by sortorder (assuming it's a number)
        .sort((a, b) => a.sortorder - b.sortorder)
    )
  }

  const images = mergeAndSortArrays(imageAssets, kiboImages)

  const [showArrow, setArrowVisibility] = useState({
    up: false,
    down: false,
  })

  // Set isLoading to false when images are loaded or processed
  useEffect(() => {
    if (images) {
      setIsLoading(() => images.length === 0)
    }

    if (images && images.length > 3) {
      setArrowVisibility((prevState) => {
        if (prevState.down) return prevState // Avoid unnecessary state updates
        return {
          ...prevState,
          down: true,
        }
      })
    }

    if (images && images.length === 1) {
      // Update selected image index if it differs
      if (selectedImage.selectedIndex !== 0) {
        setSelectedImage((prev) => ({ ...prev, selectedIndex: 0 }))
      }
    }
  }, [images])

  const { t } = useTranslation('common')

  // handle if vertical slider arrow should be visible or not

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // // Mobile: handle touch swipe
  const handleSwipe = () => {
    const gestureZone = document.getElementById('gestureZone')
    if (gestureZone) {
      swipeDetect(gestureZone, (dir: string) => {
        if (dir === 'left' && selectedImage.selectedIndex !== images?.length - 1) {
          setSelectedImage({ ...selectedImage, selectedIndex: selectedImage.selectedIndex + 1 })
        } else if (dir === 'right' && selectedImage.selectedIndex > 0) {
          setSelectedImage({ ...selectedImage, selectedIndex: selectedImage.selectedIndex - 1 })
        }
      })
    }
  }

  const isScrollAtBottom = (element?: HTMLElement | null) => {
    if (element) {
      return element.scrollHeight - (element.scrollTop + element.clientHeight) < NumberOfPxToScroll
    }
  }

  // Desktop: handle vertical slider scrolling
  const handleVerticalSlider = (isDirectionUp: boolean) => {
    const scrollableDiv = scrollContainerRef.current

    scrollableDiv?.scrollBy({
      top: isDirectionUp ? -NumberOfPxToScroll : NumberOfPxToScroll,
      behavior: 'smooth',
    })

    setArrowVisibility(
      isDirectionUp
        ? {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            up: scrollableDiv!.scrollTop > NumberOfPxToScroll,
            down: true,
          }
        : {
            up: true,
            down: !isScrollAtBottom(scrollableDiv),
          }
    )
  }

  const openImageGalary = (images: any, selectedImage: any) => {
    showModal({
      Component: PdpImageGalleryDialog,
      props: {
        images: images,
        SelectedImage: selectedImage,
      },
    })
  }

  const maxHeight = thumbnailDisplayCount * ThumbnailDimensionInPx + thumbnailDisplayCount * 12 + 60

  if (isLoading) {
    return (
      <Box
        id="gestureZone"
        component={'div'}
        onTouchStartCapture={handleSwipe}
        data-testid="gestureZone"
      >
        {/* Gallary Section start */}
        <Stack
          direction="row"
          spacing={{ xs: 0, md: images?.length ? 2 : 0 }}
          maxHeight={maxHeight}
        >
          <Box
            position="relative"
            sx={{
              border: { xs: 'none', md: '1px solid #ccc' },
              width: { xs: '100%', md: '90%' },
              height: { xs: '40vh', md: 596 },
              maxWidth: '464px',
              maxHeight: '464px',
            }}
            display="flex"
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent="flex-start"
          >
            <TransformWrapper>
              <>
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  contentStyle={{ width: '100%', height: '100%' }}
                >
                  <Box
                    width="100%"
                    display="flex"
                    flexDirection="row"
                    flexWrap="wrap"
                    alignContent="center"
                    justifyContent="space-between"
                    position="relative"
                  >
                    <KiboImage
                      src={brandImage || placeholderImageUrl}
                      alt={t('product-image-alt')}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                </TransformComponent>
              </>
            </TransformWrapper>
          </Box>
        </Stack>
      </Box>
    )
  }

  return (
    <Box
      id="gestureZone"
      component={'div'}
      onTouchStartCapture={handleSwipe}
      data-testid="gestureZone"
    >
      {/* Title section */}
      <Box
        display={isZoomed ? 'flex' : 'none'}
        justifyContent="space-between"
        alignItems={'center'}
        mb={5}
      >
        <Typography variant="h1" fontWeight="bold">
          {title}
        </Typography>
        <Clear color="action" />
      </Box>

      {/* Gallary Section start */}
      <Stack direction="row" spacing={{ xs: 0, md: images?.length ? 2 : 0 }} maxHeight={maxHeight}>
        {/* Vertical slider secton start */}
        <Box
          width="10%"
          minWidth={ThumbnailDimensionInPx}
          sx={{
            display: {
              xs: 'none',
              md: images?.length ? 'flex' : 'none',
            },
          }}
        >
          <Stack spacing={1}>
            {showArrow.up && (
              <Box textAlign={'center'}>
                <IconButton aria-label="up" onClick={() => handleVerticalSlider(true)} size="large">
                  <KeyboardArrowUp fontSize="large" />
                </IconButton>
              </Box>
            )}

            <Stack
              spacing={1.5}
              role="tablist"
              className="scrolling-div"
              ref={scrollContainerRef}
              sx={{
                maxHeight: maxHeight,
                width: '100%',
                overflowY: 'auto',
                '::-webkit-scrollbar': { width: '0px' },
              }}
            >
              {images?.map((image, i) => {
                return (
                  <Box
                    key={image?.imageUrl}
                    component="div"
                    width={ThumbnailDimensionInPx}
                    minHeight={ThumbnailDimensionInPx}
                    position="relative"
                    sx={{
                      borderWidth: i === selectedImage.selectedIndex ? 3 : 1,
                      borderStyle: 'solid',
                      borderColor: 'primary.main',
                      cursor: 'pointer',
                    }}
                    aria-label={(image?.imagealt as string) || t('product-image-alt')}
                    aria-selected={i === selectedImage.selectedIndex}
                    onClick={() => setSelectedImage({ ...selectedImage, selectedIndex: i })}
                  >
                    <KiboImage
                      src={
                        productGetters.handleProtocolRelativeUrl(image?.imageUrl as string) ||
                        placeholderImageUrl
                      }
                      alt={(image?.imagealt as string) || t('product-image-alt')}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                )
              })}
            </Stack>

            {showArrow.down && (
              <Box textAlign={'center'}>
                <IconButton
                  aria-label="down"
                  size="large"
                  onClick={() => handleVerticalSlider(false)}
                >
                  <KeyboardArrowDown fontSize="large" />
                </IconButton>
              </Box>
            )}
          </Stack>
        </Box>
        {/* Vertical slider secton end */}

        {/* Selected Image secton start */}
        {images?.length > 1 && (
          <Box display={isZoomed ? 'flex' : 'none'} alignItems="center">
            <IconButton
              aria-label="previous"
              disabled={selectedImage.selectedIndex < 1}
              onClick={() =>
                setSelectedImage({
                  ...selectedImage,
                  selectedIndex: selectedImage.selectedIndex - 1,
                })
              }
            >
              <ArrowBackIos />
            </IconButton>
          </Box>
        )}
        <Box
          position="relative"
          sx={{
            border: { xs: 'none', md: '1px solid #ccc' },
            width: { xs: '100%', md: '90%' },
            height: { xs: '40vh', md: 596 },
            maxWidth: '464px',
            maxHeight: '464px',
          }}
          display="flex"
          flexDirection={'column'}
          alignItems={'center'}
          justifyContent="flex-start"
        >
          <TransformWrapper>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <Box
                  justifyContent="flex-end"
                  width="100%"
                  sx={{
                    display: {
                      xs: 'none',
                      md: isZoomed ? 'flex' : 'none',
                    },
                  }}
                >
                  <IconButton aria-label="zoom in" onClick={() => zoomIn()}>
                    <ZoomIn />
                  </IconButton>
                  <IconButton aria-label="zoom out" onClick={() => zoomOut()}>
                    <ZoomOut />
                  </IconButton>
                  <IconButton aria-label="reset" onClick={() => resetTransform()}>
                    <Replay />
                  </IconButton>
                </Box>
                <Box
                  justifyContent="flex-end"
                  width="100%"
                  sx={{
                    display: 'flex',
                  }}
                >
                  {images[selectedImage.selectedIndex]?.imagetitle ? (
                    <IconButton
                      sx={{
                        position: 'absolute', // Position the button relative to the parent
                        top: '10px', // Adjust the vertical positioning
                        right: '10px', // Adjust the horizontal positioning
                        display: 'flex',
                        margin: 0,
                        alignItems: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '3px',
                        backgroundColor: 'primary.main',
                        zIndex: 10, // Ensure it appears above the image
                        '& span': {
                          color: 'secondary.light',
                          fontSize: '32px',
                        },
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      }}
                      aria-label="zoom in"
                      onClick={() => openImageGalary(images, selectedImage)}
                    >
                      <span className="material-symbols-outlined">zoom_in</span>
                    </IconButton>
                  ) : (
                    <></>
                  )}
                </Box>
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  contentStyle={{ width: '100%', height: '100%' }}
                >
                  <Box
                    width="100%"
                    display="flex"
                    flexDirection="row"
                    flexWrap="wrap"
                    alignContent="center"
                    justifyContent="space-between"
                    position="relative"
                  >
                    <KiboImage
                      key={selectedImage.selectedIndex}
                      src={
                        images?.length
                          ? images[selectedImage.selectedIndex]?.imageUrl
                            ? productGetters.handleProtocolRelativeUrl(
                                images[selectedImage.selectedIndex]?.imageUrl as string
                              )
                            : placeholderImageUrl
                          : placeholderImageUrl
                      }
                      alt={
                        images?.length
                          ? (images[selectedImage.selectedIndex]?.altText as string)
                          : 'placeholder-image'
                      }
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'contain' }}
                      data-testid={`selected-image`}
                    />
                  </Box>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </Box>
        {images?.length > 1 && (
          <Box display={isZoomed ? 'flex' : 'none'} alignItems="center">
            <IconButton
              aria-label="next"
              disabled={selectedImage.selectedIndex == images?.length - 1}
              onClick={() =>
                setSelectedImage({
                  ...selectedImage,
                  selectedIndex: selectedImage.selectedIndex + 1,
                })
              }
            >
              <ArrowForwardIos />
            </IconButton>
          </Box>
        )}
        {/* Selected Image secton end */}
      </Stack>
      {/* Gallary Section start */}

      {/* Mobile: show dots for mobile view */}
      <Box
        pt={2}
        sx={{
          display: {
            xs: 'flex',
            md: 'none',
          },
          justifyContent: 'center',
        }}
      >
        {images?.map((_: any, i: any) => (
          <Box
            key={i}
            sx={{
              ...styles.dots,
              backgroundColor: i === selectedImage.selectedIndex ? 'text.primary' : 'grey.500',
            }}
            onClick={() => setSelectedImage({ ...selectedImage, selectedIndex: i })}
          ></Box>
        ))}
      </Box>

      <Box
        sx={{
          display: {
            xs: isZoomed ? 'flex' : 'none',
            md: 'none',
          },
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '60%',
        }}
      >
        <Box sx={{ backgroundColor: 'text.primary', color: 'common.white', padding: '5% 10%' }}>
          <Typography variant="body1">{t('pinch-image-to-zoom')}</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ImageGallery
