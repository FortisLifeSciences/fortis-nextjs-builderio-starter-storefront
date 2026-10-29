import { useEffect, useRef } from 'react'

import { deleteCookie, getCookie } from 'cookies-next'

import LoginDialog from '@/components/layout/Login/LoginDialog/LoginDialog'
import { useAuthContext, useHeaderContext } from '@/context'
import { useModalContext } from '@/context/ModalContext'
import { SESSION_EXPIRED } from '@/lib/constants'

const DUPLICATE_EVENT_WINDOW_MS = 2000

const SessionExpiredHandler = () => {
  const { expireSession } = useAuthContext()
  const { toggleCartDrawer } = useHeaderContext()
  const { showModal, closeModal } = useModalContext()

  const handlersRef = useRef({ expireSession, toggleCartDrawer, showModal, closeModal })
  handlersRef.current = { expireSession, toggleCartDrawer, showModal, closeModal }
  const lastHandledAtRef = useRef(0)

  useEffect(() => {
    const onSessionExpired = () => {
      deleteCookie(SESSION_EXPIRED.COOKIE, { path: '/' })
      const now = Date.now()
      if (now - lastHandledAtRef.current < DUPLICATE_EVENT_WINDOW_MS) return
      lastHandledAtRef.current = now

      const { expireSession, toggleCartDrawer, showModal } = handlersRef.current
      expireSession()
      toggleCartDrawer(false)
      showModal({
        Component: LoginDialog,
        props: {
          sessionExpired: true,
          onLoginSuccess: () => {
            handlersRef.current.closeModal()
            handlersRef.current.toggleCartDrawer(true)
          },
        },
      })
    }

    window.addEventListener(SESSION_EXPIRED.EVENT, onSessionExpired)
    if (getCookie(SESSION_EXPIRED.COOKIE)) onSessionExpired()
    return () => window.removeEventListener(SESSION_EXPIRED.EVENT, onSessionExpired)
  }, [])

  return null
}

export default SessionExpiredHandler
