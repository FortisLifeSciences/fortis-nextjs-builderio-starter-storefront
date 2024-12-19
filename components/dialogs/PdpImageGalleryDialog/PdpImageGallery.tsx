import { useState } from 'react'

import Replay from '@mui/icons-material/Replay'
import ZoomIn from '@mui/icons-material/ZoomIn'
import ZoomOut from '@mui/icons-material/ZoomOut'
import { Grid, IconButton, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useTranslation } from 'next-i18next'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import { ImageGalleryDialog } from '@/components/common'
import { KiboImage } from '@/components/common'
import { useModalContext } from '@/context/ModalContext'
import { productGetters } from '@/lib/getters'
import DefaultImage from '@/public/noImage.png'

interface ImageCalleryDialogProps {
  images: any
  SelectedImage: any
  isZoomed?: boolean
  placeholderImageUrl?: string
}

const B2BAccountFormDialog = (props: ImageCalleryDialogProps) => {
  const { t } = useTranslation('common')
  const { images, SelectedImage, isZoomed = false, placeholderImageUrl = DefaultImage } = props

  const [selectedImage, setSelectedImage] = useState({
    selectedIndex: SelectedImage?.selectedIndex,
  })

  const { showModal, closeModal } = useModalContext()

  //***** May use In future  *****
  // const previousImage = () =>{
  //   if(selectedImage.selectedIndex <= 0 ){
  //     setSelectedImage({
  //       ...selectedImage,
  //       selectedIndex: images.length -1,
  //     })
  //   }else{
  //     setSelectedImage({
  //       ...selectedImage,
  //       selectedIndex: selectedImage.selectedIndex - 1,
  //     })
  //   }
  // }

  const nextImage = () => {
    if (selectedImage.selectedIndex >= images.length - 1) {
      setSelectedImage({
        ...selectedImage,
        selectedIndex: 0,
      })
    } else {
      setSelectedImage({
        ...selectedImage,
        selectedIndex: selectedImage.selectedIndex + 1,
      })
    }
  }

  return (
    <ImageGalleryDialog
      showCloseButton
      showContentTopDivider={false}
      showContentBottomDivider={false}
      Actions={''}
      Content={
        <>
          <Grid container columnSpacing={{ md: 2 }} sx={{ maxHeight: '590px' }}>
            <Grid item sm={8}>
              {/* Gallary Section start */}
              <Stack direction="row" spacing={images?.length ? 2 : 0} maxHeight="580px">
                <Box
                  position="relative"
                  sx={{
                    border: '1px solid #ccc',
                    width: { xs: '40vh', md: '100%' },
                    height: { xs: '40vh', md: 580 },
                    maxWidth: '600px',
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
                {/* Selected Image secton end */}
              </Stack>
              {/* Gallary Section start */}
            </Grid>
            <Grid item sm={4} sx={{ paddingTop: '50px' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  maxHeight: '580px',
                  height: '100%',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'grey.900', fontWeight: '500', paddingBottom: '20px' }}
                  >
                    {images[selectedImage.selectedIndex]?.imagetitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'grey.900', fontWeight: '300' }}
                    dangerouslySetInnerHTML={{
                      __html: images[selectedImage.selectedIndex]?.imagecaption || '',
                    }}
                  />
                </Box>
                <Box>
                  {images?.length > 1 && (
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <IconButton
                        aria-label="next"
                        // disabled={selectedImage.selectedIndex == images?.length - 1}
                        onClick={() => nextImage()}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            display: 'flex',
                            color: 'primary.main',
                            fontWeight: '500',
                            paddingBottom: '0',
                            cursor: 'pointer',
                            '&:hover': {
                              color: 'primary.light',
                              background: 'transparent',
                            },
                          }}
                        >
                          Next{' '}
                          <span className="material-symbols-outlined">
                            keyboard_double_arrow_right
                          </span>
                        </Typography>
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </>
      }
      customMaxWidth="1000px"
      customMaxHeight="640px"
      onClose={closeModal}
    />
  )
}

export default B2BAccountFormDialog
