import { screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import CartIcon from './CartIcon'
import { renderWithQueryClient } from '@/__test__/utils'
import {
  ModalContextProvider,
  DialogRoot,
  HeaderContextProvider,
  useHeaderContext,
} from '@/context'

const DrawerStateProbe = () => {
  const { headerState } = useHeaderContext()
  return <div data-testid="drawer-state">{String(!!headerState.isCartDrawerVisible)}</div>
}

const setup = () => {
  const user = userEvent.setup()

  renderWithQueryClient(
    <HeaderContextProvider>
      <ModalContextProvider>
        <DialogRoot />
        <CartIcon size="large" isElementVisible={true} />
        <DrawerStateProbe />
      </ModalContextProvider>
    </HeaderContextProvider>
  )
  return {
    user,
  }
}

describe('[component] CartIcon component', () => {
  it('should render the component', () => {
    setup()

    expect(screen.getByText(/cart/)).toBeVisible()
  })

  it('should open the cart side-drawer on click instead of navigating to a cart page', async () => {
    const { user } = setup()

    expect(screen.getByTestId('drawer-state')).toHaveTextContent('false')

    user.click(screen.getByText(/cart/))

    await waitFor(() => {
      expect(screen.getByTestId('drawer-state')).toHaveTextContent('true')
    })
  })
})
