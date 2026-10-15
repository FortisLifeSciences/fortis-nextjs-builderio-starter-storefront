import React, { useEffect } from 'react'

import { QueryClient, QueryClientProvider, useIsMutating } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import mockRouter from 'next-router-mock'
import { createDynamicRouteParser } from 'next-router-mock/dynamic-routes'
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider'

import CartSideDrawer from './CartSideDrawer'
import { HeaderContextProvider, useHeaderContext } from '@/context/HeaderContext'
import { cartKeys, checkoutKeys, checkoutSyncKeys } from '@/lib/react-query/queryKeys'

const mockDeleteCartItem = jest.fn()
const mockDeleteCartItemAsync = jest.fn()
const mockUpdateCartItemQuantity = jest.fn()
const mockUpdateCartItemQuantityAsync = jest.fn()
const mockInitiateOrder = jest.fn()
let mockCart: any

jest.mock('@/hooks', () => ({
  useGetCart: () => ({ data: mockCart }),
  useDeleteCartItem: () => ({
    deleteCartItem: { mutate: mockDeleteCartItem, mutateAsync: mockDeleteCartItemAsync },
  }),
  useUpdateCartItemQuantity: () => ({
    updateCartItemQuantity: {
      mutate: mockUpdateCartItemQuantity,
      mutateAsync: mockUpdateCartItemQuantityAsync,
    },
  }),
  useInitiateOrder: () => ({
    initiateOrder: { mutateAsync: mockInitiateOrder, isPending: false },
  }),
}))

jest.mock('@/context', () => ({
  ...jest.requireActual('@/context/HeaderContext'),
  useAuthContext: () => ({ isAuthenticated: true }),
  useModalContext: () => ({ showModal: jest.fn() }),
}))

jest.mock('@/components/common', () => ({
  Price: ({ price }: { price: string }) => <span>{price}</span>,
  QuantitySelector: ({ onIncrease }: { onIncrease: () => void }) => (
    <button aria-label="increase" onClick={onIncrease} />
  ),
}))

jest.mock('@/components/layout/Login/LoginDialog/LoginDialog', () => () => null)

const buildItem = (id: string, quantity = 1) => ({
  id,
  quantity,
  product: { productCode: `CODE-${id}`, name: `Product ${id}`, price: { price: 10 } },
})

const buildCart = (items: any[]) => ({ id: 'cart-1', items })

const OpenDrawer = () => {
  const { toggleCartDrawer } = useHeaderContext()
  useEffect(() => {
    toggleCartDrawer(true)
  }, [])
  return null
}

const SyncIndicator = () => {
  const isSyncing = useIsMutating({ mutationKey: checkoutSyncKeys.all }) > 0
  return isSyncing ? <span data-testid="checkout-syncing" /> : null
}

const setup = ({ checkout }: { checkout?: any } = {}) => {
  const user = userEvent.setup()
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  queryClient.setQueryData(cartKeys.all, mockCart)
  if (checkout) queryClient.setQueryData(checkoutKeys.detail(checkout.id), checkout)
  const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

  const settleCartMutation =
    (applyToCart: (items: any[], variables: any) => any[]) => (variables: any) => {
      queryClient.setQueryData(cartKeys.all, (old: any) => ({
        ...old,
        items: applyToCart(old.items, variables),
      }))
      return Promise.resolve(true)
    }

  const removeItem = settleCartMutation((items, { cartItemId }) =>
    items.filter((item) => item.id !== cartItemId)
  )
  const changeQuantity = settleCartMutation((items, { cartItemId, quantity }) =>
    items.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
  )
  mockDeleteCartItem.mockImplementation(removeItem)
  mockDeleteCartItemAsync.mockImplementation(removeItem)
  mockUpdateCartItemQuantity.mockImplementation(changeQuantity)
  mockUpdateCartItemQuantityAsync.mockImplementation(changeQuantity)

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouterProvider>
        <HeaderContextProvider>
          <OpenDrawer />
          <SyncIndicator />
          <CartSideDrawer />
        </HeaderContextProvider>
      </MemoryRouterProvider>
    </QueryClientProvider>
  )

  return { user, invalidateSpy }
}

