import { apiAuthClient } from '@/lib/api/util/api-auth-client'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authToken = await apiAuthClient.getAccessToken()
  const { variationProductCode } = req.body

  if (!variationProductCode) {
    return res.status(400).json({ error: 'Missing productCode in request body' })
  }

  const baseUrl = process.env.KIBO_API_HOST
  const priceListCode = process.env.PRICE_LIST_CODE

  const filter = `productCode eq ${variationProductCode}`
  const url = `https://${baseUrl}/api/commerce/catalog/admin/pricelists/${priceListCode}/entries?startIndex=0&pageSize=0&filter=${encodeURIComponent(
    filter
  )}`

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${authToken}`,
    },
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()

    const minQty = data?.items?.[0]?.priceEntries?.[0]?.minQty

    if (minQty === undefined) {
      return res.status(404).json({ error: 'minQty not found in response' })
    }

    res.status(200).json({ minQty })
  } catch (err) {
    console.error('Error fetching price list:', err)
    res.status(500).json({ error: 'Failed to fetch price list entries' })
  }
}
