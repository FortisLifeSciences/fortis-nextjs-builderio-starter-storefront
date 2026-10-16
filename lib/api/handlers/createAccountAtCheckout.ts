import crypto from 'crypto'
import getConfig from 'next/config'

import { apiAuthClient } from '../util/api-auth-client'
import getUserClaimsFromRequest from '../util/getUserClaimsFromRequest'
import { buildCreateCustomerB2bAccountParams } from '@/lib/helpers/buildCreateCustomerB2bAccountParams'
import { fromBitVectorSetArray } from '@/lib/helpers/fromBitVectorSetArray'
import { NextApiRequestWithLogger } from '@/lib/types'

import type { NextApiResponse } from 'next'

const config = getConfig()
const maxCookieAge = config?.publicRuntimeConfig?.maxCookieAge
const cookieName = config?.publicRuntimeConfig?.userCookieKey?.toLowerCase()

const B2B_ACCOUNT_MAPPING_ENTITY_LIST = 'B2BAccountMapping@fortis'

type KiboResponse = { ok: boolean; status: number; body: any }

const kibo = async (
  method: string,
  path: string,
  body?: unknown,
  userClaims?: string
): Promise<KiboResponse> => {
  const authToken = await apiAuthClient.getAccessToken()
  const response = await fetch(`https://${process.env.KIBO_API_HOST}${path}`, {
    method,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${authToken}`,
      ...(userClaims ? { 'x-vol-user-claims': userClaims } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let parsed: any = null
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    parsed = text
  }
  return { ok: response.ok, status: response.status, body: parsed }
}

const expectOk = (step: string, response: KiboResponse) => {
  if (!response.ok) {
    throw new Error(`${step} failed (${response.status}): ${JSON.stringify(response.body)}`)
  }
  return response.body
}

const hasExistingAccount = async (emailAddress: string) => {
  const accountIds = expectOk(
    'accountsbyuser',
    await kibo(
      'GET',
      `/api/commerce/customer/b2baccounts/accountsbyuser?emailAddress=${encodeURIComponent(
        emailAddress
      )}&getAllAccounts=true`
    )
  )
  const accounts = await Promise.all(
    (Array.isArray(accountIds) ? accountIds : []).map(
      async (accountId: number) =>
        (
          await kibo('GET', `/api/commerce/customer/accounts/${accountId}`)
        ).body
    )
  )
  return accounts.some((account) => account && !account.isAnonymous)
}

const getAccountMappingEntity = async (emailAddress: string) => {
  const domain = emailAddress.slice(emailAddress.indexOf('@') + 1)
  const response = await kibo(
    'GET',
    `/api/platform/entitylists/${B2B_ACCOUNT_MAPPING_ENTITY_LIST}/entities/${encodeURIComponent(
      domain
    )}`
  )
  return response.ok ? response.body : null
}

const createPurchaseOrderAccount = (accountId: number) =>
  kibo('POST', `/api/commerce/customer/accounts/${accountId}/purchaseOrderAccount`, {
    customerPurchaseOrderPaymentTerms: [
      {
        description: '10 Years',
        code: '10-years',
        siteId: parseInt(process.env.KIBO_API_HOST_SiteId as string, 10),
      },
    ],
    accountId,
    isEnabled: true,
    creditLimit: 1000000,
    overdraftAllowanceType: 'Amount',
  })

const generatePassword = () => `${crypto.randomBytes(24).toString('base64url')}Aa1!`

const recreateCheckoutFromCart = async (lockedCheckout: any, userClaims: string) => {
  const cart = expectOk(
    'get cart',
    await kibo('GET', '/api/commerce/carts/current', undefined, userClaims)
  )
  const checkout = expectOk(
    'create checkout',
    await kibo('POST', `/api/commerce/orders?cartId=${cart.id}`, undefined, userClaims)
  )
  expectOk(
    'copy email',
    await kibo(
      'PUT',
      `/api/commerce/orders/${checkout.id}`,
      { ...checkout, email: lockedCheckout.email, customerInteractionType: 'Website' },
      userClaims
    )
  )
  const fulfillmentInfo = lockedCheckout.fulfillmentInfo || {}
  expectOk(
    'copy shipping',
    await kibo(
      'PUT',
      `/api/commerce/orders/${checkout.id}/fulfillmentinfo`,
      {
        fulfillmentContact: fulfillmentInfo.fulfillmentContact,
        shippingMethodCode: fulfillmentInfo.shippingMethodCode,
        shippingMethodName: fulfillmentInfo.shippingMethodName,
      },
      userClaims
    )
  )
  for (const couponCode of lockedCheckout.couponCodes || []) {
    await kibo(
      'PUT',
      `/api/commerce/orders/${checkout.id}/coupons/${encodeURIComponent(couponCode)}`,
      undefined,
      userClaims
    )
  }
  return expectOk(
    'reload checkout',
    await kibo('GET', `/api/commerce/orders/${checkout.id}`, undefined, userClaims)
  )
}

const setUserAuthCookie = (res: NextApiResponse, authTicket: any) => {
  const cookieValue = {
    accessToken: authTicket.accessToken,
    accessTokenExpiration: authTicket.accessTokenExpiration,
    refreshToken: authTicket.refreshToken,
    refreshTokenExpiration: authTicket.refreshTokenExpiration,
    userId: authTicket.customerAccount?.userId ?? authTicket.userId,
    accountId: authTicket.customerAccount?.id,
  }
  const encodedValue = Buffer.from(JSON.stringify(cookieValue)).toString('base64')
  res.setHeader(
    'Set-Cookie',
    `${cookieName}=${encodedValue}; HttpOnly; Max-Age=${maxCookieAge}; path=/`
  )
}

const getBehaviors = (jwtAccessToken?: string) => {
  try {
    const decoded = JSON.parse(
      Buffer.from((jwtAccessToken as string).split('.')[1], 'base64').toString('ascii')
    )
    return fromBitVectorSetArray(decoded['https://www.kibocommerce.com/user_claims'].bv)
  } catch {
    return []
  }
}

export default async function createAccountAtCheckoutHandler(
  req: NextApiRequestWithLogger,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ status: 'failed' })
    return
  }

  const { checkoutId, reCaptchaScore } = req.body || {}
  const userClaims = await getUserClaimsFromRequest(req, res)
  if (!checkoutId || !userClaims) {
    res.status(200).json({ status: 'guest' })
    return
  }

  const checkoutResponse = await kibo(
    'GET',
    `/api/commerce/orders/${checkoutId}`,
    undefined,
    userClaims
  )
  const checkout = checkoutResponse.body
  const contact = checkout?.fulfillmentInfo?.fulfillmentContact
  const emailAddress = checkout?.email
  if (
    !checkoutResponse.ok ||
    checkout?.status !== 'Pending' ||
    checkout?.customerAccountId ||
    !emailAddress ||
    !contact?.companyOrOrganization
  ) {
    res.status(200).json({ status: 'guest' })
    return
  }

  let accountId: number | undefined
  let isAttached = false

  try {
    if (await hasExistingAccount(emailAddress)) {
      res.status(200).json({ status: 'exists' })
      return
    }

    const entity = await getAccountMappingEntity(emailAddress)
    const params = buildCreateCustomerB2bAccountParams({
      firstName: contact.firstName,
      lastName: contact.lastNameOrSurname,
      companyOrOrganization: contact.companyOrOrganization,
      emailAddress,
    })
    const createdAccount = expectOk(
      'create account',
      await kibo('POST', '/api/commerce/customer/b2baccounts', {
        ...params.b2BAccountInput,
        ...(entity?.externalID ? { externalId: entity.externalID } : {}),
        ...(reCaptchaScore !== undefined && reCaptchaScore !== null
          ? {
              attributes: [
                {
                  fullyQualifiedName: 'tenant~recaptcha-score',
                  values: [reCaptchaScore],
                },
              ],
            }
          : {}),
      })
    )
    accountId = createdAccount.id
    const userId = createdAccount.users?.[0]?.userId

    expectOk(
      'add sales rep',
      await kibo('POST', `/api/commerce/customer/b2baccounts/${accountId}/addsalesreps`, [
        process.env.SalesRep_Id,
      ])
    )

    expectOk(
      'attach checkout',
      await kibo(
        'PUT',
        `/api/commerce/orders/${checkoutId}`,
        { ...checkout, customerAccountId: accountId },
        userClaims
      )
    )
    isAttached = true

    const approvedAccount = expectOk(
      'approve account',
      await kibo('PUT', `/api/commerce/customer/b2baccounts/${accountId}/status/approve`)
    )

    const password = generatePassword()
    expectOk(
      'set password',
      await kibo(
        'POST',
        `/api/commerce/customer/accounts/${accountId}/Change-password?unlockAccount=true&userId=${userId}`,
        { newPassword: password }
      )
    )

    const authTicket = expectOk(
      'login',
      await kibo('POST', '/api/commerce/customer/authtickets', {
        username: emailAddress,
        password,
      })
    )

    expectOk(
      'reload checkout',
      await kibo('GET', `/api/commerce/orders/${checkoutId}`, undefined, authTicket.accessToken)
    )

    if (entity?.creditLine === true || entity?.creditLine === 'true') {
      const purchaseOrderAccount = await createPurchaseOrderAccount(accountId as number)
      if (!purchaseOrderAccount.ok) {
        req.logger.error(purchaseOrderAccount.body, 'Purchase order account creation failed')
      }
    }

    setUserAuthCookie(res, authTicket)
    res.status(200).json({
      status: 'created',
      checkoutId,
      account: approvedAccount,
      customerAccount: authTicket.customerAccount,
      behaviors: getBehaviors(authTicket.jwtAccessToken),
    })
  } catch (error: any) {
    req.logger.error(error, 'Account creation at checkout failed')

    if (!isAttached) {
      if (accountId) await kibo('DELETE', `/api/commerce/customer/accounts/${accountId}`)
      res.status(200).json({ status: 'guest' })
      return
    }

    try {
      await kibo('POST', `/api/commerce/orders/${checkoutId}/actions`, {
        actionName: 'AbandonOrder',
      })
      await kibo('DELETE', `/api/commerce/customer/accounts/${accountId}`)
      const recoveredCheckout = await recreateCheckoutFromCart(checkout, userClaims)
      res.status(200).json({ status: 'guest', checkoutId: recoveredCheckout.id })
    } catch (recoveryError: any) {
      req.logger.error(recoveryError, 'Checkout recovery failed')
      res.status(200).json({ status: 'failed' })
    }
  }
}
