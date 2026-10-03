import builder from '@builder.io/react'
import { setPixelProperties } from '@builder.io/utils'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import {
  StandardShipCheckoutTemplate,
  MultiShipCheckoutTemplate,
} from '@/components/page-templates'
import { useAuthContext } from '@/context'
import { CheckoutStepProvider } from '@/context/CheckoutStepContext/CheckoutStepContext'
import { useGetCustomerPurchaseOrderAccount } from '@/hooks'
import { getCheckout, getMultiShipCheckout, updateOrder } from '@/lib/api/operations'
import { AccountType } from '@/lib/constants'

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
  if (builderContent) setPixelProperties(builderContent, { alt: '' })

  if (!checkout) {
    return { notFound: true }
  }

  const ipAddress = req?.headers['x-forwarded-for'] as string

  updateOrder(
    checkoutId,
    { ...checkout, ipAddress: ipAddress?.split(',')[0] } as CrOrderInput,
    req as NextApiRequest,
    res as NextApiResponse
  )

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
  const { isAuthenticated, isAuthLoading, user } = useAuthContext()
  const { checkout, isMultiShipEnabled, builderContent, ...rest } = props
  const isB2BUser = user?.accountType?.toLowerCase() === AccountType.B2B.toLowerCase()
  const { data: customerPurchaseOrderAccount, isLoading: isPOAccountLoading } =
    useGetCustomerPurchaseOrderAccount(user?.id as number, isB2BUser)
  const isCheckoutVariantLoading =
    isAuthLoading || (isAuthenticated && isB2BUser && !!user?.id && isPOAccountLoading)

  const isPOCheckout = isAuthenticated && !!customerPurchaseOrderAccount?.isEnabled

  const steps =
    (isAuthenticated && !isCheckoutVariantLoading && !isPOCheckout) || isMultiShipEnabled
      ? [t('shipping'), t('payment'), t('review')] //t('details'),
      : [t('shipping')]
  const quoteCheckout = !isMultiShipEnabled ? (checkout as CrOrder) : null
  const quoteId = quoteCheckout?.originalQuoteId
  return (
    <>
      <CheckoutStepProvider steps={steps} initialActiveStep={quoteId ? steps.length - 1 : 0}>
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
