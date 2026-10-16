import { apiAuthClient } from '@/lib/api/util/api-auth-client'

export default async function handler(req, res) {
  const authToken = await apiAuthClient.getAccessToken()
  const { emailAddress } = req.body
  const email = encodeURIComponent(emailAddress)
  const baseUrl = process.env.KIBO_API_HOST
  const url = `https://${baseUrl}/api/commerce/customer/b2baccounts/accountsbyuser?emailAddress=${email}&getAllAccounts=true`

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
    const accountIds = await response.json()
    const accounts = await Promise.all(
      (Array.isArray(accountIds) ? accountIds : []).map((accountId) =>
        fetch(`https://${baseUrl}/api/commerce/customer/accounts/${accountId}`, {
          headers: {
            accept: 'application/json',
            authorization: `Bearer ${authToken}`,
          },
        }).then((accountResponse) => accountResponse.json())
      )
    )
    const success = accounts.some((account) => !account?.isAnonymous)
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
