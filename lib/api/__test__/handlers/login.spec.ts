import loginHandler from '@/lib/api/handlers/login'
import { fetcher } from '@/lib/api/util'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: { userCookieKey: 'KIBO_AT', maxCookieAge: 1000 },
}))

jest.mock('@/lib/api/util/api-auth-client', () => ({
  apiAuthClient: { getAccessToken: jest.fn(() => Promise.resolve('app-token')) },
}))

jest.mock('@/lib/api/util/getUserClaimsFromRequest', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve('guest-claims')),
}))

jest.mock('@/lib/api/util', () => ({
  fetcher: jest.fn(),
  getAdditionalHeader: jest.fn(() => ({})),
}))

const jwt = `x.${Buffer.from(
  JSON.stringify({ 'https://www.kibocommerce.com/user_claims': { bv: [] } })
).toString('base64')}.y`

const loginResponse = {
  data: {
    account: {
      customerAccount: { id: 2238, userId: 'user-1' },
      accessToken: 'user-claims',
      jwtAccessToken: jwt,
    },
  },
}

const cookie = (ticket: Record<string, unknown>) =>
  Buffer.from(JSON.stringify(ticket)).toString('base64')

const setup = ({
  ticket = { accessToken: 'guest-claims' },
  guestCart = { id: 'guest-cart', items: [{ id: 'item-guest' }] },
  userCart = { id: 'user-cart', items: [{ id: 'item-guest' }, { id: 'item-user' }] },
  deleteStatus = 204,
}: {
  ticket?: Record<string, unknown>
  guestCart?: { id: string | null; items: { id: string }[] }
  userCart?: { id: string; items: { id: string }[] }
  deleteStatus?: number
} = {}) => {
  const mockFetcher = fetcher as jest.Mock
  mockFetcher.mockImplementation(({ query }: any, { userClaims }: any) => {
    if (/createCustomerAuthTicket/.test(query)) return Promise.resolve(loginResponse)
    if (userClaims === 'guest-claims') return Promise.resolve({ data: { currentCart: guestCart } })
    return Promise.resolve({ data: { currentCart: userCart } })
  })
  global.fetch = jest.fn(() => Promise.resolve({ ok: deleteStatus < 300, status: deleteStatus }))

  const req: any = {
    body: { query: 'mutation login { account: createCustomerAuthTicket }', variables: {} },
    cookies: { kibo_at: cookie(ticket) },
    headers: {},
    logger: { error: jest.fn() },
  }
  const json = jest.fn()
  const res: any = { status: jest.fn(() => ({ json })), setHeader: jest.fn() }
  return { req, res, json }
}

const deleteCalls = () =>
  (global.fetch as jest.Mock).mock.calls.filter(([, init]) => init?.method === 'DELETE')

describe('[api handlers] login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.KIBO_API_HOST = 'kibo.test'
  })

  it('should delete the guest cart once its items are merged into the account cart', async () => {
    const { req, res } = setup()

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining('kibo_at='))
    expect(deleteCalls()).toEqual([
      [
        'https://kibo.test/api/commerce/carts/guest-cart',
        { method: 'DELETE', headers: { authorization: 'Bearer app-token' } },
      ],
    ])
  })

  it('should keep the guest cart when its items are not in the account cart yet', async () => {
    const { req, res } = setup({ userCart: { id: 'user-cart', items: [{ id: 'item-user' }] } })

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(deleteCalls()).toHaveLength(0)
    expect(req.logger.error).toHaveBeenCalled()
  })

  it('should not touch any cart when the guest cart is empty', async () => {
    const { req, res } = setup({ guestCart: { id: null, items: [] } })

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(deleteCalls()).toHaveLength(0)
  })

  it('should not touch any cart when the shopper is already signed in', async () => {
    const { req, res } = setup({ ticket: { accessToken: 'guest-claims', userId: 'someone' } })

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(deleteCalls()).toHaveLength(0)
  })

  it('should still log the shopper in when deleting the guest cart fails', async () => {
    const { req, res } = setup()
    global.fetch = jest.fn(() => Promise.reject(new Error('network down')))

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining('kibo_at='))
    expect(req.logger.error).toHaveBeenCalled()
  })
})
