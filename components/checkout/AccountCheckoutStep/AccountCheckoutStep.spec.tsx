import React from 'react'

import { QueryClient } from '@tanstack/react-query'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AccountCheckoutStep from './AccountCheckoutStep'
import { renderWithQueryClient } from '@/__test__/utils'
import { AuthContext } from '@/context'
import { tokenizeCreditCardPayment } from '@/lib/helpers/tokenizeCreditCardPayment'
import { checkoutKeys } from '@/lib/react-query/queryKeys'
import type { CardForm } from '@/lib/types'

import type {
  CardCollection,
  CrOrder,
  CustomerContactCollection,
  CustomerPurchaseOrderAccount,
} from '@/lib/gql/types'

jest.mock('@/lib/helpers/tokenizeCreditCardPayment', () => ({
  tokenizeCreditCardPayment: jest.fn(),
}))

jest.mock('../CardDetailsForm/CardDetailsForm', () => ({
  __esModule: true,
  default: ({
    onFormStatusChange,
  }: {
    onFormStatusChange: (isValid: boolean, cardData?: CardForm) => void
  }) => (
    <div data-testid="card-form-mock">
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
    </div>
  ),
}))

const shippingContact = {
  firstName: 'Jane',
  lastNameOrSurname: 'Doe',
  email: 'jane@example.com',
  companyOrOrganization: 'Acme Labs',
  phoneNumbers: { home: '5555555555' },
  address: {
    address1: '123 Main Street',
    cityOrTown: 'New York',
    stateOrProvince: 'NY',
    postalOrZipCode: '10001',
    countryCode: 'US',
  },
}

const buildCheckout = (overrides: Partial<CrOrder> = {}): CrOrder =>
  ({
    id: 'order-1',
    email: 'jane@example.com',
    total: 100,
    fulfillmentInfo: { fulfillmentContact: shippingContact },
    payments: [],
    ...overrides,
  } as CrOrder)

const addressCollection = {
  items: [
    {
      id: 1,
      accountId: 1001,
      firstName: 'Jane',
      lastNameOrSurname: 'Doe',
      email: 'jane@example.com',
      address: {
        address1: '9 Billing Road',
        cityOrTown: 'Boston',
        stateOrProvince: 'MA',
        postalOrZipCode: '02101',
        countryCode: 'US',
      },
      types: [{ name: 'Billing', isPrimary: true }],
    },
  ],
} as CustomerContactCollection

const cardCollection = {
  items: [
    {
      id: 'card-valid',
      cardNumberPart: '************4242',
      cardType: 'VISA',
      expireMonth: 12,
      expireYear: 2099,
      isDefaultPayMethod: true,
      contactId: 1,
      nameOnCard: 'Jane Doe',
    },
    {
      id: 'card-expired',
      cardNumberPart: '************1111',
      cardType: 'MC',
      expireMonth: 1,
      expireYear: 2020,
      isDefaultPayMethod: false,
      contactId: 1,
      nameOnCard: 'Jane Doe',
    },
  ],
} as CardCollection

const b2cUser = { id: 1001, userId: 'u-1001', accountType: 'B2C', emailAddress: 'jane@example.com' }
const b2bUser = { ...b2cUser, accountType: 'B2B', companyOrOrganization: 'Acme Labs' }

const setup = ({
  user = b2cUser,
  checkout = buildCheckout(),
  cards,
  customerPurchaseOrderAccount,
}: {
  user?: typeof b2cUser | typeof b2bUser
  checkout?: CrOrder
  cards?: CardCollection
  customerPurchaseOrderAccount?: CustomerPurchaseOrderAccount
} = {}) => {
  const onVoidPayment = jest.fn().mockResolvedValue(undefined)
  const onAddPayment = jest.fn().mockResolvedValue(undefined)
  const onCreateOrder = jest.fn().mockResolvedValue(undefined)
  const authValue = {
    isAuthenticated: true,
    isAuthLoading: false,
    user,
  } as unknown as React.ContextType<typeof AuthContext>

  renderWithQueryClient(
    <AuthContext.Provider value={authValue}>
      <AccountCheckoutStep
        checkout={checkout}
        addressCollection={addressCollection}
        cardCollection={cards}
        customerPurchaseOrderAccount={customerPurchaseOrderAccount}
        updateCheckoutPersonalInfo={jest.fn()}
        onVoidPayment={onVoidPayment}
        onAddPayment={onAddPayment}
        onCreateOrder={onCreateOrder}
      />
    </AuthContext.Provider>
  )

  return { user: userEvent.setup(), onVoidPayment, onAddPayment, onCreateOrder }
}

