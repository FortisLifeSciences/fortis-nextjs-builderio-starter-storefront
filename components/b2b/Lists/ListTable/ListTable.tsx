import React, { useState } from 'react'

import { AddShoppingCartOutlined, MoreVert, RemoveShoppingCartOutlined } from '@mui/icons-material'
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'next-i18next'

import { styles } from '@/components/b2b/Lists/ListTable/ListTable.style'
import { useGetB2BUsersEmailAndId } from '@/hooks'
import formatDate from '@/lib/helpers/formatDate'

import { CrWishlist, Maybe } from '@/lib/gql/types'

interface ListTableProps {
  rows: Array<CrWishlist>
  onDeleteList: (param: string) => void
  onCopyList: (param: string) => void
  onEditList: (param: string) => void
  onAddListToCart: (param: string) => void
  onEmptyCartAndAddListToCart: (param: string) => void
  isLoading: boolean
}

interface ListTableMobileOptions {
  onDeleteList: (param: string) => void
  onCopyList: (param: string) => void
  onEditList: (param: string) => void
  itemId: string
}

const ListTableMobileOptions = (props: ListTableMobileOptions) => {
  const { onDeleteList, onCopyList, onEditList, itemId } = props
  const [anchorEl, setAnchorEL] = useState<HTMLElement | null>(null)
  const { t } = useTranslation('common')
  const options = [
    { name: t('edit'), onClick: onEditList },
    { name: t('duplicate'), onClick: onCopyList },
    { name: t('delete'), onClick: onDeleteList },
  ]

  return (
    <>
      <IconButton
        sx={{ padding: '0px' }}
        onClick={(e) => {
          setAnchorEL(e.currentTarget)
        }}
        data-testid="menuBtn"
        id={itemId}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEL(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: '0.5rem',
            minWidth: '13rem',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
          },
        }}
        data-testid="menu"
      >
        {options.map((option, i) => (
          <MenuItem
            key={option.name}
            onClick={() => {
              option.onClick(itemId)
              setAnchorEL(null)
            }}
            sx={{
              fontSize: '0.875rem',
              padding: '0.625rem 1rem',
              ...(option.name === t('delete') ? { color: 'error.main' } : {}),
              ...(i !== options.length - 1 ? { borderBottom: `1px solid ${grey[200]}` } : {}),
            }}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

const ListTable = (props: ListTableProps) => {
  const {
    rows,
    onDeleteList,
    onCopyList,
    onEditList,
    onAddListToCart,
    onEmptyCartAndAddListToCart,
    isLoading,
  } = props

  const { t } = useTranslation('common')
  const theme = useTheme()
  const mdScreen = useMediaQuery(theme.breakpoints.up('md'))
  const userIdAndEmail = useGetB2BUsersEmailAndId()

  return (
    <TableContainer
      sx={{
        ...styles.tableContainer,
        opacity: isLoading ? '0.5' : '1',
        pointerEvents: isLoading ? 'none' : 'auto',
      }}
    >
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow sx={{ ...styles.headerRow }}>
            <TableCell sx={{ ...styles.headerCell, width: mdScreen ? '30%' : '45%' }}>
              {t('list-name')}
            </TableCell>
            <TableCell sx={{ ...styles.headerCell, width: mdScreen ? '18%' : '30%' }}>
              {t('date-created')}
            </TableCell>
            {mdScreen && (
              <TableCell sx={{ ...styles.headerCell, width: '32%' }}>{t('created-by')}</TableCell>
            )}
            <TableCell sx={{ ...styles.headerCell, width: mdScreen ? '20%' : '25%' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows?.map((item: Maybe<CrWishlist>) => {
            return (
              <TableRow key={item?.id} sx={{ ...styles.bodyRow }}>
                <TableCell sx={{ ...styles.tableCellStyles, width: mdScreen ? '30%' : '45%' }}>
                  {mdScreen ? (
                    item?.name
                  ) : (
                    <Box>
                      {item?.name}
                      <br />
                      <Typography sx={{ ...styles.mutedText, margin: '0.25rem 0' }}>
                        {userIdAndEmail[item?.auditInfo?.createBy as string]}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ ...styles.tableCellStyles, width: mdScreen ? '18%' : '30%' }}>
                  {formatDate(item?.auditInfo?.createDate)}
                </TableCell>
                {mdScreen && (
                  <TableCell sx={{ ...styles.tableCellStyles, width: '32%' }}>
                    {userIdAndEmail[item?.auditInfo?.createBy as string]}
                  </TableCell>
                )}
                <TableCell sx={{ ...styles.tableCellStyles, width: mdScreen ? '20%' : '25%' }}>
                  <Box
                    sx={{
                      justifyContent: 'flex-end',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Tooltip title={t('empty-cart-add-list-to-cart')}>
                      <IconButton
                        size="small"
                        sx={{ ...styles.rowActionIcon }}
                        onClick={() => onEmptyCartAndAddListToCart(item?.id as string)}
                        aria-label={String(t('empty-cart-add-list-to-cart'))}
                        data-testid="resetAndAddToCartBtn"
                      >
                        <RemoveShoppingCartOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('add-to-cart')}>
                      <IconButton
                        size="small"
                        sx={{ ...styles.rowActionIcon }}
                        onClick={() => onAddListToCart(item?.id as string)}
                        aria-label={String(t('add-to-cart'))}
                        data-testid="addToCartBtn"
                      >
                        <AddShoppingCartOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <ListTableMobileOptions
                      onDeleteList={onDeleteList}
                      onCopyList={onCopyList}
                      onEditList={onEditList}
                      itemId={item?.id as string}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ListTable
