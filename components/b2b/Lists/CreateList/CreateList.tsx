import React, { FormEvent, useState } from 'react'

import { Button, Grid, Box, Typography, Stack } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { ListItem, ListProductSearch } from '@/components/b2b'
import { listFormStyles } from '@/components/b2b/Lists/listFormStyles'
import { KiboTextBox } from '@/components/common'
import { accountActionButton, accountTextButton } from '@/components/my-account/common'
import { useAuthContext, useSnackbarContext } from '@/context'
import { useCreateWishlist, useProductCardActions } from '@/hooks'
import { productGetters } from '@/lib/getters'

import { CrWishlistItem, Product } from '@/lib/gql/types'

export interface CreateListProps {
  onCreateFormToggle: (param: boolean) => void
  onAddListToCart: (items: any) => any
}

const buildDraftItem = (product: Product): CrWishlistItem => {
  const options = (product?.options ?? [])
    .map((option: any) => {
      const selected = option?.values?.find((value: any) => value?.isSelected)
      return {
        name: option?.attributeDetail?.name,
        value: selected?.value || selected?.stringValue || selected?.shopperEnteredValue,
        attributeFQN: option?.attributeFQN,
      }
    })
    .filter((option: any) => option?.value !== undefined && option?.value !== null)

  const productCode = productGetters.getProductId(product)
  const variationProductCode = productGetters.getVariationProductCode(product)

  return {
    id: `${productCode}-${variationProductCode || ''}`,
    quantity: 1,
    product: {
      productCode,
      variationProductCode,
      name: productGetters.getName(product),
      price: product?.price,
      options,
      isPackagedStandAlone: product?.isPackagedStandAlone || false,
    },
  } as CrWishlistItem
}

const toWishlistItemInput = (item: CrWishlistItem) => ({
  quantity: item.quantity,
  product: {
    productCode: item.product?.productCode,
    variationProductCode: item.product?.variationProductCode,
    options: item.product?.options,
    isPackagedStandAlone: item.product?.isPackagedStandAlone || false,
  },
})

const CreateList = (props: CreateListProps) => {
  const { onCreateFormToggle, onAddListToCart } = props

  const [listName, setListName] = useState('')
  const [draftItems, setDraftItems] = useState<CrWishlistItem[]>([])
  const { handleDeleteCurrentCart } = useProductCardActions()

  const { t } = useTranslation('common')
  const { user } = useAuthContext()
  const { createWishlist } = useCreateWishlist()
  const { showSnackbar } = useSnackbarContext()

  const handleAddListToCart = async () => {
    const response = await onAddListToCart(draftItems)
    if (response) {
      showSnackbar(t('list-added-to-cart'), 'success')
      onCreateFormToggle(false)
    }
  }

  const handleEmptyCartAndAddListToCart = async () => {
    await handleDeleteCurrentCart()
    await handleAddListToCart()
  }

  const handleAddProduct = (product: Product) => {
    const newItem = buildDraftItem(product)

    setDraftItems((current) => {
      const existingIndex = current.findIndex((item) => item.id === newItem.id)
      if (existingIndex === -1) return [...current, newItem]

      const updated = [...current]
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: (updated[existingIndex].quantity || 1) + 1,
      }
      return updated
    })
  }

  const handleDeleteItem = (id: string) => {
    setDraftItems((current) => current.filter((item) => item.id !== id))
  }

  const handleChangeQuantity = (id: string, quantity: number) => {
    setDraftItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = listName.trim()
    if (!trimmedName) return

    try {
      await createWishlist.mutateAsync({
        customerAccountId: user?.id,
        name: trimmedName,
        items: draftItems.map(toWishlistItemInput) as any,
      })
      onCreateFormToggle(false)
    } catch (e) {
      console.error(e)
      showSnackbar(t('something-went-wrong'), 'error')
    }
  }

  return (
    <>
      <Box sx={{ ...listFormStyles.card }}>
        <form onSubmit={handleSubmit} id="wishlist-form">
          <Box sx={{ maxWidth: '26rem' }}>
            <KiboTextBox
              placeholder={t('name-this-list')}
              name="listName"
              value={listName}
              onChange={(_, value) => setListName(value)}
              label={t('list-name')}
              sx={{ ...listFormStyles.textBox }}
            />
          </Box>
        </form>

        {listName.trim() && (
          <Box sx={{ maxWidth: '26rem', marginTop: '1.25rem' }}>
            <ListProductSearch onAddProduct={handleAddProduct} />
          </Box>
        )}

        {!listName.trim() && (
          <Typography sx={{ ...listFormStyles.hint }}>
            {t('add-list-name-to-search-products')}
          </Typography>
        )}
      </Box>

      <Box sx={{ ...listFormStyles.card }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ ...listFormStyles.itemsHeader }}
          gap={1}
        >
          <Typography component="h2" sx={{ ...listFormStyles.sectionTitle, marginBottom: 0 }}>
            {t('list-items')}
          </Typography>
          {draftItems.length > 0 && (
            <Stack direction="row" gap={1}>
              <Button
                variant="text"
                sx={{ ...listFormStyles.inlineLink }}
                onClick={handleEmptyCartAndAddListToCart}
              >
                {t('empty-cart-add-list-to-cart')}
              </Button>
              <Button
                variant="text"
                sx={{ ...listFormStyles.inlineLink }}
                onClick={handleAddListToCart}
              >
                {t('add-all-items-to-cart')}
              </Button>
            </Stack>
          )}
        </Stack>

        {Boolean(draftItems.length) && (
          <Grid container sx={{ ...listFormStyles.itemsHeaderRow }}>
            <Grid item xs={3} sm={2}>
              {t('qty')}
            </Grid>
            <Grid item xs={7} sm={8}>
              {t('product')}
            </Grid>
            <Grid item xs={2} sm={2} sx={{ textAlign: 'right' }}>
              {t('unit-price')}
            </Grid>
          </Grid>
        )}

        {!draftItems.length ? (
          <Typography sx={{ ...listFormStyles.hint }}>{t('no-item-in-list-text')}</Typography>
        ) : (
          draftItems.map((item: CrWishlistItem, index: any) => (
            <ListItem
              key={(item.id as string) + index}
              item={item}
              onDeleteItem={handleDeleteItem}
              onChangeQuantity={handleChangeQuantity}
            />
          ))
        )}
      </Box>

      <Stack direction="row" alignItems="center" gap={2}>
        <Button
          variant="contained"
          type="submit"
          form="wishlist-form"
          disableElevation
          sx={{ ...accountActionButton }}
          disabled={!listName.trim()}
        >
          {t('save-and-close')}
        </Button>
        <Button
          variant="text"
          type="button"
          sx={{ ...accountTextButton }}
          onClick={() => onCreateFormToggle(false)}
        >
          {t('cancel')}
        </Button>
      </Stack>
    </>
  )
}

export default CreateList
