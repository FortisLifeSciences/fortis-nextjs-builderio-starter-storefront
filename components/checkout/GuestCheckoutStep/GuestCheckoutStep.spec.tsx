import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import GuestCheckoutStep from './GuestCheckoutStep'
import { ExistingUserDialog } from '@/components/layout'
import { tokenizeCreditCardPayment } from '@/lib/helpers/tokenizeCreditCardPayment'
import type { CardForm } from '@/lib/types'

import type { CrOrder } from '@/lib/gql/types'

const mockCreateAccountAtCheckout = jest.fn()
const mockShowModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('@/lib/helpers/tokenizeCreditCardPayment', () => ({
  tokenizeCreditCardPayment: jest.fn(),
}))

jest.mock('@/lib/gql/client', () => ({
  makeGraphQLClient: () => ({ request: jest.fn().mockResolvedValue({ currentCart: null }) }),
}))

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/checkout/[checkoutId]', query: {}, replace: jest.fn() }),
}))

jest.mock('@/context', () => ({
  useModalContext: () => ({ showModal: mockShowModal, closeModal: mockCloseModal }),
}))

jest.mock('@/components/common', () => ({
  AddressForm: () => null,
  KiboTextBox: ({ label }: { label: string }) => <input aria-label={label} />,
}))

jest.mock('@/hooks', () => ({
  useB2BAccountRequest: () => ({ createAccountAtCheckout: mockCreateAccountAtCheckout }),
  useUpdateOrder: () => ({ updateOrder: { mutateAsync: jest.fn() } }),
  useInitiateOrder: () => ({ initiateOrder: { mutateAsync: jest.fn() } }),
}))

jest.mock('@/components/layout', () => ({
  LoginDialog: () => null,
  ExistingUserDialog: () => null,
}))

jest.mock('@/components/checkout', () => ({
  PaymentOptionCard: ({ title, onClick }: { title: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {title}
    </button>
  ),
  ContactShippingForm: ({ onContinue }: { onContinue: () => void }) => (
    <button type="button" onClick={onContinue}>
      continue-to-payment
    </button>
  ),
  ContactShippingSummary: () => <div />,
  CardDetailsForm: ({
    onFormStatusChange,
  }: {
    onFormStatusChange: (isValid: boolean, cardData?: CardForm) => void
  }) => (
    <button
      type="button"
      onClick={() =>
        onFormStatusChange(true, {
          cardNumber: '4111111111111111',
          cardType: 'VISA',
          expireMonth: 12,
          expireYear: 2099,
          cvv: '123',
        })
      }
    >
      fill-card
    </button>
  ),
}))

const checkout = {
  id: 'order-1',
  email: 'jane@example.com',
  total: 100,
  fulfillmentInfo: {
    fulfillmentContact: {
      firstName: 'Jane',
      lastNameOrSurname: 'Doe',
      email: 'jane@example.com',
      companyOrOrganization: 'Acme Labs',
      address: {
        address1: '123 Main Street',
        cityOrTown: 'New York',
        stateOrProvince: 'NY',
        postalOrZipCode: '10001',
        countryCode: 'US',
      },
    },
  },
  payments: [],
} as unknown as CrOrder

const setup = async ({ wantsAccount }: { wantsAccount: boolean }) => {
  const onAddPayment = jest.fn().mockResolvedValue(undefined)
  const onCreateOrder = jest.fn().mockResolvedValue(undefined)
  const user = userEvent.setup()

  render(
    <GuestCheckoutStep
      checkout={checkout}
      updateCheckoutPersonalInfo={jest.fn()}
      onVoidPayment={jest.fn()}
      onAddPayment={onAddPayment}
      onCreateOrder={onCreateOrder}
    />
  )

  await user.click(screen.getByRole('button', { name: 'continue-to-payment' }))
  await user.click(screen.getByRole('button', { name: 'fill-card' }))
  await user.click(screen.getByRole('checkbox', { name: 'termsConditions' }))
  if (wantsAccount) await user.click(screen.getByRole('checkbox', { name: 'saveInformation' }))
  await user.click(screen.getByRole('button', { name: 'Place Order' }))

  return { onAddPayment, onCreateOrder }
}

describe('[components] GuestCheckoutStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    ;(tokenizeCreditCardPayment as jest.Mock).mockResolvedValue({
      id: 'token-1',
      numberPart: '************1111',
    })
  })

  it('should block the order and explain the existing account before asking the shopper to sign in', async () => {
    mockCreateAccountAtCheckout.mockResolvedValue({ status: 'exists' })

    const { onAddPayment, onCreateOrder } = await setup({ wantsAccount: true })

    expect(await screen.findByText('account-already-exists-for-email')).toBeVisible()
    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({ Component: ExistingUserDialog })
    )
    expect(tokenizeCreditCardPayment).not.toHaveBeenCalled()
    expect(onAddPayment).not.toHaveBeenCalled()
    expect(onCreateOrder).not.toHaveBeenCalled()
  })

  it('should not default to purchase order after signing in from the existing account prompt', async () => {
    mockCreateAccountAtCheckout.mockResolvedValue({ status: 'exists' })

    await setup({ wantsAccount: true })

    await waitFor(() => expect(mockShowModal).toHaveBeenCalled())
    await mockShowModal.mock.calls[0][0].props.onLoginSuccess()

    expect(sessionStorage.getItem('checkoutPaymentIntent')).toBeNull()
  })

  it('should place the order as a guest without any account message when the box is not ticked', async () => {
    localStorage.setItem('accountCreationResult', JSON.stringify({ status: 'exists' }))

    const { onAddPayment, onCreateOrder } = await setup({ wantsAccount: false })

    await waitFor(() => expect(onCreateOrder).toHaveBeenCalledWith(checkout))
    expect(mockCreateAccountAtCheckout).not.toHaveBeenCalled()
    expect(onAddPayment).toHaveBeenCalledWith('order-1', expect.anything())
    expect(localStorage.getItem('accountCreationResult')).toBeNull()
    expect(screen.queryByText('account-already-exists-for-email')).not.toBeInTheDocument()
  })

  it('should place the order on the new account when the account is created', async () => {
    const accountCheckout = { ...checkout, id: 'order-1', customerAccountId: 2001 } as CrOrder
    mockCreateAccountAtCheckout.mockResolvedValue({
      status: 'created',
      checkoutId: 'order-1',
      checkout: accountCheckout,
    })

    const { onAddPayment, onCreateOrder } = await setup({ wantsAccount: true })

    await waitFor(() => expect(onCreateOrder).toHaveBeenCalledWith(accountCheckout))
    expect(onAddPayment).toHaveBeenCalledWith('order-1', expect.anything())
    expect(JSON.parse(localStorage.getItem('accountCreationResult') as string).status).toBe(
      'created'
    )
  })
})
