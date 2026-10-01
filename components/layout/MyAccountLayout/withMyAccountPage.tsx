import React from 'react'

import getConfig from 'next/config'
import { ReCaptchaProvider } from 'next-recaptcha-v3'

import MyAccountLayout from './MyAccountLayout'
import { useAuthContext } from '@/context'

import type { CustomerAccount } from '@/lib/gql/types'

export interface MyAccountPageProps {
  customerAccount?: CustomerAccount
}

interface MyAccountPageShellProps extends MyAccountPageProps {
  children: (user: CustomerAccount) => React.ReactNode
}

export const MyAccountPageShell = (props: MyAccountPageShellProps) => {
  const { customerAccount: customerAccountFromServer, children } = props

  const serverSideIsAuthenticated = Boolean(customerAccountFromServer?.id)
  const { user: customerAccountFromClient } = useAuthContext()

  const customerAccount = {
    ...customerAccountFromServer,
    ...customerAccountFromClient,
  } as CustomerAccount

  const { publicRuntimeConfig } = getConfig()
  const { reCaptchaKey } = publicRuntimeConfig.recaptcha

  if (!serverSideIsAuthenticated && !Object.keys(customerAccount).length) return null

  const content = (
    <MyAccountLayout user={customerAccount}>{children(customerAccount)}</MyAccountLayout>
  )

  return reCaptchaKey ? (
    <ReCaptchaProvider reCaptchaKey={reCaptchaKey}>{content}</ReCaptchaProvider>
  ) : (
    content
  )
}
