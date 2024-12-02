import { BuilderComponent, builder, Builder } from '@builder.io/react'
import getConfig from 'next/config'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { SmallBanner } from '@/components/home'
import { CartTemplate } from '@/components/page-templates'
import { ProductRecommendations } from '@/components/product'
import { getCart } from '@/lib/api/operations/'
import { MetaData, PageWithMetaData } from '@/lib/types'

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
  const cartBottomContentSection = await builder.get(cartTopSection).promise()
  const cartEmptyContentSection = await builder.get(cartEmptySection).promise()

  return {
    props: {
      isMultiShipEnabled,
      cart: response?.currentCart || null,
      cartTopContentSection: cartTopContentSection || null,
      cartBottomContentSection: cartBottomContentSection || null,
      cartEmptyContentSection: cartEmptyContentSection || null,
      metaData: getMetaData(),
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const CartPage: NextPage<CartPageType> = (props: any) => {
  const { cartTopContentSection, cartBottomContentSection, cartEmptyContentSection } = props
  const { cartTopSection, cartBottomSection, cartEmptySection } =
    publicRuntimeConfig?.builderIO?.modelKeys || {}
  return (
    <>
      <CartTemplate
        {...props}
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
