import React, { useEffect, useState } from 'react'

import { Box, CircularProgress } from '@mui/material'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { AccountCheckoutStep, GuestCheckoutStep } from '@/components/checkout'
import { CheckoutUITemplate } from '@/components/page-templates'
import { useAuthContext } from '@/context'
import {
  useGetCurrentOrder,
  useGetCustomerAddresses,
  useUpdateOrderCoupon,
  useDeleteOrderCoupon,
  useUpdateOrderPersonalInfo,
  PersonalInfo,
  useUpdateOrderBillingInfo,
  useAddOrderPaymentInfo,
  useVoidOrderPayment,
  useCreateOrder,
  useGetCards,
  useGetCustomerPurchaseOrderAccount,
  useCreateCustomerCard,
  useCreateCustomerAddress,
} from '@/hooks'
import { AccountType, AddressType, PaymentType } from '@/lib/constants'
import { orderGetters } from '@/lib/getters'
import { buildCreateCustomerCardParam, buildAddressParams } from '@/lib/helpers'
import type { PersonalDetails } from '@/lib/types'
import { addPaymentInfoGTM, checkoutFailure, purchaseGTM } from '@/lib/utils/google-tag-manager'

import type { CrOrder, CrOrderInput, PaymentActionInput } from '@/lib/gql/types'

interface StandardShipCheckoutProps {
  checkout: CrOrder
  isMultiShipEnabled: boolean
  builderContent?: any
}

