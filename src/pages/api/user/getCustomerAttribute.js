import { apiAuthClient } from '@/lib/api/util/api-auth-client'

export default async function handler(req, res) {
  const authToken = await apiAuthClient.getAccessToken()
  const { payload } = req.body
  const userId = payload.userId
  const accountId = payload.accountId
  const baseUrl = process.env.KIBO_API_HOST
  const url = `https://${baseUrl}/api/commerce/customer/accounts/${accountId}/attributes?startIndex=0&pageSize=20&userId=${userId}`
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
    })
    const data = await response.json()
    res.status(200).json({
      data: data,
    })
  } catch (error) {
    console.error('Error in Adding Sails Rep', error)
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    })
  }
}
