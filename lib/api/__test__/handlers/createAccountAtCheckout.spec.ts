import createAccountAtCheckoutHandler from '@/lib/api/handlers/createAccountAtCheckout'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: { userCookieKey: 'KIBO_AT', maxCookieAge: 1000 },
}))

jest.mock('@/lib/api/util/api-auth-client', () => ({
  apiAuthClient: { getAccessToken: jest.fn(() => Promise.resolve('app-token')) },
}))

jest.mock('@/lib/api/util/getUserClaimsFromRequest', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve('shopper-claims')),
}))

const checkout = {
  id: 'checkout-1',
  status: 'Pending',
  email: 'buyer@acme.com',
  total: 25,
  couponCodes: ['SAVE10'],
  fulfillmentInfo: {
    fulfillmentContact: {
      firstName: 'Ada',
      lastNameOrSurname: 'Lovelace',
      companyOrOrganization: 'Acme',
    },
    shippingMethodCode: 'ship-code',
    shippingMethodName: 'Fortis Shipping',
  },
}

const jwt = `x.${Buffer.from(
  JSON.stringify({ 'https://www.kibocommerce.com/user_claims': { bv: [] } })
).toString('base64')}.y`

type Call = { method: string; path: string; body: any; claims?: string }

const setupKibo = (failAt?: string, overrides: Record<string, any> = {}) => {
  const calls: Call[] = []
  const reply = (status: number, body: any) =>
    Promise.resolve({
      ok: status < 300,
      status,
      text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
    })

  global.fetch = jest.fn((url: string, init: any) => {
    const path = url.replace(/^https:\/\/[^/]+/, '')
    const method = init.method
    calls.push({
      method,
      path,
      body: init.body ? JSON.parse(init.body) : undefined,
      claims: init.headers['x-vol-user-claims'],
    })
    const routes: [string, RegExp, string, () => any][] = [
      ['GET', /^\/api\/commerce\/orders\/checkout-1$/, 'read checkout', () => checkout],
      ['GET', /accountsbyuser/, 'existence', () => overrides.accountIds ?? []],
      ['GET', /^\/api\/commerce\/customer\/accounts\/\d+$/, 'account', () => overrides.account],
      ['GET', /entitylists/, 'entity', () => ({ externalID: 'EXT-1', creditLine: false })],
      [
        'POST',
        /\/customer\/b2baccounts$/,
        'create account',
        () => ({ id: 501, users: [{ userId: 'user-501' }] }),
      ],
      ['POST', /addsalesreps/, 'add sales rep', () => ({})],
      ['PUT', /^\/api\/commerce\/orders\/checkout-1$/, 'attach checkout', () => checkout],
      ['PUT', /status\/approve/, 'approve account', () => ({ id: 501, users: [] })],
      ['POST', /Change-password/, 'set password', () => undefined],
      [
        'POST',
        /customer\/authtickets/,
        'login',
        () => ({
          accessToken: 'user-token',
          refreshToken: 'refresh',
          customerAccount: { id: 501, userId: 'user-501' },
          jwtAccessToken: jwt,
        }),
      ],
      ['POST', /checkout-1\/actions/, 'abandon', () => ({ status: 'Abandoned' })],
      ['DELETE', /customer\/accounts\/501/, 'delete account', () => undefined],
      ['GET', /carts\/current/, 'cart', () => ({ id: 'cart-1' })],
      ['POST', /orders\?cartId=cart-1/, 'new checkout', () => ({ id: 'checkout-2' })],
      ['PUT', /orders\/checkout-2/, 'copy', () => ({ id: 'checkout-2' })],
      ['GET', /orders\/checkout-2/, 'reload new', () => ({ id: 'checkout-2', total: 25 })],
    ]
    const route = routes.find(([m, pattern]) => m === method && pattern.test(path))
    if (!route) return reply(404, { message: `unexpected ${method} ${path}` })
    if (route[2] === failAt) return reply(500, { message: 'boom' })
    return reply(200, route[3]())
  }) as any
  return calls
}

const run = async () => {
  const headers: Record<string, string> = {}
  let payload: any
  const res: any = {
    setHeader: (name: string, value: string) => (headers[name] = value),
    status: () => res,
    json: (body: any) => (payload = body),
  }
  const req: any = {
    method: 'POST',
    body: { checkoutId: 'checkout-1', reCaptchaScore: 0.9 },
    logger: { error: jest.fn() },
  }
  await createAccountAtCheckoutHandler(req, res)
  return { payload, headers }
}

