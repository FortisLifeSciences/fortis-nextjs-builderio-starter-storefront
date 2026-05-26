import { useEffect, useRef, useState } from 'react'

import { BuilderComponent, builder, Builder } from '@builder.io/react'
import { setPixelProperties } from '@builder.io/utils'
import getConfig from 'next/config'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { SmallBanner } from '@/components/home'
import { CartTemplate } from '@/components/page-templates'
import { ProductRecommendations } from '@/components/product'
import { useAuthContext } from '@/context/AuthContext'
import { useGetProducts } from '@/hooks'
import { getCart } from '@/lib/api/operations/'
import { MetaData, PageWithMetaData } from '@/lib/types'
import { viewCartGTM } from '@/lib/utils/google-tag-manager'

import { CrCart } from '@/lib/gql/types'
import type { NextPage, GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'

interface CartPageType extends PageWithMetaData {
  cart?: CrCart
  isMultiShipEnabled?: boolean
}

const { publicRuntimeConfig } = getConfig()
const apiKey = publicRuntimeConfig?.builderIO?.apiKey

builder.init(apiKey)

Builder.registerComponent(SmallBanner, {
  name: 'SmallBanner',
  inputs: [
    {
      name: 'bannerProps',
      type: 'object',
      defaultValue: {
        title: 'Save up to 50% + Free Shipping',
        subtitle: 'Valid through 10/31.',
        callToAction: { title: 'Shop Now', url: '/category/deals' },
        backgroundColor: '#A12E87',
      },
      subFields: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'subtitle',
          type: 'string',
        },
        {
          name: 'callToAction',
          type: 'object',
          subFields: [
            {
              name: 'title',
              type: 'string',
            },
            {
              name: 'url',
              type: 'string',
            },
          ],
        },
        {
          name: 'backgroundColor',
          type: 'string',
        },
      ],
    },
  ],
})

Builder.registerComponent(ProductRecommendations, {
  name: 'ProductRecommendations',
  inputs: [
    {
      name: 'title',
      type: 'string',
    },
    {
      name: 'productCodes',
      type: 'KiboCommerceProductsList',
    },
  ],
})
function getMetaData(): MetaData {
  return {
    title: 'Cart',
    description: null,
    keywords: null,
    canonicalUrl: null,
    robots: 'noindex,nofollow',
  }
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res } = context
  const response = await getCart(req as NextApiRequest, res as NextApiResponse)
  const { serverRuntimeConfig } = getConfig()
  const isMultiShipEnabled = serverRuntimeConfig.isMultiShipEnabled
  const { cartTopSection, cartBottomSection, cartEmptySection } =
    publicRuntimeConfig?.builderIO?.modelKeys || {}
  const cartTopContentSection = await builder.get(cartBottomSection).promise()
  if (cartTopContentSection)
    setPixelProperties(cartTopContentSection, { alt: 'pixel tag from builder' })
  const cartBottomContentSection = await builder.get(cartTopSection).promise()
  if (cartBottomContentSection)
    setPixelProperties(cartBottomContentSection, { alt: 'pixel tag from builder' })
  const cartEmptyContentSection = await builder.get(cartEmptySection).promise()
  if (cartEmptyContentSection)
    setPixelProperties(cartEmptyContentSection, { alt: 'pixel tag from builder' })
  let productCodes: string[] = []

  if (response?.currentCart?.items) {
    productCodes = response.currentCart.items
      .map((el: any) => el?.product?.productCode)
      .filter(Boolean) as string[]
  }

  return {
    props: {
      isMultiShipEnabled,
      cart: response?.currentCart || null,
      cartTopContentSection: cartTopContentSection || null,
      cartBottomContentSection: cartBottomContentSection || null,
      cartEmptyContentSection: cartEmptyContentSection || null,
      productCodes,
      metaData: getMetaData(),
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const CartPage: NextPage<CartPageType> = (props: any) => {
  const {
    cart,
    productCodes,
    cartTopContentSection,
    cartBottomContentSection,
    cartEmptyContentSection,
  } = props
  const { cartTopSection, cartBottomSection, cartEmptySection } =
    publicRuntimeConfig?.builderIO?.modelKeys || {}
  const {
    data: productSearchResult,
    isLoading,
    isSuccess,
    isFetching,
  } = useGetProducts(productCodes)
  const [updatedCart, setUpdatedCart] = useState(props.cart)
  const { isAuthenticated, user } = useAuthContext()

  const hasGTMCalled = useRef(false)

  useEffect(() => {
    if (productSearchResult?.items) {
      const updatedItems = cart?.items?.map((cartItem: any) => {
        if (productSearchResult?.items) {
          const productFromApi = productSearchResult?.items.find(
            (product: any) => product.productCode === cartItem?.product?.productCode
          )

          if (productFromApi) {
            cartItem.product.categories = productFromApi.categories || []
          }

          return cartItem
        }
      })

      setUpdatedCart({ ...cart, items: updatedItems })
      if (updatedCart && updatedCart.items && user?.userId) {
        if (!hasGTMCalled.current) {
          viewCartGTM(updatedCart, user?.userId)
          hasGTMCalled.current = true
        }
      }
    }
  }, [productSearchResult, cart])

  return (
    <>
      <CartTemplate
        {...props}
        cart={updatedCart}
        cartTopContentSection={
          cartTopContentSection && (
            <BuilderComponent model={cartTopSection} content={cartTopContentSection} />
          )
        }
        cartBottomContentSection={
          cartBottomContentSection && (
            <BuilderComponent model={cartBottomSection} content={cartBottomContentSection} />
          )
        }
        cartEmptyContentSection={
          cartEmptyContentSection && (
            <BuilderComponent model={cartEmptySection} content={cartEmptyContentSection} />
          )
        }
      />
    </>
  )
}

export default CartPage
