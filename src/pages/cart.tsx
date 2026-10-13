import { useEffect } from 'react'

import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useHeaderContext } from '@/context'

import type { GetServerSidePropsContext, NextPage } from 'next'

// The cart page is retired in favor of the global cart side-drawer — landing here
// (bookmark, typed URL, external link) sends the shopper home with the drawer open.
export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const CartPage: NextPage = () => {
  const router = useRouter()
  const { toggleCartDrawer } = useHeaderContext()

  useEffect(() => {
    toggleCartDrawer(true)
    router.replace('/')
  }, [])

  return null
}

export default CartPage