describe('[component] CartSideDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRouter.useParser(createDynamicRouteParser(['/checkout/[checkoutId]']))
    mockInitiateOrder.mockResolvedValue({ id: 'checkout-1' })
    mockCart = buildCart([buildItem('item-1'), buildItem('item-2')])
  })

  it('re-syncs the checkout order after removing an item on the checkout page', async () => {
    mockRouter.setCurrentUrl('/checkout/checkout-1')
    const { user, invalidateSpy } = setup({ checkout: { id: 'checkout-1' } })

    const [firstRemoveButton] = await screen.findAllByRole('button', { name: 'remove' })
    await user.click(firstRemoveButton)

    await waitFor(() => expect(mockInitiateOrder).toHaveBeenCalledWith({ cartId: 'cart-1' }))
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: checkoutKeys.all }))
    expect(mockRouter.asPath).toBe('/checkout/checkout-1')
  })

  it('re-syncs the checkout order after changing a quantity on the checkout page', async () => {
    mockRouter.setCurrentUrl('/checkout/checkout-1')
    const { user } = setup({ checkout: { id: 'checkout-1' } })

    const [firstIncreaseButton] = await screen.findAllByRole('button', { name: 'increase' })
    await user.click(firstIncreaseButton)

    expect(mockUpdateCartItemQuantityAsync).toHaveBeenCalledWith({
      cartItemId: 'item-1',
      quantity: 2,
    })
    await waitFor(() => expect(mockInitiateOrder).toHaveBeenCalledWith({ cartId: 'cart-1' }))
  })

  it('flags the checkout as syncing until the order is re-synced', async () => {
    mockRouter.setCurrentUrl('/checkout/checkout-1')
    let resolveOrder: (value: { id: string }) => void = () => undefined
    mockInitiateOrder.mockReturnValue(new Promise((resolve) => (resolveOrder = resolve)))
    const { user } = setup({ checkout: { id: 'checkout-1' } })

    const [firstRemoveButton] = await screen.findAllByRole('button', { name: 'remove' })
    await user.click(firstRemoveButton)

    expect(await screen.findByTestId('checkout-syncing')).toBeInTheDocument()
    resolveOrder({ id: 'checkout-1' })
    await waitFor(() => expect(screen.queryByTestId('checkout-syncing')).not.toBeInTheDocument())
  })

  it('does not flag the checkout as syncing when the cart changes outside checkout', async () => {
    mockRouter.setCurrentUrl('/')
    const { user } = setup()

    const [firstRemoveButton] = await screen.findAllByRole('button', { name: 'remove' })
    await user.click(firstRemoveButton)

    expect(mockDeleteCartItem).toHaveBeenCalledWith({ cartItemId: 'item-1' })
    expect(screen.queryByTestId('checkout-syncing')).not.toBeInTheDocument()
  })

  it('moves to the re-synced checkout when the order id changes', async () => {
    mockRouter.setCurrentUrl('/checkout/checkout-1')
    mockInitiateOrder.mockResolvedValue({ id: 'checkout-2' })
    const { user } = setup({ checkout: { id: 'checkout-1' } })

    const [firstRemoveButton] = await screen.findAllByRole('button', { name: 'remove' })
    await user.click(firstRemoveButton)

    await waitFor(() => expect(mockRouter.asPath).toBe('/checkout/checkout-2'))
  })

  it('leaves the checkout page when the last item is removed', async () => {
    mockCart = buildCart([buildItem('item-1')])
    mockRouter.setCurrentUrl('/checkout/checkout-1')
    const { user } = setup({ checkout: { id: 'checkout-1' } })

    await user.click(await screen.findByRole('button', { name: 'remove' }))

    await waitFor(() => expect(mockRouter.asPath).toBe('/'))
    expect(mockInitiateOrder).not.toHaveBeenCalled()
  })

  it('does not touch a quote-based checkout when the cart changes', async () => {
    mockRouter.setCurrentUrl('/checkout/checkout-1')
    const { user } = setup({ checkout: { id: 'checkout-1', originalQuoteId: 'quote-1' } })

    const [firstRemoveButton] = await screen.findAllByRole('button', { name: 'remove' })
    await user.click(firstRemoveButton)

    expect(mockDeleteCartItemAsync).toHaveBeenCalled()
    expect(mockInitiateOrder).not.toHaveBeenCalled()
  })

  it('does not create an order when the cart changes outside checkout', async () => {
    mockRouter.setCurrentUrl('/')
    const { user } = setup()

    const [firstRemoveButton] = await screen.findAllByRole('button', { name: 'remove' })
    await user.click(firstRemoveButton)

    expect(mockDeleteCartItem).toHaveBeenCalled()
    expect(mockInitiateOrder).not.toHaveBeenCalled()
  })

  it('shows the variation code of each item, falling back to the product code', async () => {
    mockRouter.setCurrentUrl('/')
    mockCart = buildCart([
      {
        ...buildItem('item-1'),
        product: { ...buildItem('item-1').product, variationProductCode: 'A90-116A' },
      },
      buildItem('item-2'),
    ])
    setup()

    expect(await screen.findByText('A90-116A')).toBeVisible()
    expect(screen.queryByText('CODE-item-1')).not.toBeInTheDocument()
    expect(screen.getByText('CODE-item-2')).toBeVisible()
  })

  it('refreshes the current checkout instead of re-navigating when going to checkout from it', async () => {
    mockRouter.setCurrentUrl('/checkout/checkout-1')
    const { user, invalidateSpy } = setup({ checkout: { id: 'checkout-1' } })

    await user.click(await screen.findByRole('button', { name: 'go-to-checkout' }))

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: checkoutKeys.all }))
    expect(mockRouter.asPath).toBe('/checkout/checkout-1')
  })
})
