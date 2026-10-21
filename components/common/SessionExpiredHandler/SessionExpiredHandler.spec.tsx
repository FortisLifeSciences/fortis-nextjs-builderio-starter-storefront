import React from 'react'

import { act, render } from '@testing-library/react'

import SessionExpiredHandler from './SessionExpiredHandler'
import { SESSION_EXPIRED } from '@/lib/constants'

const mockExpireSession = jest.fn()
const mockToggleCartDrawer = jest.fn()
const mockShowModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('@/context', () => ({
  useAuthContext: () => ({ expireSession: mockExpireSession }),
  useHeaderContext: () => ({ toggleCartDrawer: mockToggleCartDrawer }),
}))

jest.mock('@/context/ModalContext', () => ({
  useModalContext: () => ({ showModal: mockShowModal, closeModal: mockCloseModal }),
}))

jest.mock('@/components/layout/Login/LoginDialog/LoginDialog', () => () => null)

const fireSessionExpired = () =>
  act(() => {
    window.dispatchEvent(new Event(SESSION_EXPIRED.EVENT))
  })

describe('[components] SessionExpiredHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    document.cookie = `${SESSION_EXPIRED.COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  })

  it('does nothing on load when the session is fine', () => {
    render(<SessionExpiredHandler />)

    expect(mockShowModal).not.toHaveBeenCalled()
  })

  it('asks the user to log in again on load when the server marked the session as expired', () => {
    document.cookie = `${SESSION_EXPIRED.COOKIE}=true; path=/`

    render(<SessionExpiredHandler />)

    expect(mockExpireSession).toHaveBeenCalledTimes(1)
    expect(mockShowModal).toHaveBeenCalledTimes(1)
    expect(document.cookie).not.toContain(SESSION_EXPIRED.COOKIE)
  })

  it('logs the user out locally and asks them to log in again', () => {
    render(<SessionExpiredHandler />)

    fireSessionExpired()

    expect(mockExpireSession).toHaveBeenCalledTimes(1)
    expect(mockToggleCartDrawer).toHaveBeenCalledWith(false)
    expect(mockShowModal).toHaveBeenCalledTimes(1)
    expect(mockShowModal.mock.calls[0][0].props.sessionExpired).toBe(true)
  })

  it('handles a burst of failing requests only once', () => {
    render(<SessionExpiredHandler />)

    fireSessionExpired()
    fireSessionExpired()

    expect(mockExpireSession).toHaveBeenCalledTimes(1)
    expect(mockShowModal).toHaveBeenCalledTimes(1)
  })

  it('reopens the cart after the user logs back in', () => {
    render(<SessionExpiredHandler />)

    fireSessionExpired()
    act(() => {
      mockShowModal.mock.calls[0][0].props.onLoginSuccess()
    })

    expect(mockCloseModal).toHaveBeenCalled()
    expect(mockToggleCartDrawer).toHaveBeenLastCalledWith(true)
  })
})
