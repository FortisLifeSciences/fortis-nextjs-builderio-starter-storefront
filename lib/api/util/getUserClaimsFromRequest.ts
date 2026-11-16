import { ServerResponse } from 'http'
import getConfig from 'next/config'

import { shopperAuthClient } from './api-auth-client'
import { isShopperAuthExpired } from './config-helpers'
import { SESSION_EXPIRED } from '@/lib/constants'
import { decodeParseCookieValue, prepareSetCookieValue } from '@/lib/helpers/cookieHelper'
import type { KiboRequest } from '@/lib/types'

import type { NextApiRequest, NextApiResponse } from 'next'

const { publicRuntimeConfig } = getConfig()

const authCookieName = publicRuntimeConfig.userCookieKey.toLowerCase()
const maxCookieAge = publicRuntimeConfig.maxCookieAge

export interface ResolvedUserClaims {
  userClaims?: string
  sessionExpired: boolean
}

const SESSION_EXPIRED_COOKIE_MAX_AGE = 60 * 60

const authCookie = (value: string) =>
  `${authCookieName}=${value}; HttpOnly; Max-Age=${maxCookieAge}; path=/`

const setAuthCookie = (res: NextApiResponse | ServerResponse, value: string) => {
  res.setHeader('Set-Cookie', authCookie(value))
}

export const resolveUserClaims = async (
  req: NextApiRequest | KiboRequest,
  res: NextApiResponse | ServerResponse
): Promise<ResolvedUserClaims> => {
  if (req.headers['x-vol-exclude-user-claims']) {
    return { sessionExpired: false }
  }
  try {
    const cookies = req?.cookies
    const authTicket = decodeParseCookieValue(cookies[authCookieName])

    if (authTicket && isShopperAuthExpired(authTicket) === false) {
      return { userClaims: authTicket.accessToken, sessionExpired: false }
    }

    if (authTicket) {
      const refreshed = await shopperAuthClient.refreshUserAuth(authTicket)
      if (refreshed?.accessToken) {
        const refreshedTicket = { ...refreshed, accountId: authTicket.accountId }
        setAuthCookie(res, prepareSetCookieValue(refreshedTicket))
        return { userClaims: refreshed.accessToken, sessionExpired: false }
      }
    }

    const anonymousTicket = await shopperAuthClient.anonymousAuth()
    const sessionExpired = Boolean(authTicket?.userId)
    const anonymousCookie = authCookie(prepareSetCookieValue(anonymousTicket))

    res.setHeader(
      'Set-Cookie',
      sessionExpired
        ? [
            anonymousCookie,
            `${SESSION_EXPIRED.COOKIE}=true; Max-Age=${SESSION_EXPIRED_COOKIE_MAX_AGE}; path=/`,
          ]
        : anonymousCookie
    )

    return { userClaims: anonymousTicket.accessToken, sessionExpired }
  } catch (err) {
    console.error(err)
  }
  return { sessionExpired: false }
}

const getUserClaimsFromRequest = async (
  req: NextApiRequest | KiboRequest,
  res: NextApiResponse | ServerResponse
) => {
  const { userClaims } = await resolveUserClaims(req, res)
  return userClaims
}

export default getUserClaimsFromRequest
