import getUserClaimsFromRequest, {
  resolveUserClaims,
} from '@/lib/api/util/getUserClaimsFromRequest'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: { userCookieKey: 'KIBO_AT', maxCookieAge: 432000 },
}))

const mockRefreshUserAuth = jest.fn()
const mockAnonymousAuth = jest.fn()

jest.mock('@/lib/api/util/api-auth-client', () => ({
  shopperAuthClient: {
    refreshUserAuth: (...args: any[]) => mockRefreshUserAuth(...args),
    anonymousAuth: (...args: any[]) => mockAnonymousAuth(...args),
  },
}))

const encode = (value: any) => Buffer.from(JSON.stringify(value)).toString('base64')
const decode = (value: string) => JSON.parse(Buffer.from(value, 'base64').toString('ascii'))

const past = () => new Date(Date.now() - 60_000).toISOString()
const future = () => new Date(Date.now() + 60_000).toISOString()

const anonymousTicket = {
  accessToken: 'anon-token',
  accessTokenExpiration: future(),
  refreshToken: 'anon-refresh',
  refreshTokenExpiration: future(),
}

const customerTicket = (overrides: Record<string, any> = {}) => ({
  accessToken: 'customer-token',
  accessTokenExpiration: future(),
  refreshToken: 'customer-refresh',
  refreshTokenExpiration: future(),
  userId: 'user-1',
  accountId: 1001,
  ...overrides,
})

const setup = (ticket?: Record<string, any>, headers: Record<string, string> = {}) => {
  const req: any = { headers, cookies: ticket ? { kibo_at: encode(ticket) } : {} }
  const res: any = { setHeader: jest.fn() }
  return { req, res }
}

const setCookieHeaders = (res: any): string[] => {
  const [name, header] = res.setHeader.mock.calls[0]
  expect(name).toBe('Set-Cookie')
  return Array.isArray(header) ? header : [header]
}

const cookieFrom = (res: any) => {
  const [pair, ...attributes] = setCookieHeaders(res)[0]
    .split(';')
    .map((part: string) => part.trim())
  return { value: decode(pair.replace('kibo_at=', '')), attributes }
}

describe('[lib/api/util] getUserClaimsFromRequest', () => {
  beforeEach(() => {
    mockRefreshUserAuth.mockReset()
    mockAnonymousAuth.mockReset().mockResolvedValue(anonymousTicket)
  })

  it('returns the current token without touching the cookie when it has not expired', async () => {
    const { req, res } = setup(customerTicket())

    await expect(resolveUserClaims(req, res)).resolves.toEqual({
      userClaims: 'customer-token',
      sessionExpired: false,
    })
    expect(mockRefreshUserAuth).not.toHaveBeenCalled()
    expect(res.setHeader).not.toHaveBeenCalled()
  })

  it('refreshes an expired customer ticket and keeps the account id', async () => {
    const { req, res } = setup(customerTicket({ accessTokenExpiration: past() }))
    mockRefreshUserAuth.mockResolvedValue(
      customerTicket({ accessToken: 'refreshed-token', accountId: undefined })
    )

    await expect(resolveUserClaims(req, res)).resolves.toEqual({
      userClaims: 'refreshed-token',
      sessionExpired: false,
    })
    const cookie = cookieFrom(res)
    expect(cookie.value).toMatchObject({ accessToken: 'refreshed-token', accountId: 1001 })
    expect(cookie.attributes).toEqual(['HttpOnly', 'Max-Age=432000', 'path=/'])
  })

  it('flags the session as expired and never reuses the dead token when a customer refresh fails', async () => {
    const { req, res } = setup(customerTicket({ accessTokenExpiration: past() }))
    mockRefreshUserAuth.mockResolvedValue({})

    await expect(resolveUserClaims(req, res)).resolves.toEqual({
      userClaims: 'anon-token',
      sessionExpired: true,
    })
    const cookie = cookieFrom(res)
    expect(cookie.value).toEqual(anonymousTicket)
    expect(cookie.attributes).toEqual(['HttpOnly', 'Max-Age=432000', 'path=/'])
    expect(setCookieHeaders(res)[1]).toBe('session_expired=true; Max-Age=3600; path=/')
  })

  it('silently replaces an expired anonymous ticket when its refresh fails', async () => {
    const { req, res } = setup({ ...anonymousTicket, accessTokenExpiration: past() })
    mockRefreshUserAuth.mockResolvedValue({})

    await expect(resolveUserClaims(req, res)).resolves.toEqual({
      userClaims: 'anon-token',
      sessionExpired: false,
    })
    expect(setCookieHeaders(res)).toHaveLength(1)
    expect(cookieFrom(res).value).toEqual(anonymousTicket)
  })

  it('creates an anonymous ticket when there is no cookie', async () => {
    const { req, res } = setup()

    await expect(resolveUserClaims(req, res)).resolves.toEqual({
      userClaims: 'anon-token',
      sessionExpired: false,
    })
    expect(mockRefreshUserAuth).not.toHaveBeenCalled()
    expect(cookieFrom(res).value).toEqual(anonymousTicket)
  })

  it('skips user claims when the request opts out', async () => {
    const { req, res } = setup(customerTicket(), { 'x-vol-exclude-user-claims': 'true' })

    await expect(resolveUserClaims(req, res)).resolves.toEqual({ sessionExpired: false })
    expect(res.setHeader).not.toHaveBeenCalled()
  })

  it('default export returns only the claims', async () => {
    const { req, res } = setup(customerTicket({ accessTokenExpiration: past() }))
    mockRefreshUserAuth.mockResolvedValue({})

    await expect(getUserClaimsFromRequest(req, res)).resolves.toBe('anon-token')
  })
})