const StandardShipCheckoutTemplate = (props: StandardShipCheckoutProps) => {
  const { checkout: initialCheckout, isMultiShipEnabled, builderContent } = props
  const router = useRouter()
  const [promoError, setPromoError] = useState<string>('')
  const { checkoutId } = router.query
  const { t } = useTranslation('common')

  const { publicRuntimeConfig } = getConfig()
  const allowInvalidAddresses = publicRuntimeConfig.allowInvalidAddresses

  const { data: order } = useGetCurrentOrder({
    checkoutId: checkoutId as string,
    isMultiship: isMultiShipEnabled,
    initialCheckout,
  })

  const { isAuthenticated, isAuthLoading, user } = useAuthContext()
  const { data: addressCollection } = useGetCustomerAddresses(user?.id as number)
  const { data: cardCollection } = useGetCards(user?.id as number)
  const { createCustomerAddress } = useCreateCustomerAddress()
  const { createCustomerCard } = useCreateCustomerCard()
  const isB2BUser = user?.accountType?.toLowerCase() === AccountType.B2B.toLowerCase()

  const { data: customerPurchaseOrderAccount, isLoading: isPOAccountLoading } =
    useGetCustomerPurchaseOrderAccount(user?.id as number, isB2BUser)
  const isCheckoutVariantLoading =
    isAuthLoading || (isAuthenticated && isB2BUser && !!user?.id && isPOAccountLoading)

  const { updateOrderCoupon } = useUpdateOrderCoupon()
  const { deleteOrderCoupon } = useDeleteOrderCoupon()

  const handleApplyCouponCode = async (couponCode: string) => {
    try {
      setPromoError('')
      const response = await updateOrderCoupon.mutateAsync({
        checkoutId: checkoutId as string,
        couponCode,
      })
      if (response?.invalidCoupons?.length) {
        setPromoError(
          `<strong>${couponCode}</strong> ${
            response.invalidCoupons[0]?.reason || t('invalidPromoError')
          }`
        )
      }
    } catch (err) {
      console.error(err)
    }
  }
  const handleRemoveCouponCode = async (couponCode: string) => {
    try {
      await deleteOrderCoupon.mutateAsync({
        checkoutId: checkoutId as string,
        couponCode,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const { updateOrderPersonalInfo } = useUpdateOrderPersonalInfo()

  const updateCheckoutPersonalInfo = async (formData: PersonalDetails) => {
    const { email } = formData ?? user

    if (allowInvalidAddresses && order?.fulfillmentInfo?.fulfillmentContact?.address) {
      order.fulfillmentInfo.fulfillmentContact.address.isValidated = true
    }

    const personalInfo: PersonalInfo = {
      checkout: {
        ...order,
      } as CrOrderInput,
      email: email as string,
    }
    await updateOrderPersonalInfo.mutateAsync(personalInfo)
  }

  // Payment Step

  const { voidOrderPayment } = useVoidOrderPayment()
  const { addOrderPayment } = useAddOrderPaymentInfo()
  const { updateOrderBillingInfo } = useUpdateOrderBillingInfo()

  const handleVoidPayment = async (
    id: string,
    paymentId: string,
    paymentAction: PaymentActionInput
  ) => {
    await voidOrderPayment.mutateAsync({
      orderId: id as string,
      paymentId,
      paymentAction,
    })
  }

  const handleAddPayment = async (id: string, paymentAction: PaymentActionInput) => {
    const orderWithPayment = await addOrderPayment.mutateAsync({ orderId: id, paymentAction })
    await updateOrderBillingInfo.mutateAsync({
      orderId: id,
      billingInfoInput: { ...paymentAction.newBillingInfo },
    })
    addPaymentInfoGTM(
      order as CrOrder,
      paymentAction?.newBillingInfo?.paymentType as PaymentType,
      user?.userId
    )
    return orderWithPayment as CrOrder
  }

  const { createOrder } = useCreateOrder()

  const handleCreateOrder = async (order: CrOrder) => {
    let isOrderPlaced = false
    try {
      const orderPayments = orderGetters.getNewOrderPayments(order as CrOrder)
      await createOrder.mutateAsync(order)
      isOrderPlaced = true
      if (user?.id && orderPayments[0]?.billingInfo?.card?.isCardInfoSaved === false) {
        const address: any = {
          ...orderPayments[0].billingInfo.billingContact.address,
          contact: {
            ...orderPayments[0].billingInfo.billingContact,
            email: user?.emailAddress as string,
          },
        }
        const params = buildAddressParams({
          accountId: user?.id as number,
          address,
          isDefaultAddress: false,
          addressType: AddressType.BILLING,
        })
        try {
          const savedCustomerAddressRes = await createCustomerAddress.mutateAsync(params)

          const cardParams = buildCreateCustomerCardParam(
            orderPayments[0].billingInfo,
            user?.id as number,
            savedCustomerAddressRes.id
          )
          await createCustomerCard.mutateAsync(cardParams)
        } catch (error) {
          console.warn('Customer card creation failed:', error)
        }
      }
      const affiliation = process.env.NEXT_PUBLIC_KIBO_HOST
      purchaseGTM(order as CrOrder, user?.userId, affiliation)

      router.push({ pathname: '/order-confirmation', query: { checkoutId: order.id } })
    } catch (error) {
      checkoutFailure(order as CrOrder, user?.userId, error as any, 'Website Error')
      if (!isOrderPlaced) throw error
    }
  }

  useEffect(() => {
    updateCheckoutPersonalInfo({ email: user?.emailAddress })
  }, [])

  return (
    <>
      <CheckoutUITemplate
        checkout={order as CrOrder}
        handleApplyCouponCode={handleApplyCouponCode}
        handleRemoveCouponCode={handleRemoveCouponCode}
        promoError={promoError}
        builderContent={builderContent}
      >
        {isCheckoutVariantLoading ? (
          // isAuthenticated starts false on every load and only flips once the session
          // check resolves - branching before that would flash the guest flow at anyone
          // who's actually logged in.
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : !isAuthenticated ? (
          <GuestCheckoutStep
            checkout={order as CrOrder}
            updateCheckoutPersonalInfo={updateCheckoutPersonalInfo}
            onVoidPayment={handleVoidPayment}
            onAddPayment={handleAddPayment}
            onCreateOrder={handleCreateOrder}
          />
        ) : (
          <AccountCheckoutStep
            checkout={order as CrOrder}
            addressCollection={addressCollection}
            cardCollection={cardCollection}
            customerPurchaseOrderAccount={customerPurchaseOrderAccount}
            updateCheckoutPersonalInfo={updateCheckoutPersonalInfo}
            onVoidPayment={handleVoidPayment}
            onAddPayment={handleAddPayment}
            onCreateOrder={handleCreateOrder}
          />
        )}
      </CheckoutUITemplate>
    </>
  )
}

export default StandardShipCheckoutTemplate
