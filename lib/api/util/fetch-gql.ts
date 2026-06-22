import vercelFetch from '@vercel/fetch'

import { apiAuthClient } from './api-auth-client'
import { getGraphqlUrl } from './config-helpers'

const fetch = vercelFetch()

const fetcher = async ({ query, variables }: any, options: any) => {
  const authToken = await apiAuthClient.getAccessToken()
  const response = await fetch(getGraphqlUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'x-vol-site': process.env.KIBO_SITE_ID,
      'x-vol-tenant': process.env.KIBO_TENANT_ID,
      'x-vol-user-claims': options?.userClaims,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
  return await response.json()
}
export default fetcher
