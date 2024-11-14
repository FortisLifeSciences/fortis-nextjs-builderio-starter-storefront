import { apiAuthClient } from '@/lib/api/util/api-auth-client'

export default async function handler(req: any, res: any) {
  try {
    const authToken = await apiAuthClient.getAccessToken()
    const { documentListName, filter } = req.body

    if (!documentListName) {
      return res.status(400).json({ success: false, message: 'DocumentList Name is required' })
    }

    const url = `https://${process.env.KIBO_API_HOST}/api/content/documentlists/${documentListName}/documents?filter=${filter}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get document list data: ${response.statusText}`)
    }

    const data = await response.json()
    res.status(200).json({ success: true, response: data })
  } catch (error) {
    console.error('Error while fetching the document list data:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
