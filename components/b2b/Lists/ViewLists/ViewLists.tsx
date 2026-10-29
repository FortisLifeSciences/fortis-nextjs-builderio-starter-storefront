import React, { ChangeEvent, useEffect, useState } from 'react'

import { Search } from '@mui/icons-material'
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Input,
  InputAdornment,
  Pagination,
  Typography,
} from '@mui/material'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'

import { ListTable, EditList } from '@/components/b2b'
import { styles } from '@/components/b2b/Lists/ViewLists/ViewLists.style'
import { ConfirmationDialog } from '@/components/dialogs'
import { useAuthContext, useModalContext, useSnackbarContext } from '@/context'
import {
  PageProps,
  useCreateWishlist,
  useDebounce,
  useGetWishlist,
  useDeleteWishlist,
  useProductCardActions,
} from '@/hooks'

import { CrWishlist, CrWishlistItem, Maybe, WishlistCollection } from '@/lib/gql/types'

export interface ViewListsProps {
  onEditFormToggle: () => void
  isEditFormOpen: boolean
  onAddListToCart: (items: any) => any
}

const ViewLists = (props: ViewListsProps) => {
  const { onEditFormToggle, isEditFormOpen, onAddListToCart } = props
  const { publicRuntimeConfig } = getConfig()
  const { createWishlist } = useCreateWishlist()
  const { deleteWishlist } = useDeleteWishlist()
  const { showSnackbar } = useSnackbarContext()
  const { showModal } = useModalContext()
  const { handleDeleteCurrentCart } = useProductCardActions()

  // declaring states
  const [paginationState, setPaginationState] = useState<PageProps>({
    startIndex: publicRuntimeConfig.b2bList.startIndex,
    pageSize: publicRuntimeConfig.b2bList.pageSize,
    sortBy: publicRuntimeConfig.b2bList.sortBy,
    filter: publicRuntimeConfig.b2bList.filter,
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [listData, setListData] = useState<CrWishlist>()

  const { t } = useTranslation('common')
  const { user } = useAuthContext()

  // search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showOnlyMyLists, setShowOnlyMyLists] = useState<boolean>(false)

  const debouncedSearchTerm = useDebounce(searchTerm, publicRuntimeConfig.debounceTimeout)

  const wishlistFilter = [
    publicRuntimeConfig.b2bList.filter,
    showOnlyMyLists && user?.userId ? `createBy eq ${user?.userId}` : '',
    debouncedSearchTerm.trim() ? `name cont '${debouncedSearchTerm.trim().replace(/'/g, '')}'` : '',
  ]
    .filter(Boolean)
    .join(' and ')

  useEffect(() => {
    setPaginationState((currentState) => ({
      ...currentState,
      startIndex: publicRuntimeConfig.b2bList.startIndex,
      filter: wishlistFilter,
    }))
  }, [wishlistFilter, publicRuntimeConfig])

  // fetching wishlist data
  const response = useGetWishlist(paginationState)
  const wishlistsResponse = response.data as WishlistCollection
  const { isPending } = response

  // copy list function
  const createListName = (name: string) => {
    let listName = name + ' - copy'
    while (
      wishlistsResponse?.items &&
      wishlistsResponse?.items.find((item: Maybe<CrWishlist>) => item?.name == listName)
    ) {
      listName += ' - copy'
    }
    return listName
  }

  const handleCopyList = async (id: string) => {
    const newWishlist =
      wishlistsResponse.items &&
      wishlistsResponse?.items.find((item: Maybe<CrWishlist>) => item?.id === id)
    const newListName = createListName(newWishlist?.name as string)
    setIsLoading(true)
    try {
      await createWishlist.mutateAsync({
        customerAccountId: user?.id,
        name: newListName,
        items: newWishlist?.items,
      })
    } catch (e: any) {
      console.error(e)
    }
    setIsLoading(false)
  }

  // delete list function
  const handleDeleteList = (id: string) => {
    showModal({
      Component: ConfirmationDialog,
      props: {
        contentText: t('delete-list-message'),
        primaryButtonText: t('delete'),
        onConfirm: async () => {
          deleteWishlist.mutate(id)
        },
      },
    })
  }

  // edit list function
  const handleEditList = async (id: string) => {
    const wishlist = wishlistsResponse?.items?.find(
      (item: Maybe<CrWishlist>) => item?.id === id
    ) as CrWishlist
    setListData(wishlist)
    onEditFormToggle()
  }

  // add list to cart
  const handleAddListToCart = async (id: string) => {
    const list = wishlistsResponse?.items?.find((item) => item?.id === id)
    if (!list?.items?.length) {
      showSnackbar(t('list-is-empty-cannot-add-to-cart'), 'error')
      return
    }
    setIsLoading(true)
    try {
      const response = await onAddListToCart(list?.items as Array<CrWishlistItem>)
      if (response) showSnackbar(t('list-added-to-cart'), 'success')
    } catch (e) {
      console.error(e)
      showSnackbar(t('something-went-wrong'), 'error')
    }

    setIsLoading(false)
  }
  const handleEmptyCartAndAddListToCart = (id: string) => {
    handleDeleteCurrentCart()
    handleAddListToCart(id)
  }

  // handle filter for current user list
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setShowOnlyMyLists(e.currentTarget.checked)
  }

  // handle search by list name
  const handleSearch = (searchText: string) => {
    setSearchTerm(searchText)
  }

  // on changing page number
  const handlePageChange = (e: ChangeEvent<unknown>, page: number) => {
    const newStartIndex = paginationState.pageSize * (page - 1)
    setPaginationState((currentState) => ({ ...currentState, startIndex: newStartIndex }))
  }

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isEditFormOpen) {
    return (
      <EditList
        onEditFormToggle={onEditFormToggle}
        listData={listData}
        onUpdateListData={(res: CrWishlist) => {
          setListData(res)
        }}
        onHandleAddListToCart={handleAddListToCart}
      />
    )
  }

  return (
    <>
      <Box sx={{ padding: 0 }}>
        <FormControlLabel
          label={t('show-only-my-lists')}
          sx={{
            marginBottom: '1rem',
            '& .MuiFormControlLabel-label': { fontSize: '0.9375rem' },
          }}
          control={<Checkbox size="small" onChange={handleFilterChange} />}
          data-testid="currentUserFilterCheckbox"
        />
        <FormControl
          sx={{
            width: '100%',
            borderBottom: 'none',
          }}
        >
          <Input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('search-by-name')}
            sx={styles.customInput}
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
            data-testid="search-list-input"
          />
        </FormControl>
        {wishlistsResponse?.items?.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', padding: '2rem 0' }}>
            {t('no-list-found')}
          </Typography>
        ) : (
          <>
            <ListTable
              rows={wishlistsResponse.items as Array<CrWishlist>}
              isLoading={isPending || isLoading}
              onCopyList={handleCopyList}
              onDeleteList={handleDeleteList}
              onEditList={handleEditList}
              onAddListToCart={handleAddListToCart}
              onEmptyCartAndAddListToCart={handleEmptyCartAndAddListToCart}
            />
            <Pagination
              count={wishlistsResponse ? wishlistsResponse.pageCount : 1}
              shape={`rounded`}
              size="small"
              sx={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}
              onChange={handlePageChange}
              data-testid="pagination"
            />
          </>
        )}
      </Box>
    </>
  )
}

export default ViewLists
