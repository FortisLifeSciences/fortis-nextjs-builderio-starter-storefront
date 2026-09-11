import { useState } from 'react'

import EditIcon from '@mui/icons-material/Edit'
import { Box, Grid, Button, IconButton, Typography, Stack } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { Maybe } from 'yup/lib/types'

import { ListItem, ListProductSearch } from '@/components/b2b'
import { listFormStyles } from '@/components/b2b/Lists/listFormStyles'
import { KiboTextBox } from '@/components/common'
import { accountActionButton, accountTextButton } from '@/components/my-account/common'
import { useProductCardActions, useUpdateWishlistItemMutation } from '@/hooks'

import { CrWishlist, CrWishlistInput, CrWishlistItem, Product } from '@/lib/gql/types'

export interface EditListProps {
  onEditFormToggle: () => void
  listData: CrWishlist | undefined
  onUpdateListData: (param: CrWishlist) => void
  onHandleAddListToCart: (param: string) => void
}

interface EditListState {
  productCode: Maybe<string>
  quantity: Maybe<string>
  showSuggestions: boolean
  name: Maybe<string>
  openNameForm: boolean
}

const EditList = (props: EditListProps) => {
  const { onEditFormToggle, listData, onUpdateListData, onHandleAddListToCart } = props

  const [editListState, setEditListState] = useState<EditListState>({
    productCode: '',
    quantity: '1',
    showSuggestions: false,
    name: listData?.name,
    openNameForm: false,
  })
  const { t } = useTranslation('common')
  const { updateWishlist } = useUpdateWishlistItemMutation()
  const { handleAddToList, handleDeleteCurrentCart } = useProductCardActions()

  const handleAddListToCart = async (id: string) => {
    await handleSaveWishlist()
    onHandleAddListToCart(id)
  }

  const handleEmptyCartAndAddListToCart = async (id: string) => {
    handleDeleteCurrentCart()
    handleAddListToCart(id)
  }

  const handleSaveWishlist = async () => {
    if (listData) listData.name = editListState.name
    const payload = {
      wishlistId: listData?.id as string,
      wishlistInput: listData as CrWishlistInput,
    }
    try {
      const response = await updateWishlist.mutateAsync(payload)
      onUpdateListData(response.updateWishlist)
      onEditFormToggle()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      let items = listData?.items
      items = items?.filter((item: Maybe<CrWishlistItem>) => item?.id !== id)
      if (listData) listData.items = items
      const payload = {
        wishlistId: listData?.id as string,
        wishlistInput: listData as CrWishlistInput,
      }
      const response = await updateWishlist.mutateAsync(payload)
      onUpdateListData(response.updateWishlist)
    } catch (e) {
      console.error(e)
    }
  }

  const handleChangeQuantity = async (id: string, quantity: number) => {
    const items = listData?.items
    const currentItem = items?.find((item: Maybe<CrWishlistItem>) => item?.id === id)
    if (currentItem) currentItem.quantity = quantity
    if (listData) listData.items = items
    const payload = {
      wishlistId: listData?.id as string,
      wishlistInput: listData as CrWishlistInput,
    }
    const response = await updateWishlist.mutateAsync(payload)
    onUpdateListData(response.updateWishlist)
  }

  const handleAddProduct = async (product?: Product) => {
    handleAddToList({
      listData,
      product: product as Product,
      onUpdateListData,
    })
  }

  return (
    <>
      <Box sx={{ ...listFormStyles.card }}>
        {editListState.openNameForm ? (
          <Stack direction="row" alignItems="flex-end" gap={2} sx={{ maxWidth: '32rem' }}>
            <Box sx={{ flexGrow: 1 }}>
              <KiboTextBox
                label={t('list-name')}
                onChange={(e, value) => setEditListState({ ...editListState, name: value })}
                value={editListState.name as string}
                sx={{ ...listFormStyles.textBox }}
              />
            </Box>
            <Button
              variant="contained"
              disableElevation
              sx={{ ...accountActionButton }}
              onClick={() => setEditListState({ ...editListState, openNameForm: false })}
              data-testid="saveNameBtn"
            >
              {t('save')}
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography component="p" sx={{ ...listFormStyles.listName }}>
              {editListState.name}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setEditListState({ ...editListState, openNameForm: true })}
              data-testid="editNameBtn"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}

        <Box sx={{ maxWidth: '26rem', marginTop: '1.25rem' }}>
          <ListProductSearch onAddProduct={handleAddProduct} />
        </Box>
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
          {listData?.items && listData?.items?.length > 0 && (
            <Stack direction="row" gap={1}>
              <Button
                variant="text"
                sx={{ ...listFormStyles.inlineLink }}
                onClick={() => handleEmptyCartAndAddListToCart(listData?.id as string)}
              >
                {t('empty-cart-add-list-to-cart')}
              </Button>
              <Button
                variant="text"
                sx={{ ...listFormStyles.inlineLink }}
                onClick={() => handleAddListToCart(listData?.id as string)}
              >
                {t('add-all-items-to-cart')}
              </Button>
            </Stack>
          )}
        </Stack>

        {Boolean(listData?.items?.length) && (
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

        {!listData?.items?.length ? (
          <Typography sx={{ ...listFormStyles.hint }}>{t('no-item-in-list-text')}</Typography>
        ) : (
          listData?.items?.map((item: Maybe<CrWishlistItem>, index) => (
            <ListItem
              key={(item?.product?.productCode as string) + index}
              item={item as CrWishlistItem}
              onDeleteItem={handleDeleteItem}
              onChangeQuantity={handleChangeQuantity}
              listId={listData.id as string}
            />
          ))
        )}
      </Box>

      <Stack direction="row" alignItems="center" gap={2}>
        <Button
          variant="contained"
          disableElevation
          sx={{ ...accountActionButton }}
          onClick={handleSaveWishlist}
        >
          {t('save-and-close')}
        </Button>
        <Button variant="text" sx={{ ...accountTextButton }} onClick={() => onEditFormToggle()}>
          {t('cancel')}
        </Button>
      </Stack>
    </>
  )
}
export default EditList
