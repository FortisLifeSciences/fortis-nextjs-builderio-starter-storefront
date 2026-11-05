import type { WishlistProductInput } from '@/lib/types'

import type { MutationCreateWishlistItemArgs } from '@/lib/gql/types'

export const buildAddToWishlistItemParams = (
  product: WishlistProductInput,
  wishlistId: string,
  quantity?: number
): MutationCreateWishlistItemArgs => {
  return {
    wishlistId: wishlistId,
    wishlistItemInput: {
      quantity: quantity ? quantity : 1,
      product: {
        options: product?.options
          ?.map((option: any) => {
            const selected = option?.values?.find((value: any) => value?.isSelected)

            return {
              name: option?.attributeDetail?.name ?? option?.name,
              value:
                option?.value ??
                selected?.value ??
                selected?.stringValue ??
                selected?.shopperEnteredValue,
              attributeFQN: option?.attributeFQN,
            }
          })
          .filter((option: any) => option?.value !== undefined && option?.value !== null),
        productCode: product?.productCode,
        variationProductCode: product?.variationProductCode,
        isPackagedStandAlone: product?.isPackagedStandAlone || false,
      },
    },
  }
}
