import { apiAuthClient } from '@/lib/api/util/api-auth-client'

export default async function handler(req, res) {
  const authToken = await apiAuthClient.getAccessToken()
  const { emailAddress } = req.body
  const baseUrl = process.env.KIBO_API_HOST
  const url = `https://${baseUrl}/api/commerce/customer/b2baccounts/accountsbyuser?emailAddress=${emailAddress}&getAllAccounts=true`

  try {
    // Make the request to Add Sails Rep
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
    })
    const data = await response.json()
    const success = data.length > 0 ? true : false
    res.status(200).json({
      success: success,
    })
  } catch (error) {
    console.error('Error in Adding Sails Rep', error)
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    })
  }
}
