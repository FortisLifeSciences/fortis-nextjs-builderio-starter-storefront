import { SyntheticEvent, useState } from 'react'

import { SvgIconComponent } from '@mui/icons-material'
import Image, { ImageProps } from 'next/image'

import DefaultImage1 from '@/public/noImage.png'
import DefaultImage from '@/public/product_placeholder.svg'

interface KiboImageProps extends ImageProps {
  errorimage?: ImageData | SvgIconComponent
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  mobileRatio?: boolean
  fallbackSrc?: ImageData
}

const errorImage = { image: DefaultImage }

const onImageError = (
  event: SyntheticEvent<HTMLImageElement, Event> & {
    target: HTMLImageElement
  }
) => {
  const { target } = event
  target.src = errorImage.image
}

const KiboImage = (props: KiboImageProps) => {
  errorImage.image = props.errorimage

  let mobileRatio
  if (props.mobileRatio) {
    mobileRatio = props.mobileRatio
  }

  const { src, ...rest } = props
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      {...props}
      alt={props.alt}
      src={imgSrc}
      onError={() => {
        setImgSrc(DefaultImage1)
      }}
      style={{
        objectFit: props.objectFit ?? 'contain',
        ...(props.alt === 'kibo-logo' && { position: 'relative' }),
        ...(mobileRatio && { width: 'inherit', height: 'inherit' }),
        ...(props.alt === 'cardType' && { width: '45px', height: '35px' }), // Apply only when mobile is true
      }}
      // Only add the "fill" property if the alt is NOT "kibo-logo"
      fill={props.alt !== 'kibo-logo' && props.alt !== 'cardType'}
    />
  )
}

export default KiboImage
