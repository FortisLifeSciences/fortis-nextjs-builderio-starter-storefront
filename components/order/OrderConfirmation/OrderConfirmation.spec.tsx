import { composeStories } from '@storybook/testing-react'
import { render, screen } from '@testing-library/react'

import * as stories from './OrderConfirmation.stories'

const { Common } = composeStories(stories)

describe('[component] - OrderConfirmation', () => {
  const setup = () => {
    render(<Common {...Common.args} />)
  }

  it('should render component', () => {
    setup()

    expect(screen.getByTestId('order-confirmation-new')).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: /order-confirmed/i,
      })
    ).toBeVisible()
    expect(screen.getByText(/order-confirmed-description/i)).toBeVisible()
    expect(screen.getByText(/estimated-delivery/i)).toBeVisible()
    expect(screen.getByText(/shipping-details/i)).toBeVisible()
    expect(screen.getByText(/contact-information/i)).toBeVisible()
    expect(screen.getByText(/billing-information/i)).toBeVisible()
    expect(screen.getByText(/order-summary/i)).toBeVisible()
    expect(screen.getByText(/special-instructions/i)).toBeVisible()
    expect(screen.getByText(/whats-next/i)).toBeVisible()
    expect(screen.getByRole('link', { name: /continue-shopping/i })).toBeVisible()
    expect(screen.getByRole('link', { name: /track-order/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /download-receipt/i })).toBeVisible()
  })
})
