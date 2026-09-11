import { useEffect, useState } from 'react'

import styles from './Pdp.module.css'
import { productGetters } from '@/lib/getters'

import type { ProductImage } from '@/lib/gql/types'

export interface PdpImage {
  imageUrl?: string | null
  altText?: string | null
  title?: string | null
  description?: string | null
}

export const mergeGalleryImages = (
  digitalAssets: any,
  kiboImages?: ProductImage[] | null
): PdpImage[] => {
  const assets = (digitalAssets ?? [])
    .filter((asset: any) => asset?.properties?.assettype === 'ProductImage')
    .map((asset: any) => asset.properties)
    .sort((a: any, b: any) => a.sortorder - b.sortorder)

  const map = new Map((kiboImages ?? []).map((image) => [image?.cmsId, image]))

  return assets
    .filter((asset: any) => map.has(asset.cmsid))
    .map((asset: any) => {
      const match = map.get(asset.cmsid)
      return {
        ...asset,
        ...(match ? { imageUrl: match.imageUrl, altText: match.altText } : {}),
      }
    })
    .sort((a: any, b: any) => a.sortorder - b.sortorder)
}

const ArrowIcon = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d={flip ? 'M10 3.5 5.5 8 10 12.5' : 'M6 3.5 10.5 8 6 12.5'} />
  </svg>
)

interface PdpLightboxProps {
  images: PdpImage[]
  index: number
  title?: string | null
  onClose: () => void
  onIndexChange: (index: number) => void
}

const PdpLightbox = ({ images, index, title, onClose, onIndexChange }: PdpLightboxProps) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onIndexChange((index - 1 + images.length) % images.length)
      if (event.key === 'ArrowRight') onIndexChange((index + 1) % images.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, images.length, onClose, onIndexChange])

  const current = images[index]

  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Product images">
      <button
        type="button"
        className={styles.lightboxBackdrop}
        onClick={onClose}
        aria-label="Close image viewer"
      />
      <div className={styles.lightboxDialog}>
        <button type="button" className={styles.lightboxClose} onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className={styles.lightboxStage}>
          {images.length > 1 ? (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
              aria-label="Previous image"
            >
              <ArrowIcon flip />
            </button>
          ) : null}
          <img
            src={productGetters.handleProtocolRelativeUrl(current?.imageUrl as string)}
            alt={current?.altText ?? ''}
          />
          {images.length > 1 ? (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxNext}`}
              onClick={() => onIndexChange((index + 1) % images.length)}
              aria-label="Next image"
            >
              <ArrowIcon />
            </button>
          ) : null}
        </div>
        <div className={styles.lightboxSide}>
          <div className={styles.lightboxCount}>
            Image {index + 1} of {images.length}
          </div>
          <div className={styles.lightboxTitle}>{current?.title || title}</div>
          {current?.description ? (
            <div
              className={styles.lightboxDescription}
              dangerouslySetInnerHTML={{ __html: current.description }}
            />
          ) : null}
          {images.length > 1 ? (
            <div className={styles.lightboxStrip}>
              {images.map((image, i) => (
                <button
                  type="button"
                  key={image?.imageUrl ?? i}
                  className={`${styles.lightboxThumb} ${
                    i === index ? styles.lightboxThumbActive : ''
                  }`}
                  onClick={() => onIndexChange(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    src={productGetters.handleProtocolRelativeUrl(image?.imageUrl as string)}
                    alt={image?.altText ?? ''}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

interface PdpGalleryProps {
  digitalAssets?: any
  kiboImages?: ProductImage[] | null
  brandImage?: string | null
  title?: string | null
}

const PdpGallery = ({ digitalAssets, kiboImages, brandImage, title }: PdpGalleryProps) => {
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const images = mergeGalleryImages(digitalAssets, kiboImages)
  const hasImages = images.length > 0
  const current = images[index]

  const mainSrc = hasImages
    ? productGetters.handleProtocolRelativeUrl(current?.imageUrl as string)
    : brandImage || '/noImage.png'

  return (
    <>
      <div className={styles.mediaMain}>
        <img src={mainSrc} alt={hasImages ? current?.altText ?? '' : ''} />
        {hasImages && current?.description ? (
          <button
            type="button"
            className={styles.mediaInfoDot}
            onClick={() => setLightboxOpen(true)}
            aria-label="View image details"
          >
            i
          </button>
        ) : null}
        {hasImages ? (
          <button
            type="button"
            className={styles.zoom}
            onClick={() => setLightboxOpen(true)}
            aria-label="Zoom image"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className={styles.thumbRow}>
          {images.map((image, i) => (
            <button
              type="button"
              key={image?.imageUrl ?? i}
              className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={productGetters.handleProtocolRelativeUrl(image?.imageUrl as string)}
                alt={image?.altText ?? ''}
              />
            </button>
          ))}
        </div>
      ) : null}

      {hasImages ? (
        <div className={styles.galleryMeta}>
          <span>
            Image {index + 1} of {images.length}
          </span>
          <button type="button" className="detail" onClick={() => setLightboxOpen(true)}>
            <span className="dot">i</span>
            <span>View details</span>
          </button>
        </div>
      ) : null}

      {lightboxOpen && hasImages ? (
        <PdpLightbox
          images={images}
          index={index}
          title={title}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setIndex}
        />
      ) : null}
    </>
  )
}

export default PdpGallery
