import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import ShoppingCartIcon from '@/assets/icons/cartIcon.svg'
import { HeaderAction } from '@/components/common'
import { useGetCart } from '@/hooks'
import { cartGetters } from '@/lib/getters'
import type { IconProps } from '@/lib/types'

const CartIcon = ({ size, isElementVisible, mobileIconColor }: IconProps) => {
  const { t } = useTranslation('common')

  const { data: cart } = useGetCart()
  const [itemCount, setItemCount] = useState(0)

  const router = useRouter()
  useEffect(() => {
    if (
      router.pathname === '/order-confirmation' ||
      router.asPath.includes('/order-confirmation')
    ) {
      setItemCount(0)
      return
    }
    const count = cartGetters.getCartItemCount(cart)
    setItemCount(count)
  }, [cart, router.pathname, router.asPath])

  const gotoCart = () => {
    router.push('/cart')
  }

  return (
    <HeaderAction
      subtitle={t('cart')}
      icon={ShoppingCartIcon}
      badgeContent={itemCount}
      iconFontSize={size}
      onClick={gotoCart}
      isElementVisible={isElementVisible}
      mobileIconColor={mobileIconColor}
    />
  )
}

export default CartIcon
