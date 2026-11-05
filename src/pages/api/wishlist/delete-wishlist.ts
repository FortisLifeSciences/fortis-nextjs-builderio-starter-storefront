import { getAdditionalHeader } from '@/lib/api/util'
import { apiAuthClient } from '@/lib/api/util/api-auth-client'

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { wishlistId } = req.query

    if (!wishlistId || typeof wishlistId !== 'string') {
      return res.status(400).json({ success: false, message: 'Wishlist ID is required' })
    }

    const authToken = await apiAuthClient.getAccessToken()
    const headers = getAdditionalHeader(req)

    const url = `https://${process.env.KIBO_API_HOST}/api/commerce/wishlists/${wishlistId}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${authToken}`,
        ...headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData?.message || `Failed to delete wishlist: ${response.statusText}`,
        code: response.status,
        errorCode: errorData?.items?.[0]?.errorCode,
        correlation: response.headers.get('x-vol-correlation'),
      }
    }

    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Error while deleting the wishlist:', error)
    res.status(error?.code || 500).json({
      message: error?.message || 'Internal server error',
      errorCode: error?.errorCode,
      correlation: error?.correlation,
      success: false,
    })
  }
}
