import React from 'react'

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { MyAccountLayoutStyles } from './MyAccountLayout.styles'
import { getMyAccountNavGroups } from './myAccountNav'
import LogoutIcon from '@/assets/icons/myAccountLogout.svg'
import { useAuthContext } from '@/context'
import { userGetters } from '@/lib/getters'

import type { CustomerAccount } from '@/lib/gql/types'

interface MyAccountSidebarProps {
  user?: CustomerAccount
}

const MyAccountSidebar = (props: MyAccountSidebarProps) => {
  const { user } = props
  const { t } = useTranslation('common')
  const router = useRouter()
  const { logout } = useAuthContext()

  const navGroups = getMyAccountNavGroups(user?.accountType)
  const { fullName, companyOrOrganization } = userGetters.getCustomerAccountDetails(
    user as CustomerAccount
  )

  const isActive = (href: string) => router.pathname === href

  return (
    <Box component="nav" aria-label={String(t('my-account'))}>
      <Box sx={{ ...MyAccountLayoutStyles.sidebarCard, display: { xs: 'none', md: 'block' } }}>
        <Box sx={{ padding: '0 0.75rem' }}>
          <Typography component="p" sx={{ ...MyAccountLayoutStyles.userName }}>
            {fullName}
          </Typography>
          {companyOrOrganization && (
            <Typography component="p" sx={{ ...MyAccountLayoutStyles.userOrganization }}>
              {companyOrOrganization}
            </Typography>
          )}
        </Box>

        <Divider sx={{ ...MyAccountLayoutStyles.divider }} />

        {navGroups.map((group) => (
          <Box key={group.id} sx={{ marginBottom: '1rem' }}>
            <Typography component="span" sx={{ ...MyAccountLayoutStyles.groupLabel }}>
              {t(group.translationKey)}
            </Typography>
            <List disablePadding>
              {group.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon

                return (
                  <ListItemButton
                    key={item.id}
                    component={Link}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      ...MyAccountLayoutStyles.navItem,
                      ...(active ? MyAccountLayoutStyles.navItemActive : {}),
                    }}
                  >
                    <ListItemIcon sx={{ ...MyAccountLayoutStyles.navItemIcon }}>
                      <Icon height={18} aria-hidden="true" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t(item.translationKey)}
                      sx={{ ...MyAccountLayoutStyles.navItemText }}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          </Box>
        ))}

        <Divider sx={{ ...MyAccountLayoutStyles.divider }} />

        <ListItemButton onClick={logout} sx={{ ...MyAccountLayoutStyles.navItem }}>
          <ListItemIcon sx={{ ...MyAccountLayoutStyles.navItemIcon }}>
            <LogoutIcon height={18} aria-hidden="true" />
          </ListItemIcon>
          <ListItemText primary={t('logout')} sx={{ ...MyAccountLayoutStyles.navItemText }} />
        </ListItemButton>
      </Box>

      <Box sx={{ ...MyAccountLayoutStyles.mobileNav, display: { xs: 'flex', md: 'none' } }}>
        {navGroups.flatMap((group) =>
          group.items.map((item) => {
            const active = isActive(item.href)

            return (
              <Box
                key={item.id}
                component={Link}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                sx={{
                  ...MyAccountLayoutStyles.mobileNavItem,
                  ...(active ? MyAccountLayoutStyles.mobileNavItemActive : {}),
                }}
              >
                {t(item.translationKey)}
              </Box>
            )
          })
        )}
      </Box>
    </Box>
  )
}

export default MyAccountSidebar
