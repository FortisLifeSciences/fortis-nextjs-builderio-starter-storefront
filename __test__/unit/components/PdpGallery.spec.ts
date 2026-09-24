import { mergeGalleryImages } from '@/components/page-templates/ProductDetail/PdpGallery'

describe('mergeGalleryImages', () => {
  const kiboImages = [
    { cmsId: 'asset-1', imageUrl: '//cdn/image-1.jpg', altText: 'first' },
    { cmsId: 'asset-2', imageUrl: '//cdn/image-2.jpg', altText: 'second' },
  ]

  const digitalAssets = [
    { properties: { cmsid: 'asset-2', assettype: 'ProductImage', sortorder: 2 } },
    { properties: { cmsid: 'asset-1', assettype: 'ProductImage', sortorder: 1 } },
    { properties: { cmsid: 'asset-3', assettype: 'Datasheet', sortorder: 3 } },
  ]

  it('should return an empty list when there are no digital assets', () => {
    expect(mergeGalleryImages([], kiboImages)).toEqual([])
    expect(mergeGalleryImages(undefined, kiboImages)).toEqual([])
  })

  it('should merge server supplied assets with kibo images ordered by sortorder', () => {
    const result = mergeGalleryImages(digitalAssets, kiboImages)

    expect(result).toHaveLength(2)
    expect(result[0].imageUrl).toBe('//cdn/image-1.jpg')
    expect(result[1].imageUrl).toBe('//cdn/image-2.jpg')
  })

  it('should exclude assets that are not product images', () => {
    const result = mergeGalleryImages(digitalAssets, kiboImages)

    expect(result.every((image: any) => image.assettype === 'ProductImage')).toBe(true)
  })

  it('should exclude assets without a matching kibo image', () => {
    const result = mergeGalleryImages(digitalAssets, [kiboImages[0]])

    expect(result).toHaveLength(1)
    expect(result[0].imageUrl).toBe('//cdn/image-1.jpg')
  })
})
