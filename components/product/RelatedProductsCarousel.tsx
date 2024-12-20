import React, { useRef, useState } from 'react'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { ArrowBackIos } from '@mui/icons-material'
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos'
import {
  Card,
  Typography,
  CardMedia,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Link from 'next/link'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { ProductCardStyles } from './ProductCard/ProductCard.styles'
import { KiboImage } from '@/components/common'
import { productGetters } from '@/lib/getters'
import abcore from '@/public/Brand_Logo/abcore-logo.png'
import arista from '@/public/Brand_Logo/arista-logo.png'
import bethyl from '@/public/Brand_Logo/bethyl-logo.png'
import empirical from '@/public/Brand_Logo/empirical-logo.png'
import fortis from '@/public/Brand_Logo/fortis-logo.png'
import ipoc from '@/public/Brand_Logo/ipoc-logo.png'
import nanocomposix from '@/public/Brand_Logo/nanocomposix-logo.png'
import vector from '@/public/Brand_Logo/vector-logo.png'
import DefaultImage from '@/public/noImage.png'

const brandImages: Record<string, string> = {
  arista: arista.src,
  bethyl: bethyl.src,
  abcore: abcore.src,
  empirical: empirical.src,
  nanocomposix: nanocomposix.src,
  vector: vector.src,
  ipoc: ipoc.src,
  fortis: fortis.src,
}

const RelatedProductsCarousel = (props: any) => {
  const { relatedProducts } = props
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const slidesPerView = () => {
    if (isDesktop) return 4
    if (isTablet) return 3
    if (isMobile) return 1
    return 4
  }

  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)
  const swiperRef = useRef<any>(null)

  const shouldShowArrows =
    (isDesktop && relatedProducts?.length > 4) ||
    (isTablet && relatedProducts?.length > 3) ||
    (isMobile && relatedProducts?.length > 1)
  const handleSwiperInit = (swiper: any) => {
    swiperRef.current = swiper
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }

  const handleSwiperSlideChange = (swiper: any) => {
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }

  if (relatedProducts?.length > 0)
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto 25px auto',
        }}
      >
        <Typography variant="h3" sx={{ marginBottom: '18px' }}>
          Related Products
        </Typography>
        <Box
          sx={{
            padding: '0 41px',
            position: 'relative',
          }}
        >
          <Swiper
            modules={[Navigation]}
            spaceBetween={26}
            slidesPerView={slidesPerView()}
            navigation={{
              prevEl: '.custom-prev', // Custom arrow classes
              nextEl: '.custom-next',
            }}
            onInit={handleSwiperInit}
            onSlideChange={handleSwiperSlideChange}
            style={{ width: 'auto' }}
          >
            {relatedProducts.map((data: any, index: number) => {
              const productName = data?.title
              const productCode = data?.productCode
              const brandImg = data?.brand?.value
              const brandName = data?.brand?.stringValue
              const categoryCode = data?.categoryCode
              const seoFriendlyUrl = data?.seoFriendlyUrl
              const imgUrl = productGetters.handleProtocolRelativeUrl(
                data?.productImages[0]?.imageUrl as string
              )
              const altText = 'product-image-alt'
              const productUrl =
                categoryCode !== undefined && seoFriendlyUrl
                  ? `/products/${categoryCode}/${seoFriendlyUrl}/${productCode}`
                  : `/product/${productCode}`

              return (
                <SwiperSlide key={index} style={{ width: '260px' }}>
                  <Link
                    href={productUrl}
                    passHref
                    data-testid="product-card-link"
                    style={{
                      display: isTablet || isMobile ? 'flex' : 'block',
                      justifyContent: isTablet || isMobile ? 'center' : 'start',
                    }}
                  >
                    <Box>
                      <Card
                        sx={{
                          ...ProductCardStyles.cardRoot,
                          minHeight: 321,
                          maxWidth: { xs: '260px', sm: '195px', md: '260px' },
                        }}
                        data-testid="product-card"
                      >
                        <CardMedia
                          className="product-image"
                          sx={{
                            ...ProductCardStyles.cardMedia,
                            height: 180,
                            zIndex: 1,
                            position: 'relative',
                          }}
                        >
                          <KiboImage
                            src={imgUrl || brandImages[brandImg?.toLowerCase()] || DefaultImage}
                            alt={altText}
                            fill
                            quality={100}
                            sizes="(max-width: 240px) 240px, 240px"
                            style={{ objectFit: 'contain' }}
                            data-testid="product-image"
                          />
                        </CardMedia>
                        <Box flexDirection="column">
                          <Typography
                            variant="body2"
                            gutterBottom
                            sx={{
                              ...ProductCardStyles.brandLabel,
                              fontSize: '14px',
                              color: 'grey.900',
                              lineHeight: 'normal',
                              margin: '9px 0',
                            }}
                          >
                            {brandName}
                          </Typography>
                          <Typography
                            variant="body2"
                            gutterBottom
                            fontWeight={500}
                            className="productNameStyle"
                            sx={{ ...ProductCardStyles.productNameStyle, color: '#2B2B2B' }}
                          >
                            {productName}
                          </Typography>
                        </Box>
                        <IconButton sx={ProductCardStyles.iconButton}>
                          <ArrowForwardIos sx={{ color: 'white' }} />
                        </IconButton>
                      </Card>
                    </Box>
                  </Link>
                </SwiperSlide>
              )
            })}
          </Swiper>
          {shouldShowArrows && (
            <>
              {/* Custom Navigation Arrows */}
              <IconButton
                className="custom-prev"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  pointerEvents: isBeginning ? 'none' : 'auto',
                  color: isBeginning ? 'grey.500' : 'grey.900',
                  padding: 0,
                }}
              >
                <ArrowBackIos />
              </IconButton>
              <IconButton
                className="custom-next"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 0,
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  pointerEvents: isEnd ? 'none' : 'auto',
                  color: isEnd ? 'grey.500' : 'grey.900',
                  padding: 0,
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
    )

  return null
}

export default RelatedProductsCarousel
