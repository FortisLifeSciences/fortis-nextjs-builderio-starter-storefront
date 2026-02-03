import { apiAuthClient } from '@/lib/api/util/api-auth-client'

export default async function handler(req, res) {
  const authToken = await apiAuthClient.getAccessToken()
  // Ensure method is POST
  const { orderPayLoad } = req.body

  console.log('Order Payload', orderPayLoad)

  const baseUrl = process.env.KIBO_API_HOST
  const orderId = orderPayLoad?.orderId

  const url = `https://${baseUrl}/api/commerce/orders/${orderId}`

  console.log('This is URL for order --> ', url)

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
      success: true,
      data: data,
    })
  } catch (error) {
    console.error('Error in Getting Shopper Notes', error)
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    })
  }
}
