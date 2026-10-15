/** @format */

import React from 'react'

import { composeStories } from '@storybook/testing-react'
import { render, screen } from '@testing-library/react'

import * as stories from './OrderSummary.stories' // import all stories from the stories file

const { Checkout } = composeStories(stories)

const orderPriceMock = () => <div data-testid="order-price-component" />
jest.mock('@/components/common/OrderPrice/OrderPrice', () => () => orderPriceMock())

describe('checkout Component', () => {
  it('should render order summary heading', () => {
    render(<Checkout {...Checkout.args} />)
    const orderSummaryHeading = screen.getByText(Checkout.args?.nameLabel as string)
    const orderPriceComponent = screen.getByTestId('order-price-component')
    expect(orderSummaryHeading).toBeVisible()
    expect(orderPriceComponent).toBeInTheDocument()
  })

  it('should show a loader while the order is being updated', () => {
    render(<Checkout {...Checkout.args} isLoading />)
    expect(screen.getByTestId('order-summary-loading')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should not show a loader by default', () => {
    render(<Checkout {...Checkout.args} />)
    expect(screen.queryByTestId('order-summary-loading')).not.toBeInTheDocument()
  })
})
