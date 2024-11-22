import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import ImageGallery from './ImageGallery'
import DefaultImage from '@/public/noImage.png'

// Mock data for stories
const digitalAssetsMock = [
  {
    properties: { cmsid: '1', assettype: 'ProductImage', sortorder: 1, imageUrl: '', altText: '' },
  },
  {
    properties: { cmsid: '2', assettype: 'ProductImage', sortorder: 2, imageUrl: '', altText: '' },
  },
]

const kiboImagesMock = [
  { cmsId: '1', imageUrl: 'https://via.placeholder.com/150', altText: 'Image 1' },
  { cmsId: '2', imageUrl: 'https://via.placeholder.com/200', altText: 'Image 2' },
]

export default {
  title: 'Core/ImageGallery',
  component: ImageGallery,
  args: {
    digitalAssets: digitalAssetsMock,
    kiboImages: kiboImagesMock,
    brandImage: 'https://via.placeholder.com/300',
    title: 'Sample Product',
    isZoomed: false,
    thumbnailDisplayCount: 3,
    placeholderImageUrl: DefaultImage,
  },
} as unknown as ComponentMeta<typeof ImageGallery>

const Template: ComponentStory<typeof ImageGallery> = (args) => <ImageGallery {...args} />

// Basic gallery
export const Gallery = Template.bind({})

// Customized thumbnail count
export const CustomMaximumThumbnailCount = Template.bind({})
CustomMaximumThumbnailCount.args = {
  thumbnailDisplayCount: 5,
}

// Single image in gallery
export const OneImage = Template.bind({})
OneImage.args = {
  digitalAssets: [
    {
      properties: {
        cmsid: '3',
        assettype: 'ProductImage',
        sortorder: 1,
        imageUrl: 'https://via.placeholder.com/400',
        altText: 'Single Image Example',
      },
    },
  ],
  kiboImages: [
    { cmsId: '3', imageUrl: 'https://via.placeholder.com/400', altText: 'Single Image Example' },
  ],
}

// Zoom mode enabled
export const Zoomed = Template.bind({})
Zoomed.args = {
  isZoomed: true,
}

// No images available
export const NoImage = Template.bind({})
NoImage.args = {
  digitalAssets: [],
  kiboImages: [],
}
