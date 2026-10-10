import { render, screen } from '@testing-library/react'

import OrderStatusDetails from './OrderStatusDetails'
import { orderMock } from '@/__mocks__/stories/orderMock'

import type { CrOrder } from '@/lib/gql/types'

jest.mock('@/context', () => ({
  useAuthContext: () => ({ isAuthenticated: true }),
}))

jest.mock('@/components/common', () => ({
  OrderPrice: () => <div />,
}))

const renderWithStatus = (status: string) =>
  render(<OrderStatusDetails order={{ ...orderMock.checkout, status, packages: [] } as CrOrder} />)

describe('[component] - OrderStatusDetails', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve({ data: {} }) })
  })

  it('should show the errored step instead of the delivery timeline for errored orders', () => {
    renderWithStatus('Errored')

    expect(screen.getByText('order-placed')).toBeVisible()
    expect(screen.getByText('order-errored')).toBeVisible()
    expect(screen.getByText('order-errored-description')).toBeVisible()
    expect(screen.queryByText('processing')).not.toBeInTheDocument()
    expect(screen.queryByText('shipped')).not.toBeInTheDocument()
    expect(screen.queryByText('delivered')).not.toBeInTheDocument()
  })

  it('should show the cancelled step instead of the delivery timeline for cancelled orders', () => {
    renderWithStatus('Cancelled')

    expect(screen.getByText('order-cancelled')).toBeVisible()
    expect(screen.queryByText('order-errored')).not.toBeInTheDocument()
    expect(screen.queryByText('processing')).not.toBeInTheDocument()
  })

  it('should show the full delivery timeline for orders in progress', () => {
    renderWithStatus('Processing')

    expect(screen.getByText('order-placed')).toBeVisible()
    expect(screen.getByText('processing')).toBeVisible()
    expect(screen.getByText('shipped')).toBeVisible()
    expect(screen.getByText('delivered')).toBeVisible()
    expect(screen.queryByText('order-errored')).not.toBeInTheDocument()
    expect(screen.queryByText('order-cancelled')).not.toBeInTheDocument()
  })
})
