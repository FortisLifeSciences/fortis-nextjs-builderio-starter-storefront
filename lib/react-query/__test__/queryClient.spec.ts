import { ClientError } from 'graphql-request'

import { SESSION_EXPIRED } from '@/lib/constants'
import { generateQueryClient } from '@/lib/react-query/queryClient'

const clientError = (status: number, body: Record<string, any>) =>
  new ClientError({ ...body, status } as any, { query: 'mutation createOrder { id }' })

const runFailingMutation = async (error: unknown, showSnackbar = jest.fn()) => {
  const client = generateQueryClient(showSnackbar)
  await client
    .getMutationCache()
    .build(client, { mutationFn: () => Promise.reject(error), retry: false })
    .execute(undefined)
    .catch(() => undefined)
  return showSnackbar
}

describe('[lib/react-query] queryClient', () => {
  it('dispatches the session expired event instead of showing the raw error', async () => {
    const listener = jest.fn()
    window.addEventListener(SESSION_EXPIRED.EVENT, listener)

    const showSnackbar = await runFailingMutation(
      clientError(401, { message: 'Session expired', code: SESSION_EXPIRED.CODE })
    )

    expect(listener).toHaveBeenCalledTimes(1)
    expect(showSnackbar).not.toHaveBeenCalled()
    window.removeEventListener(SESSION_EXPIRED.EVENT, listener)
  })

  it('still shows other errors as a snackbar', async () => {
    const listener = jest.fn()
    window.addEventListener(SESSION_EXPIRED.EVENT, listener)

    const showSnackbar = await runFailingMutation(clientError(400, { message: 'Bad request' }))

    expect(listener).not.toHaveBeenCalled()
    expect(showSnackbar).toHaveBeenCalledWith('Bad request', 'error')
    window.removeEventListener(SESSION_EXPIRED.EVENT, listener)
  })

  it('does not retry a query whose session has expired', async () => {
    const queryFn = jest.fn(() =>
      Promise.reject(clientError(401, { message: 'Session expired', code: SESSION_EXPIRED.CODE }))
    )
    const client = generateQueryClient(jest.fn())

    await client
      .fetchQuery({ queryKey: ['session-expired'], queryFn, retryDelay: 0 })
      .catch(() => undefined)

    expect(queryFn).toHaveBeenCalledTimes(1)
  })

  it('keeps retrying other failed queries', async () => {
    const queryFn = jest.fn(() => Promise.reject(clientError(500, { message: 'Server error' })))
    const client = generateQueryClient(jest.fn())

    await client
      .fetchQuery({ queryKey: ['server-error'], queryFn, retryDelay: 0 })
      .catch(() => undefined)

    expect(queryFn).toHaveBeenCalledTimes(4)
  })
})
