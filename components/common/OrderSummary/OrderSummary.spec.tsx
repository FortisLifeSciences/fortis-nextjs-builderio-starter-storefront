/** @format */

import React from 'react'

import { composeStories } from '@storybook/testing-react'
import { render, screen } from '@testing-library/react'

import * as stories from './OrderSummary.stories' // import all stories from the stories file

const { Checkout } = composeStories(stories)

const orderPriceMock = jest.fn(() => <div data-testid="order-price-component" />)
jest.mock(
  '@/components/common/OrderPrice/OrderPrice',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  () => (props: any) => orderPriceMock(props)
)

describe('checkout Component', () => {
  it('should render order summary heading', () => {
    render(<Checkout {...Checkout.args} />)
    const orderSummaryHeading = screen.getByText(Checkout.args?.nameLabel as string)
    const orderPriceComponent = screen.getByTestId('order-price-component')
    expect(orderSummaryHeading).toBeVisible()
    expect(orderPriceComponent).toBeInTheDocument()
  })

  // The loading UI (skeleton rows) now lives inside OrderPrice/OrderPriceList, not as an
  // overlay on OrderSummary itself - OrderSummary's job is just to forward `isLoading` down
  // and mark the card aria-busy for assistive tech.
  it('should forward isLoading to OrderPrice and mark the card busy while the order updates', () => {
    render(<Checkout {...Checkout.args} isLoading />)
    expect(orderPriceMock).toHaveBeenCalledWith(expect.objectContaining({ isLoading: true }))
    expect(screen.getByTestId('order-summary-card')).toHaveAttribute('aria-busy', 'true')
  })

  it('should not mark the card busy by default', () => {
    render(<Checkout {...Checkout.args} />)
    expect(orderPriceMock).toHaveBeenCalledWith(expect.objectContaining({ isLoading: false }))
    expect(screen.getByTestId('order-summary-card')).toHaveAttribute('aria-busy', 'false')
  })
})
