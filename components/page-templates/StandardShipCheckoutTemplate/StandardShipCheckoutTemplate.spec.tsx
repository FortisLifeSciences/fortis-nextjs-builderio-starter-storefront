import React, { ReactNode, useState } from 'react'

import { composeStories } from '@storybook/testing-react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'

import * as stories from './StandardShipCheckoutTemplate.stories'
import { server } from '@/__mocks__/msw/server'
import { orderMock } from '@/__mocks__/stories'
import { AuthContext } from '@/context'

import { Checkout, CrOrder } from '@/lib/gql/types'

const { Common } = composeStories(stories)

jest.mock('../../checkout/CheckoutUITemplate/CheckoutUITemplate', () => ({
  __esModule: true,
  default: ({
    checkout,
    promoError,
    handleApplyCouponCode,
    handleRemoveCouponCode,
    children,
  }: {
    checkout: Checkout
    promoError: string
    handleApplyCouponCode: (couponCode: string) => void
    handleRemoveCouponCode: (couponCode: string) => void
    children: ReactNode
  }) => (
    <>
      <div data-testid="checkout-ui-template-mock">
        <p data-testid="promoError">{promoError}</p>
        <p data-testid="coupon-count">{checkout?.couponCodes?.length}</p>

        <button
          type="button"
          onClick={() => handleApplyCouponCode('100OFF')}
          data-testid="apply-coupon-button"
        >
          Apply Coupon
        </button>
        <button
          type="button"
          data-testid="remove-coupon-button"
          onClick={() => handleRemoveCouponCode('10OFF')}
        >
          Remove Coupon
        </button>
        {children}
      </div>
    </>
  ),
}))

interface CheckoutStepMockProps {
  checkout: CrOrder
  updateCheckoutPersonalInfo: (prop: { email: string }) => void
  onCreateOrder: (checkout: CrOrder) => Promise<void>
}

const buildNewCardPayment = (isCardInfoSaved: boolean) => ({
  id: 'payment-1',
  status: 'New',
  paymentType: 'CreditCard',
  billingInfo: {
    billingContact: {
      firstName: 'Jane',
      lastNameOrSurname: 'Doe',
      email: 'jane@example.com',
      address: {
        address1: '350 5th Ave',
        cityOrTown: 'New York',
        stateOrProvince: 'NY',
        postalOrZipCode: '10118',
        countryCode: 'US',
      },
    },
    card: {
      paymentServiceCardId: 'new-card-token',
      cardNumberPartOrMask: '************1111',
      paymentOrCardType: 'VISA',
      expireMonth: 12,
      expireYear: 2099,
      isCardInfoSaved,
    },
  },
})

const CheckoutStepMock = ({
  testId,
  checkout,
  updateCheckoutPersonalInfo,
  onCreateOrder,
}: CheckoutStepMockProps & { testId: string }) => {
  const [placeOrderError, setPlaceOrderError] = useState('')
  const placeOrderWithNewCard = (isCardInfoSaved: boolean) =>
    onCreateOrder({ ...checkout, payments: [buildNewCardPayment(isCardInfoSaved)] } as CrOrder)
  return (
    <div data-testid={testId}>
      <button
        type="button"
        data-testid="updateCheckoutPersonalInfo"
        onClick={() => updateCheckoutPersonalInfo({ email: 'test@gmail.com' })}
      >
        Update Checkout Personal Info
      </button>
      <button
        type="button"
        onClick={() =>
          onCreateOrder(checkout).catch((error: Error) => setPlaceOrderError(error.message))
        }
      >
        Place Order
      </button>
      <button type="button" onClick={() => placeOrderWithNewCard(false)}>
        Place Order With Card To Save
      </button>
      <button type="button" onClick={() => placeOrderWithNewCard(true)}>
        Place Order With Card Not To Save
      </button>
      <p data-testid="updated-email">{checkout?.email}</p>
      <p data-testid="place-order-error">{placeOrderError}</p>
    </div>
  )
}

const mockCreateOrder = jest.fn()
jest.mock('@/hooks/mutations/standardCheckout/useCreateOrder/useCreateOrder', () => ({
  useCreateOrder: () => ({ createOrder: { mutateAsync: mockCreateOrder } }),
}))

const mockCreateCustomerAddress = jest.fn()
jest.mock('@/hooks/mutations/address/create/useCreateCustomerAddress', () => ({
  useCreateCustomerAddress: () => ({
    createCustomerAddress: { mutateAsync: mockCreateCustomerAddress },
  }),
}))

const mockCreateCustomerCard = jest.fn()
jest.mock('@/hooks/mutations/card/create/useCreateCustomerCard', () => ({
  useCreateCustomerCard: () => ({ createCustomerCard: { mutateAsync: mockCreateCustomerCard } }),
}))

jest.mock('@/components/checkout/GuestCheckoutStep/GuestCheckoutStep', () => ({
  __esModule: true,
  default: (props: CheckoutStepMockProps) => (
    <CheckoutStepMock testId="guest-checkout-step-mock" {...props} />
  ),
}))

jest.mock('@/components/checkout/AccountCheckoutStep/AccountCheckoutStep', () => ({
  __esModule: true,
  default: (props: CheckoutStepMockProps) => (
    <CheckoutStepMock testId="account-checkout-step-mock" {...props} />
  ),
}))

const mockRouterPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { checkoutId: '12345' },
    push: mockRouterPush,
  }),
}))

const renderTemplate = ({ isAuthenticated = false, isAuthLoading = false } = {}) => {
  const authValue = {
    isAuthenticated,
    isAuthLoading,
    user: isAuthenticated
      ? { id: 1012, accountType: 'B2C', emailAddress: 'john.doe@gmail.com' }
      : undefined,
  } as unknown as React.ContextType<typeof AuthContext>

  return render(
    <AuthContext.Provider value={authValue}>
      <Common {...Common?.args} />
    </AuthContext.Provider>
  )
}

beforeAll(() => server.listen())
beforeEach(() => jest.clearAllMocks())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('[component] - StandardShipCheckout template', () => {
  it('should show a loader while the session check is pending', () => {
    renderTemplate({ isAuthLoading: true })

    expect(screen.getByRole('progressbar')).toBeVisible()
    expect(screen.queryByTestId('guest-checkout-step-mock')).not.toBeInTheDocument()
    expect(screen.queryByTestId('account-checkout-step-mock')).not.toBeInTheDocument()
  })

  it('should render the guest checkout for anonymous shoppers', () => {
    renderTemplate()

    expect(screen.getByTestId('checkout-ui-template-mock')).toBeVisible()
    expect(screen.getByTestId('guest-checkout-step-mock')).toBeVisible()
    expect(screen.queryByTestId('account-checkout-step-mock')).not.toBeInTheDocument()
  })

  it('should render the account checkout for logged-in shoppers', () => {
    renderTemplate({ isAuthenticated: true })

    expect(screen.getByTestId('account-checkout-step-mock')).toBeVisible()
    expect(screen.queryByTestId('guest-checkout-step-mock')).not.toBeInTheDocument()
  })

  it('should save the new card to the account when the shopper asked to', async () => {
    const user = userEvent.setup()
    mockCreateCustomerAddress.mockResolvedValueOnce({ id: 77 })
    renderTemplate({ isAuthenticated: true })

    await user.click(screen.getByRole('button', { name: 'Place Order With Card To Save' }))

    await waitFor(() => {
      expect(mockCreateCustomerCard).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: 1012,
          cardId: 'new-card-token',
          cardInput: expect.objectContaining({ contactId: 77 }),
        })
      )
    })
    expect(mockRouterPush).toHaveBeenCalledTimes(1)
  })

  it('should not save the card when the shopper did not ask to', async () => {
    const user = userEvent.setup()
    renderTemplate({ isAuthenticated: true })

    await user.click(screen.getByRole('button', { name: 'Place Order With Card Not To Save' }))

    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledTimes(1))
    expect(mockCreateCustomerAddress).not.toHaveBeenCalled()
    expect(mockCreateCustomerCard).not.toHaveBeenCalled()
  })

  it('should pass a failed order on to the checkout step', async () => {
    const user = userEvent.setup()
    mockCreateOrder.mockRejectedValueOnce(new Error('Order could not be placed'))
    renderTemplate({ isAuthenticated: true })

    await user.click(screen.getByRole('button', { name: 'Place Order' }))

    await waitFor(() => {
      expect(screen.getByTestId('place-order-error')).toHaveTextContent('Order could not be placed')
    })
  })

  it('should handle handleApplyCouponCode with invalid coupons', async () => {
    const user = userEvent.setup()
    server.use(
      graphql.mutation('updateOrderCoupon', (_req, res, ctx) => {
        return res(
          ctx.data({
            updateOrderCoupon: {
              invalidCoupons: [
                {
                  reason: 'Not a valid coupon',
                },
              ],
            },
          })
        )
      })
    )
    renderTemplate()
    user.click(screen.getByTestId(/apply-coupon-button/))

    await waitFor(() => {
      expect(screen.getByTestId('promoError')).toHaveTextContent('Not a valid coupon')
    })
  })

  it('should handle handleRemoveCouponCode', async () => {
    const user = userEvent.setup()
    renderTemplate()
    expect(screen.getByTestId('coupon-count')).toHaveTextContent('2')
    server.use(
      graphql.query('getCheckout', (_req, res, ctx) => {
        return res(
          ctx.data({
            checkout: {
              ...orderMock.checkout,
              couponCodes: ['10OFF'],
            },
          })
        )
      })
    )

    user.click(screen.getByTestId(/remove-coupon-button/))

    await waitFor(() => {
      expect(screen.getByTestId('coupon-count')).toHaveTextContent('1')
    })
  })

  it('should handle updateCheckoutPersonalInfo', async () => {
    const user = userEvent.setup()
    renderTemplate()

    server.use(
      graphql.query('getCheckout', (_req, res, ctx) => {
        return res(
          ctx.data({
            checkout: {
              ...orderMock.checkout,
              email: 'john.doe@gmail.com',
            },
          })
        )
      })
    )

    user.click(screen.getByTestId(/updateCheckoutPersonalInfo/))

    await waitFor(() => {
      expect(screen.getByTestId('updated-email')).toHaveTextContent('john.doe@gmail.com')
    })
  })
})
