import builder from '@builder.io/react'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import {
  StandardShipCheckoutTemplate,
  MultiShipCheckoutTemplate,
} from '@/components/page-templates'
import { CheckoutStepProvider } from '@/context/CheckoutStepContext/CheckoutStepContext'
import { getCheckout, getMultiShipCheckout, updateOrder } from '@/lib/api/operations'

import type { Checkout, CrOrder, CrOrderInput } from '@/lib/gql/types'
import type { NextPage, GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'

interface CheckoutPageProps {
  checkoutId: string
  checkout: CrOrder | Checkout
  isMultiShipEnabled?: boolean
  builderContent?: any
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, params, req, res } = context
  const { checkoutId } = params as any
  const { publicRuntimeConfig } = getConfig()
  const isMultiShipEnabled = publicRuntimeConfig.isMultiShipEnabled
  const checkout = isMultiShipEnabled
    ? await getMultiShipCheckout(checkoutId, req as NextApiRequest, res as NextApiResponse)
    : await getCheckout(checkoutId, req as NextApiRequest, res as NextApiResponse)

  const builderContent = await builder.get('checkout-order-summary-section').toPromise()

  if (!checkout) {
    return { notFound: true }
  }

  const ipAddress = req?.headers['x-forwarded-for'] as string

  updateOrder(
    checkoutId,
    { ...checkout, ipAddress: ipAddress?.split(',')[0] } as CrOrderInput,
    req as NextApiRequest,
    res as NextApiResponse
  ).catch((err) => {
    console.error('Background updateOrder failed in checkout SSR:', err)
  })

  return {
    props: {
      checkout,
      checkoutId,
      builderContent: builderContent || null,
      isMultiShipEnabled: isMultiShipEnabled,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

const CheckoutPage: NextPage<CheckoutPageProps> = (props) => {
  const { t } = useTranslation('common')
  const steps = [t('shipping'), t('payment'), t('review')] //t('details'),
  const { checkout, isMultiShipEnabled, builderContent, ...rest } = props
  const quoteCheckout = !isMultiShipEnabled ? (checkout as CrOrder) : null
  const quoteId = quoteCheckout?.originalQuoteId
  return (
    <>
      <CheckoutStepProvider steps={steps} initialActiveStep={quoteId ? 2 : 0}>
        {isMultiShipEnabled ? (
          <MultiShipCheckoutTemplate
            {...rest}
            checkout={checkout as Checkout}
            isMultiShipEnabled={!!isMultiShipEnabled}
          />
        ) : (
          <StandardShipCheckoutTemplate
            {...rest}
            checkout={checkout as CrOrder}
            isMultiShipEnabled={!!isMultiShipEnabled}
            builderContent={builderContent}
          />
        )}
      </CheckoutStepProvider>
    </>
  )
}

export default CheckoutPage
