import React, { FormEvent, useEffect, useState } from 'react'

import { Button, Grid, Box, Typography, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { ListItem, ListProductSearch } from '@/components/b2b'
import { listFormStyles } from '@/components/b2b/Lists/listFormStyles'
import { KiboTextBox } from '@/components/common'
import { accountActionButton, accountTextButton } from '@/components/my-account/common'
import { useAuthContext, useSnackbarContext } from '@/context'
import {
  useAddToWishlistItem,
  useCreateWishlist,
  useDeleteWishlistItemById,
  useProductCardActions,
  useUpdateWishlistItemMutation,
  useGetCustomerWishlist,
} from '@/hooks'
import { productGetters } from '@/lib/getters'

import { CrWishlistItem, Product } from '@/lib/gql/types'

export interface CreateListProps {
  onCreateFormToggle: (param: boolean) => void
  onAddListToCart: (items: any) => any
}

const CreateList = (props: CreateListProps) => {
  const { onCreateFormToggle, onAddListToCart } = props

  const [newListState, setNewListState] = useState<any>({})
  const [listName, setListName] = useState('')
  const { handleDeleteCurrentCart } = useProductCardActions()

  const router = useRouter()
  const { t } = useTranslation('common')
  const { user } = useAuthContext()
  const { createWishlist } = useCreateWishlist()
  const { updateWishlist, updateWishlistItemQuantity } = useUpdateWishlistItemMutation({
    isCreateList: true,
  })
  const { addToWishlist } = useAddToWishlistItem()
  const { showSnackbar } = useSnackbarContext()
  const { deleteWishlistItemById } = useDeleteWishlistItemById({ isCreateList: true })
  const response = useGetCustomerWishlist({
    customerAccountId: user?.id as number,
    wishlistName: newListState?.name,
  })

  const handleAddListToCart = async () => {
    const response = await onAddListToCart(newListState?.items)
    if (response) {
      showSnackbar(t('list-added-to-cart'), 'success')
      onCreateFormToggle(false)
    }
  }

  const onUpdateListData = async (product: any, payload: any) => {
    await addToWishlist.mutateAsync({
      customerAccountId: user?.id as number,
      product: {
        options: product?.options?.map((option: any) => {
          const selected = option?.values?.find((value: any) => value?.isSelected)
          return {
            name: option?.attributeDetail?.name,
            value: selected?.value || selected?.stringValue || selected?.shopperEnteredValue,
            attributeFQN: option?.attributeFQN,
          }
        }),
        productCode: productGetters.getProductId(product),
        variationProductCode: productGetters.getVariationProductCode(product),
        isPackagedStandAlone: product?.isPackagedStandAlone,
      },
      currentWishlist: newListState,
      quantity: payload.quantity,
    })
  }
  const handleEmptyCartAndAddListToCart = () => {
    handleDeleteCurrentCart()
    handleAddListToCart()
  }
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    onCreateFormToggle(false)
  }

  const handleAddProduct = async (product?: any) => {
    await addToWishlist.mutateAsync({
      product,
      customerAccountId: user?.id as number,
      currentWishlist: newListState,
    })
  }

  const handleCreateListAndUpdateWishlistName = async () => {
    setListName(listName || newListState?.name)
    if (!newListState?.name && listName) {
      try {
        const listData = await createWishlist.mutateAsync({
          customerAccountId: user?.id,
          name: listName,
        })
        if (listData) {
          setNewListState(listData)
        }
      } catch (e) {
        console.error(e)
      }
    } else if (listName) {
      try {
        const listData = await updateWishlist.mutateAsync({
          wishlistId: newListState?.id,
          wishlistInput: { name: listName },
        })
        if (listData) {
          setNewListState(listData?.updateWishlist)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleDeleteItem = async (id: string) => {
    await deleteWishlistItemById.mutateAsync({
      wishlistId: newListState?.id,
      wishlistItemId: id,
    })
  }

  const handleChangeQuantity = async (id: string, quantity: number) => {
    await updateWishlistItemQuantity.mutateAsync({
      quantity,
      wishlistId: newListState?.id,
      wishlistItemId: id,
    })
  }

  useEffect(() => {
    setNewListState(response?.data)
  }, [JSON.stringify(response?.data)])

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
              onBlur={handleCreateListAndUpdateWishlistName}
              label={t('list-name')}
              sx={{ ...listFormStyles.textBox }}
            />
          </Box>
        </form>

        {listName && (
          <Box sx={{ maxWidth: '26rem', marginTop: '1.25rem' }}>
            <ListProductSearch onAddProduct={handleAddProduct} />
          </Box>
        )}

        {!newListState?.name && (
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
          {newListState?.items?.length > 0 && (
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

        {Boolean(newListState?.items?.length) && (
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

        {!newListState?.items?.length ? (
          <Typography sx={{ ...listFormStyles.hint }}>{t('no-item-in-list-text')}</Typography>
        ) : (
          newListState?.items?.map((item: CrWishlistItem, index: any) => (
            <ListItem
              key={(item.product?.productCode as string) + index}
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
          disabled={!newListState?.name}
        >
          {t('save-and-close')}
        </Button>
        <Button
          variant="text"
          type="button"
          sx={{ ...accountTextButton }}
          onClick={() => {
            onCreateFormToggle(false)
          }}
        >
          {t('cancel')}
        </Button>
      </Stack>
    </>
  )
}

export default CreateList