const did = (calls: Call[], method: string, pattern: RegExp) =>
  calls.some((call) => call.method === method && pattern.test(call.path))

describe('[handlers] createAccountAtCheckout', () => {
  it('creates the account, attaches the checkout as the shopper and signs the user in', async () => {
    const calls = setupKibo()
    const { payload, headers } = await run()

    expect(payload.status).toBe('created')
    expect(payload.customerAccount.id).toBe(501)
    expect(payload.checkoutId).toBe('checkout-1')
    expect(payload.checkout).toBeUndefined()
    const attach = calls.find((c) => c.method === 'PUT' && /orders\/checkout-1$/.test(c.path))
    expect(attach?.claims).toBe('shopper-claims')
    expect(attach?.body.customerAccountId).toBe(501)
    const order = calls.map((c) => `${c.method} ${c.path}`)
    expect(order.findIndex((c) => /addsalesreps/.test(c))).toBeLessThan(
      order.findIndex((c) => /PUT \/api\/commerce\/orders\/checkout-1$/.test(c))
    )
    expect(order.findIndex((c) => /PUT \/api\/commerce\/orders\/checkout-1$/.test(c))).toBeLessThan(
      order.findIndex((c) => /status\/approve/.test(c))
    )
    const created = calls.find((c) => /\/customer\/b2baccounts$/.test(c.path))
    expect(created?.body.externalId).toBe('EXT-1')
    expect(created?.body.attributes[0].values).toEqual([0.9])
    expect(headers['Set-Cookie']).toMatch(/^kibo_at=.+; HttpOnly/)
  })

  it('returns exists and creates nothing when the email already has an account', async () => {
    const calls = setupKibo(undefined, { accountIds: [7], account: { isAnonymous: false } })
    const { payload, headers } = await run()

    expect(payload.status).toBe('exists')
    expect(did(calls, 'POST', /\/customer\/b2baccounts$/)).toBe(false)
    expect(headers['Set-Cookie']).toBeUndefined()
  })

  it('ignores anonymous guest records in the existence check', async () => {
    setupKibo(undefined, { accountIds: [7], account: { isAnonymous: true } })
    const { payload } = await run()

    expect(payload.status).toBe('created')
  })

  it('deletes the new account and continues as guest when a step before the attach fails', async () => {
    const calls = setupKibo('add sales rep')
    const { payload } = await run()

    expect(payload).toEqual({ status: 'guest' })
    expect(did(calls, 'DELETE', /customer\/accounts\/501/)).toBe(true)
    expect(did(calls, 'PUT', /orders\/checkout-1$/)).toBe(false)
  })

  it.each(['approve account', 'set password', 'login'])(
    'recovers a fresh guest checkout when "%s" fails after the attach',
    async (failingStep) => {
      const calls = setupKibo(failingStep)
      const { payload, headers } = await run()

      expect(payload.status).toBe('guest')
      expect(payload.checkoutId).toBe('checkout-2')
      const abandon = calls.find((c) => /checkout-1\/actions/.test(c.path))
      expect(abandon?.body).toEqual({ actionName: 'AbandonOrder' })
      expect(did(calls, 'DELETE', /customer\/accounts\/501/)).toBe(true)
      const shipping = calls.find((c) => /checkout-2\/fulfillmentinfo/.test(c.path))
      expect(shipping?.body.shippingMethodCode).toBe('ship-code')
      expect(shipping?.claims).toBe('shopper-claims')
      expect(did(calls, 'PUT', /checkout-2\/coupons\/SAVE10/)).toBe(true)
      expect(headers['Set-Cookie']).toBeUndefined()
    }
  )

  it('reports failed when the recovery itself fails', async () => {
    setupKibo('login')
    const original = global.fetch as jest.Mock
    global.fetch = jest.fn((url: string, init: any) =>
      /carts\/current/.test(url)
        ? Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve('{}') })
        : original(url, init)
    ) as any
    const { payload } = await run()

    expect(payload).toEqual({ status: 'failed' })
  })

  it('does nothing when the shopper cannot read the checkout', async () => {
    const calls = setupKibo('read checkout')
    const { payload } = await run()

    expect(payload).toEqual({ status: 'guest' })
    expect(did(calls, 'POST', /\/customer\/b2baccounts$/)).toBe(false)
  })
})
