import React, { useState } from 'react'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Divider, IconButton, Menu, MenuItem } from '@mui/material'

export interface AccountItemMenuAction {
  id: string
  label: string
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}

interface AccountItemMenuProps {
  actions: AccountItemMenuAction[]
  ariaLabel: string
}

const styles = {
  menuPaper: {
    borderRadius: '0.5rem',
    minWidth: '10rem',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  },
  menuItem: {
    typography: 'body2',
    padding: '0.625rem 1rem',
  },
  destructive: {
    color: 'error.main',
  },
}

const AccountItemMenu = (props: AccountItemMenuProps) => {
  const { actions, ariaLabel } = props
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const isOpen = Boolean(anchorEl)

  const handleClose = () => setAnchorEl(null)

  const handleSelect = (action: AccountItemMenuAction) => {
    handleClose()
    action.onClick()
  }

  const enabledActions = actions.filter((action) => !action.disabled)

  if (!enabledActions.length) return null

  return (
    <>
      <IconButton
        aria-label={ariaLabel}
        aria-haspopup="true"
        aria-expanded={isOpen ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { ...styles.menuPaper } }}
      >
        {enabledActions.map((action, index) => [
          action.destructive && index > 0 ? <Divider key={`${action.id}-divider`} /> : null,
          <MenuItem
            key={action.id}
            onClick={() => handleSelect(action)}
            sx={{
              ...styles.menuItem,
              ...(action.destructive ? styles.destructive : {}),
            }}
          >
            {action.label}
          </MenuItem>,
        ])}
      </Menu>
    </>
  )
}

export default AccountItemMenu
