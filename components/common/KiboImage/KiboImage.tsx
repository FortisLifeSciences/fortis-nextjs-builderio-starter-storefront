import { useState } from 'react'

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

const KiboImage = (props: KiboImageProps) => {
  errorImage.image = props.errorimage

  let mobileRatio
  if (props.mobileRatio) {
    mobileRatio = props.mobileRatio
  }

  const { src } = props
  const [isErrorState, setIsErrorState] = useState(false)

  return (
    <Image
      {...props}
      alt={props.alt || 'Fortis Image'}
      src={isErrorState ? errorImage.image || DefaultImage1 : src}
      onError={() => setIsErrorState(true)}
      style={{
        objectFit: props.objectFit ?? 'contain',
        ...(props.alt === 'kibo-logo' && { position: 'relative' }),
        ...(mobileRatio && { width: 'inherit', height: 'inherit' }),
        ...(props.alt.includes('cardType') && mobileRatio && { width: '45px', height: '35px' }), // Apply only when mobile is true
      }}
      // Only add the "fill" property if the alt is NOT "kibo-logo" or cardType
      fill={props.alt !== 'kibo-logo' && !props.alt.includes('cardType')}
    />
  )
}

export default KiboImage
