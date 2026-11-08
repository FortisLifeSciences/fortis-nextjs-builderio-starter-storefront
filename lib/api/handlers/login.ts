import getConfig from 'next/config'

import { fetcher, getAdditionalHeader } from '../util'
import { apiAuthClient } from '../util/api-auth-client'
import getUserClaimsFromRequest from '../util/getUserClaimsFromRequest'
import { fromBitVectorSetArray } from '@/lib/helpers'
import { decodeParseCookieValue } from '@/lib/helpers/cookieHelper'
import { NextApiRequestWithLogger } from '@/lib/types'

import type { NextApiResponse } from 'next'

const config = getConfig()
const maxCookieAge = config?.publicRuntimeConfig?.maxCookieAge
const cookieName = config?.publicRuntimeConfig.userCookieKey.toLowerCase()

const currentCartItemsQuery = /* GraphQL */ `
  query currentCartItems {
    currentCart {
      id
      items {
        id
      }
    }
  }
`

type GuestCart = { id: string; itemIds: string[] }

const getCurrentCart = async (userClaims: string | undefined, headers: any) => {
  const response = await fetcher({ query: currentCartItemsQuery }, { userClaims, headers })
  const cart = response?.data?.currentCart
  return {
    id: cart?.id as string | undefined,
    itemIds: ((cart?.items || []) as { id: string }[]).map((item) => item.id),
  }
}

const getGuestCart = async (
  req: NextApiRequestWithLogger,
  userClaims: string | undefined,
  headers: any
): Promise<GuestCart | undefined> => {
  const ticket = decodeParseCookieValue(req.cookies?.[cookieName])
  if (!userClaims || ticket?.userId) return
  const cart = await getCurrentCart(userClaims, headers)
  if (!cart.id || cart.itemIds.length === 0) return
  return { id: cart.id, itemIds: cart.itemIds }
}

const retireGuestCart = async (guestCart: GuestCart, userClaims: string, headers: any) => {
  const userCart = await getCurrentCart(userClaims, headers)
  const isMerged = guestCart.itemIds.every((itemId) => userCart.itemIds.includes(itemId))
  if (!isMerged || userCart.id === guestCart.id) return false
  const authToken = await apiAuthClient.getAccessToken()
  const response = await fetch(
    `https://${process.env.KIBO_API_HOST}/api/commerce/carts/${guestCart.id}`,
    { method: 'DELETE', headers: { authorization: `Bearer ${authToken}` } }
  )
  return response.ok
}

export default async function loginHandler(req: NextApiRequestWithLogger, res: NextApiResponse) {
  try {
    const { query, variables } = req.body
    const userClaims = await getUserClaimsFromRequest(req, res)
    const headers = getAdditionalHeader(req)
    const guestCart = await getGuestCart(req, userClaims, headers).catch((error) => {
      req.logger.error('Unable to read guest cart before login', { message: error?.message })
      return undefined
    })
    const response = await fetcher({ query, variables }, { userClaims, headers })
    if (response?.errors) {
      throw {
        message: response?.errors[0]?.extensions?.response?.body?.message,
        code: response?.errors[0].extensions.response.status,
      }
    }

    // set HTTP cookie
    const account = response?.data?.account
    const userId = response?.data?.account?.customerAccount?.userId
    const jwtAccessToken = response?.data?.account?.jwtAccessToken
    const decoded = JSON.parse(
      Buffer.from(jwtAccessToken?.split('.')[1], 'base64').toString('ascii')
    )
    const bv = decoded['https://www.kibocommerce.com/user_claims'].bv
    const behaviors = fromBitVectorSetArray(bv)
    const cookieValue = {
      accessToken: account?.accessToken,
      accessTokenExpiration: account?.accessTokenExpiration,
      refreshToken: account?.refreshToken,
      refreshTokenExpiration: account?.refreshTokenExpiration,
      userId: userId,
      accountId: account?.customerAccount?.id,
    }
    const encodedValue = Buffer.from(JSON.stringify(cookieValue)).toString('base64')
    // set cookie
    if (userId && guestCart && account?.accessToken) {
      try {
        const isRetired = await retireGuestCart(guestCart, account.accessToken, headers)
        if (!isRetired) {
          req.logger.error('Guest cart was not merged into the account cart; left in place', {
            guestCartId: guestCart.id,
          })
        }
      } catch (error: any) {
        req.logger.error('Unable to retire guest cart after login', { message: error?.message })
      }
    }
    if (userId) {
      res.setHeader(
        'Set-Cookie',
        `${cookieName}=${encodedValue}; HttpOnly; Max-Age=${maxCookieAge}; path=/`
      )
    }
    // response object
    const successResponse = {
      data: {
        account: {
          customerAccount: response?.data?.account?.customerAccount,
          behaviors,
        },
      },
    }
    // response status
    const loginResponse = userId ? successResponse : response
    // send response
    res.status(200).json(loginResponse)
  } catch (error: any) {
    res.status(error?.code).json({ message: error?.message })
    req.logger.error('Error in Login handler', { message: error?.message, code: error?.code })
  }
}
