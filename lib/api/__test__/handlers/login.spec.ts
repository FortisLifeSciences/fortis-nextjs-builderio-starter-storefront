import loginHandler from '@/lib/api/handlers/login'
import { fetcher } from '@/lib/api/util'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: { userCookieKey: 'KIBO_AT', maxCookieAge: 1000 },
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

const mergedUserCart = { id: 'user-cart', items: [{ id: 'item-guest' }, { id: 'item-user' }] }
const unmergedUserCart = { id: 'user-cart', items: [{ id: 'item-user' }] }

const setup = ({
  ticket = { accessToken: 'guest-claims' },
  guestCart = { id: 'guest-cart', items: [{ id: 'item-guest' }] },
  userCarts = [mergedUserCart],
  deleteResult = true,
}: {
  ticket?: Record<string, unknown>
  guestCart?: { id: string | null; items: { id: string }[] }
  userCarts?: { id: string; items: { id: string }[] }[]
  deleteResult?: boolean | Promise<never>
} = {}) => {
  const remainingUserCarts = [...userCarts]
  const mockFetcher = fetcher as jest.Mock
  mockFetcher.mockImplementation(({ query }: any, { userClaims }: any) => {
    if (/createCustomerAuthTicket/.test(query)) return Promise.resolve(loginResponse)
    if (/deleteCurrentCart/.test(query)) {
      return deleteResult instanceof Promise
        ? deleteResult
        : Promise.resolve({ data: { deleteCurrentCart: deleteResult } })
    }
    if (userClaims === 'guest-claims') return Promise.resolve({ data: { currentCart: guestCart } })
    const userCart =
      remainingUserCarts.length > 1 ? remainingUserCarts.shift() : remainingUserCarts[0]
    return Promise.resolve({ data: { currentCart: userCart } })
  })

  const req: any = {
    body: { query: 'mutation login { account: createCustomerAuthTicket }', variables: {} },
    cookies: { kibo_at: cookie(ticket) },
    headers: {},
    logger: { error: jest.fn(), warn: jest.fn() },
  }
  const json = jest.fn()
  const res: any = { status: jest.fn(() => ({ json })), setHeader: jest.fn() }
  return { req, res, json }
}

const fetcherCalls = (pattern: RegExp) =>
  (fetcher as jest.Mock).mock.calls.filter(([{ query }]) => pattern.test(query))

const deleteCalls = () => fetcherCalls(/deleteCurrentCart/)

describe('[api handlers] login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const runLogin = async (req: any, res: any) => {
    const pending = loginHandler(req, res)
    await jest.runAllTimersAsync()
    await pending
  }

  it('should delete the guest cart with the guest claims once its items are merged', async () => {
    const { req, res } = setup()

    await runLogin(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining('kibo_at='))
    expect(deleteCalls()).toEqual([
      [
        { query: expect.stringContaining('deleteCurrentCart') },
        { userClaims: 'guest-claims', headers: {} },
      ],
    ])
    expect(req.logger.warn).not.toHaveBeenCalled()
  })

  it('should read the guest cart and log in concurrently', async () => {
    const { req, res } = setup()
    const mockFetcher = fetcher as jest.Mock
    const started: string[] = []
    const releases: (() => void)[] = []
    const original = mockFetcher.getMockImplementation() as any
    mockFetcher.mockImplementation((body: any, options: any) => {
      started.push(/createCustomerAuthTicket/.test(body.query) ? 'login' : 'cart')
      if (started.length <= 2) {
        return new Promise((resolve) => releases.push(() => resolve(original(body, options))))
      }
      return original(body, options)
    })

    const pending = loginHandler(req, res)
    await Promise.resolve()
    await Promise.resolve()
    expect(started).toEqual(['cart', 'login'])
    releases.forEach((release) => release())
    await jest.runAllTimersAsync()
    await pending

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('should wait for Kibo to finish merging before deleting the guest cart', async () => {
    const { req, res } = setup({ userCarts: [unmergedUserCart, mergedUserCart] })

    await runLogin(req, res)

    expect(fetcherCalls(/currentCartItems/)).toHaveLength(3)
    expect(deleteCalls()).toHaveLength(1)
    expect(req.logger.warn).not.toHaveBeenCalled()
  })

  it('should keep the guest cart and warn when its items never reach the account cart', async () => {
    const { req, res } = setup({ userCarts: [unmergedUserCart] })

    await runLogin(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(fetcherCalls(/currentCartItems/)).toHaveLength(4)
    expect(deleteCalls()).toHaveLength(0)
    expect(req.logger.warn).toHaveBeenCalledWith('Guest cart left in place after login', {
      guestCartId: 'guest-cart',
      reason: 'not-merged',
    })
    expect(req.logger.error).not.toHaveBeenCalled()
  })

  it('should do nothing when Kibo hands the guest cart over to the account', async () => {
    const { req, res } = setup({
      userCarts: [{ id: 'guest-cart', items: [{ id: 'item-guest' }] }],
    })

    await runLogin(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(deleteCalls()).toHaveLength(0)
    expect(req.logger.warn).not.toHaveBeenCalled()
  })

  it('should not touch any cart when the guest cart is empty', async () => {
    const { req, res } = setup({ guestCart: { id: null, items: [] } })

    await runLogin(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(fetcherCalls(/currentCartItems/)).toHaveLength(1)
    expect(deleteCalls()).toHaveLength(0)
  })

  it('should not touch any cart when the shopper is already signed in', async () => {
    const { req, res } = setup({ ticket: { accessToken: 'guest-claims', userId: 'someone' } })

    await runLogin(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(deleteCalls()).toHaveLength(0)
  })

  it('should still log the shopper in when deleting the guest cart fails', async () => {
    const { req, res } = setup({ deleteResult: Promise.reject(new Error('network down')) })

    await runLogin(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining('kibo_at='))
    expect(req.logger.warn).toHaveBeenCalledWith('Unable to retire guest cart after login', {
      message: 'network down',
    })
  })
})
