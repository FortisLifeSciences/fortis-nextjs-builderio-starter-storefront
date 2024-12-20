import { apiAuthClient } from '@/lib/api/util/api-auth-client'

export default async function handler(req, res) {
  const authToken = await apiAuthClient.getAccessToken()
  const { Payload } = req.body
  const userId = Payload.userId
  const accountId = Payload.accountId
  const attributeFqn = Payload.attributeFqn
  const attributeDefinitionId = Payload.attributeDefinitionId
  const baseUrl = process.env.KIBO_API_HOST
  const url = `https://${baseUrl}/api/commerce/customer/accounts/${accountId}/attributes/${attributeFqn}?userId=${userId}`
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fullyQualifiedName: attributeFqn,
        attributeDefinitionId: attributeDefinitionId,
        values: [String(Payload?.value)],
      }),
    })
    const data = await response.json()
    const success = data?.fullyQualifiedName === attributeFqn ? true : false
    res.status(200).json({
      success: success,
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