const agreeToTermsAndPlaceOrder = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('checkbox', { name: 'termsConditions' }))
  await user.click(screen.getByRole('button', { name: 'Place Order' }))
}

describe('[component] AccountCheckoutStep', () => {
  beforeEach(() => {
    jest.mocked(tokenizeCreditCardPayment).mockReset()
  })

  it('hides the payment options for B2C accounts', () => {
    setup()

    expect(screen.getByTestId('account-checkout-step')).toBeInTheDocument()
    expect(screen.queryByText('purchase-order')).not.toBeInTheDocument()
    expect(screen.getByText('payment-information')).toBeVisible()
  })

  it('disables the purchase order option with an explanation for B2B accounts without PO', async () => {
    const { user } = setup({ user: b2bUser })

    const poTitle = screen.getByText('purchase-order')
    await user.hover(poTitle)

    expect(await screen.findByRole('tooltip')).toHaveTextContent('po-not-enabled-tooltip')
    await user.click(poTitle)
    expect(screen.getByText('payment-information')).toBeVisible()
  })

  it('lets PO-enabled B2B accounts switch to purchase order', async () => {
    const { user } = setup({
      user: b2bUser,
      customerPurchaseOrderAccount: { isEnabled: true } as CustomerPurchaseOrderAccount,
    })

    await user.click(screen.getByText('purchase-order'))

    expect(screen.getByText('po-number')).toBeVisible()
    expect(screen.queryByText('payment-information')).not.toBeInTheDocument()
  })

  it('lists saved cards, disables expired ones and preselects the default card', () => {
    setup({ cards: cardCollection })

    const picker = screen.getByTestId('saved-card-picker')
    const rows = within(picker).getAllByText('card-ending-in-number')
    expect(rows).toHaveLength(2)
    expect(within(picker).getByText('card-expired')).toBeVisible()
    expect(screen.getByTestId('saved-card-card-expired')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByTestId('saved-card-card-valid')).toHaveAttribute('aria-disabled', 'false')
    expect(screen.getByText('cvv-code')).toBeVisible()
    expect(screen.queryByTestId('card-form-mock')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'saveCard' })).not.toBeInTheDocument()
    expect(screen.getByText('9 Billing Road')).toBeVisible()
  })

  it('requires the CVV before paying with a saved card', async () => {
    const { user, onAddPayment } = setup({ cards: cardCollection })

    await agreeToTermsAndPlaceOrder(user)

    expect(screen.getByText('cvv-is-required')).toBeVisible()
    expect(onAddPayment).not.toHaveBeenCalled()
  })

  it('pays with a saved card by re-tokenizing its CVV', async () => {
    jest.mocked(tokenizeCreditCardPayment).mockResolvedValue({
      id: 'card-valid',
      numberPart: '************4242',
      isSuccessful: true,
    })
    const { user, onAddPayment, onCreateOrder } = setup({ cards: cardCollection })

    await user.type(screen.getByRole('textbox', { name: 'cvv-code' }), '123')
    await agreeToTermsAndPlaceOrder(user)

    await waitFor(() => expect(onCreateOrder).toHaveBeenCalled())
    expect(jest.mocked(tokenizeCreditCardPayment).mock.calls[0][0]).toEqual(
      expect.objectContaining({ id: 'card-valid', cvv: '123', cardType: 'VISA' })
    )
    expect(onAddPayment).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        newBillingInfo: expect.objectContaining({
          isSameBillingShippingAddress: false,
          billingContact: expect.objectContaining({
            address: expect.objectContaining({ address1: '9 Billing Road' }),
          }),
          card: expect.objectContaining({
            isCardInfoSaved: true,
            paymentServiceCardId: 'card-valid',
          }),
        }),
      })
    )
  })

  it.each([
    [true, false],
    [false, true],
  ])(
    'with "save card" set to %s, sends a new card with isCardInfoSaved %s',
    async (saveCard, expectedIsCardInfoSaved) => {
      jest.mocked(tokenizeCreditCardPayment).mockResolvedValue({
        id: 'new-card-token',
        numberPart: '************1111',
        isSuccessful: true,
      })
      const { user, onAddPayment, onCreateOrder } = setup()

      await user.click(screen.getByRole('button', { name: 'fill-card' }))
      if (saveCard) await user.click(screen.getByRole('checkbox', { name: 'saveCard' }))
      await agreeToTermsAndPlaceOrder(user)

      await waitFor(() => expect(onCreateOrder).toHaveBeenCalled())
      expect(onAddPayment).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({
          newBillingInfo: expect.objectContaining({
            isSameBillingShippingAddress: true,
            card: expect.objectContaining({
              isCardInfoSaved: expectedIsCardInfoSaved,
              paymentServiceCardId: 'new-card-token',
            }),
          }),
        })
      )
    }
  )

  it('voids the payment already on the order before adding the new one', async () => {
    jest.mocked(tokenizeCreditCardPayment).mockResolvedValue({
      id: 'new-card-token',
      numberPart: '************1111',
      isSuccessful: true,
    })
    const checkout = buildCheckout({
      payments: [
        {
          id: 'payment-old',
          status: 'New',
          paymentType: 'CreditCard',
          amountRequested: 100,
          availableActions: ['AuthorizePayment', 'AuthAndCapture', 'VoidPayment'],
        },
      ],
    } as Partial<CrOrder>)
    const { user, onVoidPayment, onAddPayment, onCreateOrder } = setup({ checkout })

    await user.click(screen.getByRole('button', { name: 'fill-card' }))
    await agreeToTermsAndPlaceOrder(user)

    await waitFor(() => expect(onCreateOrder).toHaveBeenCalled())
    expect(onVoidPayment).toHaveBeenCalledWith(
      'order-1',
      'payment-old',
      expect.objectContaining({ actionName: 'VoidPayment' })
    )
    expect(onVoidPayment.mock.invocationCallOrder[0]).toBeLessThan(
      onAddPayment.mock.invocationCallOrder[0]
    )
  })

  it('leaves a declined payment alone and places the order with the new card', async () => {
    jest.mocked(tokenizeCreditCardPayment).mockResolvedValue({
      id: 'new-card-token',
      numberPart: '************1111',
      isSuccessful: true,
    })
    const checkout = buildCheckout({
      payments: [
        {
          id: 'payment-declined',
          status: 'Declined',
          paymentType: 'CreditCard',
          amountRequested: 100,
          availableActions: ['AuthorizePayment', 'AuthAndCapture'],
        },
      ],
    } as Partial<CrOrder>)
    const { user, onVoidPayment, onAddPayment, onCreateOrder } = setup({ checkout })

    await user.click(screen.getByRole('button', { name: 'fill-card' }))
    await agreeToTermsAndPlaceOrder(user)

    await waitFor(() => expect(onCreateOrder).toHaveBeenCalled())
    expect(onVoidPayment).not.toHaveBeenCalled()
    expect(onAddPayment).toHaveBeenCalledTimes(1)
  })

  it('reloads the order after a failed attempt so a retry works from current payments', async () => {
    jest.mocked(tokenizeCreditCardPayment).mockResolvedValue({
      id: 'new-card-token',
      numberPart: '************1111',
      isSuccessful: true,
    })
    const invalidateQueries = jest.spyOn(QueryClient.prototype, 'invalidateQueries')
    const { user, onCreateOrder } = setup()
    onCreateOrder.mockRejectedValue(new Error('Auth declined'))

    await user.click(screen.getByRole('button', { name: 'fill-card' }))
    await agreeToTermsAndPlaceOrder(user)

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: checkoutKeys.all })
    )
    invalidateQueries.mockRestore()
  })

  it('tells the shopper when placing the order fails', async () => {
    jest.mocked(tokenizeCreditCardPayment).mockResolvedValue({
      id: 'new-card-token',
      numberPart: '************1111',
      isSuccessful: true,
    })
    const { user, onCreateOrder } = setup()
    onCreateOrder.mockRejectedValue(new Error('createOrder failed'))

    await user.click(screen.getByRole('button', { name: 'fill-card' }))
    await agreeToTermsAndPlaceOrder(user)

    expect(await screen.findByText('something-went-wrong')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Place Order' })).toBeEnabled()
  })

  it('places the order with the payment that was just added, so a new card can be saved', async () => {
    jest.mocked(tokenizeCreditCardPayment).mockResolvedValue({
      id: 'new-card-token',
      numberPart: '************1111',
      isSuccessful: true,
    })
    const orderWithPayment = buildCheckout({
      payments: [{ id: 'payment-new', status: 'New', paymentType: 'CreditCard' }],
    } as Partial<CrOrder>)
    const { user, onAddPayment, onCreateOrder } = setup()
    onAddPayment.mockResolvedValue(orderWithPayment)

    await user.click(screen.getByRole('button', { name: 'fill-card' }))
    await user.click(screen.getByRole('checkbox', { name: 'saveCard' }))
    await agreeToTermsAndPlaceOrder(user)

    await waitFor(() => expect(onCreateOrder).toHaveBeenCalledWith(orderWithPayment))
  })
})
