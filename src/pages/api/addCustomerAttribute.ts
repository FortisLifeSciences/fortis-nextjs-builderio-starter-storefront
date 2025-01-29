import { apiAuthClient } from '@/lib/api/util/api-auth-client'

export default async function handler(req: any, res: any) {
  try {
    const authToken = await apiAuthClient.getAccessToken()

    const { Payload } = req.body

    const { userId, accountId, attributeFqn, value } = Payload

    const baseUrl = process.env.KIBO_API_HOST
    const url = `https://${baseUrl}/api/commerce/customer/accounts/${accountId}/attributes?userId=${userId}`

    const payload = {
      fullyQualifiedName: attributeFqn,
      values: [value],
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    const success = data?.fullyQualifiedName === attributeFqn

    res.status(200).json({
      success,
      data,
    })
  } catch (error) {
    console.error('Error in Adding Sails Rep', error)

    res.status(500).json({
      message: 'Internal server error',
      success: false,
    })
  }
}
