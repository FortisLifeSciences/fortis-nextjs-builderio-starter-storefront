// SearchResultsDisplay.tsx
import React, { useEffect, useState, useRef } from 'react'

import 'swiper/css'
import 'swiper/css/navigation'

import { ArrowBackIos } from '@mui/icons-material'
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos'
import { IconButton, useMediaQuery, useTheme } from '@mui/material'
import Image from 'next/image'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import styles from './ResourceSearchSliders.module.css' // Import the CSS module
import resourceTypeArr from '@/components/common/ResourceTypeArr'
import DefaultImage from '@/public/noImage.png'

import type { StaticImageData } from 'next/image'

type BuilderPageHit = {
  objectID: string
  data?: {
    title?: string
    image?: string
    description?: string
    contentType?: string
    resourceType?: string
    resourceCategory?: string
  }
  meta?: {
    lastPreviewUrl?: string
  }
}

interface Props {
  nonResourceHits: BuilderPageHit[]
  resourceHits: BuilderPageHit[]
  query: string
  index: number
}

const ResourceSearchSliders: React.FC<Props> = ({
  nonResourceHits,
  resourceHits,
  query,
  index,
}) => {
  // State and Refs for the Resource Swiper
  const resourceSwiperRef = useRef<any>(null)
  const [resourceBeginningState, setResourceBeginningState] = useState<boolean>(true)
  const [resourceEndState, setResourceEndState] = useState<boolean>(false)

  // State and Refs for the Non-Resource Swiper
  const nonResourceSwiperRef = useRef<any>(null)
  const [nonResourceBeginningState, setNonResourceBeginningState] = useState<boolean>(true)
  const [nonResourceEndState, setNonResourceEndState] = useState<boolean>(false)

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

  const handleResourceSwiperInit = (swiper: any) => {
    resourceSwiperRef.current = swiper
    setResourceBeginningState(swiper.isBeginning)
    setResourceEndState(swiper.isEnd)
  }

  const handleResourceSwiperSlideChange = (swiper: any) => {
    setResourceBeginningState(swiper.isBeginning)
    setResourceEndState(swiper.isEnd)
  }

  const handleNonResourceSwiperInit = (swiper: any) => {
    nonResourceSwiperRef.current = swiper
    setNonResourceBeginningState(swiper.isBeginning)
    setNonResourceEndState(swiper.isEnd)
  }

  const handleNonResourceSwiperSlideChange = (swiper: any) => {
    setNonResourceBeginningState(swiper.isBeginning)
    setNonResourceEndState(swiper.isEnd)
  }

  return (
    <div key={index} className={styles.container}>
      {nonResourceHits.length > 0 && (
        <div className={styles.nonResourceSection}>
          <h1 className={styles.sectionTitle}>{`Recommended Pages for "${query}"`}</h1>
          <div className={styles.swiperContainer}>
            <Swiper
              modules={[Navigation]}
              spaceBetween={26}
              slidesPerView={slidesPerView()}
              navigation={{
                prevEl: `.custom-prev-non-resource-${index}`,
                nextEl: `.custom-next-non-resource-${index}`,
              }}
              onInit={handleNonResourceSwiperInit}
              onSlideChange={handleNonResourceSwiperSlideChange}
              className={styles.swiperWrapper}
              ref={nonResourceSwiperRef}
            >
              {nonResourceHits.map((hit: any, i: number) => (
                <SwiperSlide key={`non-res-${index}-${i}`} className={styles.swiperSlide}>
                  <a
                    href={hit.meta?.lastPreviewUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    <span className={styles.imageContainer}>
                      <Image
                        src={hit.data?.image || (DefaultImage as StaticImageData).src}
                        alt={hit.data?.title || 'Learning resource'}
                        width={(DefaultImage as StaticImageData).width}
                        height={(DefaultImage as StaticImageData).height}
                        className={styles.image}
                      />
                    </span>
                    <p className={styles.resourceTitle}>
                      {hit.data?.title?.split?.(' | ')[0] || 'No title'}
                    </p>
                    <IconButton size="small" className={styles.viewButton}>
                      <ArrowForwardIos fontSize="small" />
                    </IconButton>
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
            {nonResourceBeginningState !== undefined && (
              <>
                <IconButton
                  className={`custom-prev-non-resource-${index} ${styles.swiperButton} ${
                    styles.swiperButtonPrev
                  } ${
                    nonResourceBeginningState
                      ? styles.swiperButtonDisabled
                      : styles.swiperButtonEnabled
                  }`}
                  aria-label="Previous slide"
                  onClick={() => nonResourceSwiperRef.current?.slidePrev()}
                >
                  <ArrowBackIos />
                </IconButton>
                <IconButton
                  className={`custom-next-non-resource-${index} ${styles.swiperButton} ${
                    styles.swiperButtonNext
                  } ${
                    nonResourceEndState ? styles.swiperButtonDisabled : styles.swiperButtonEnabled
                  }`}
                  aria-label="Next slide"
                  onClick={() => nonResourceSwiperRef.current?.slideNext()}
                >
                  <ArrowForwardIos />
                </IconButton>
              </>
            )}
          </div>
        </div>
      )}

      {resourceHits.length > 0 && (
        <div className={styles.resourceSection}>
          <h1 className={styles.sectionTitle}>{`"${query}"  in the Learning Center`}</h1>
          <div className={styles.swiperContainer}>
            <Swiper
              modules={[Navigation]}
              spaceBetween={26}
              slidesPerView={slidesPerView()}
              navigation={{
                prevEl: `.custom-prev-resource-${index}`,
                nextEl: `.custom-next-resource-${index}`,
              }}
              onInit={handleResourceSwiperInit}
              onSlideChange={handleResourceSwiperSlideChange}
              className={`${styles.swiperWrapper} ${styles.resourceSwiperWrapper}`}
              ref={resourceSwiperRef}
            >
              {resourceHits.map((hit: any, i: number) => (
                <SwiperSlide key={`res-${index}-${i}`} className={styles.swiperSlide}>
                  <a
                    href={hit.meta?.lastPreviewUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    <span className={styles.imageContainer}>
                      <Image
                        src={hit.data?.image || (DefaultImage as StaticImageData).src}
                        alt={hit.data?.title || 'Learning resource'}
                        width={(DefaultImage as StaticImageData).width}
                        height={(DefaultImage as StaticImageData).height}
                        className={styles.image}
                      />
                    </span>

                    {resourceTypeArr.map((data) => {
                      const hitResourceType = hit.data?.resourceType
                      const isResourceTypeInArray = resourceTypeArr.some(
                        (item) => item.resourceType === hitResourceType
                      )

                      const shouldDisplay =
                        hitResourceType && isResourceTypeInArray
                          ? data.resourceType === hitResourceType
                          : data.resourceType === 'Whitepaper'

                      const displayValue = shouldDisplay
                        ? hitResourceType && data.resourceType === hitResourceType
                          ? data.value
                          : data.resourceType === 'Whitepaper'
                          ? data.value
                          : ''
                        : ''

                      return shouldDisplay ? (
                        <span
                          className={`material-symbols-outlined ${styles.resourceTypeIcon}`}
                          key={data.resourceType}
                        >
                          {displayValue}
                        </span>
                      ) : null
                    })}

                    <p className={styles.resourceCategory}>{hit.data?.resourceCategory}</p>
                    <p className={styles.resourceTitle}>
                      {hit.data?.resourceType}: {hit.data?.title?.split?.(' | ')[0] || 'No title'}
                    </p>
                    <IconButton size="small" className={styles.viewButton}>
                      <ArrowForwardIos fontSize="small" />
                    </IconButton>
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
            {resourceBeginningState !== undefined && (
              <>
                <IconButton
                  className={`custom-prev-resource-${index} ${styles.swiperButton} ${
                    styles.swiperButtonPrev
                  } ${
                    resourceBeginningState
                      ? styles.swiperButtonDisabled
                      : styles.swiperButtonEnabled
                  }`}
                  aria-label="Previous slide"
                  onClick={() => resourceSwiperRef.current?.slidePrev()}
                >
                  <ArrowBackIos />
                </IconButton>
                <IconButton
                  className={`custom-next-resource-${index} ${styles.swiperButton} ${
                    styles.swiperButtonNext
                  } ${resourceEndState ? styles.swiperButtonDisabled : styles.swiperButtonEnabled}`}
                  aria-label="Next slide"
                  onClick={() => resourceSwiperRef.current?.slideNext()}
                >
                  <ArrowForwardIos />
                </IconButton>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourceSearchSliders
