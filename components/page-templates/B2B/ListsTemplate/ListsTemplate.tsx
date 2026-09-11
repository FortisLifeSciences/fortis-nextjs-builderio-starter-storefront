import { useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { CreateList, ViewLists } from '@/components/b2b'
import { AccountPageHeader, accountActionButton } from '@/components/my-account/common'
import { useAddItemsToCurrentCart } from '@/hooks/mutations/cart/useAddItemsToCurrentCart/useAddItemsToCurrentCart'

import { CrWishlistItem } from '@/lib/gql/types'

const ListsTemplate = () => {
  const [state, setState] = useState({
    isCreateFormOpen: false,
    isEditFormOpen: false,
  })

  const { t } = useTranslation('common')
  const { addItemsToCurrentCart } = useAddItemsToCurrentCart()

  const handleEditFormToggle = () =>
    setState((prevState) => ({ ...prevState, isEditFormOpen: !state.isEditFormOpen }))

  const handleCreateFormToggle = () =>
    setState((prevState) => ({ ...prevState, isCreateFormOpen: !state.isCreateFormOpen }))

  const handleAddListToCart = async (items: CrWishlistItem[]) => {
    try {
      const response = await addItemsToCurrentCart.mutateAsync({
        items,
      })
      return response
    } catch (e) {
      console.error(e)
    }
  }

  const showCreateButton = !(state.isEditFormOpen || state.isCreateFormOpen)

  if (state.isCreateFormOpen)
    return (
      <>
        <AccountPageHeader title={String(t('create-new-list'))} />
        <CreateList
          onCreateFormToggle={(val: boolean) => setState({ ...state, isCreateFormOpen: val })}
          onAddListToCart={handleAddListToCart}
        />
      </>
    )

  return (
    <>
      <AccountPageHeader
        title={String(state.isEditFormOpen ? t('edit-list') : t('lists'))}
        action={
          showCreateButton && (
            <Button
              variant="contained"
              color="primary"
              disableElevation
              startIcon={<AddIcon />}
              sx={{ ...accountActionButton }}
              onClick={handleCreateFormToggle}
              data-testid="create-new-list-btn"
            >
              {t('create-new-list')}
            </Button>
          )
        }
      />

      <Box>
        <ViewLists
          onEditFormToggle={handleEditFormToggle}
          isEditFormOpen={state.isEditFormOpen}
          onAddListToCart={handleAddListToCart}
        />
      </Box>
    </>
  )
}

export default ListsTemplate
