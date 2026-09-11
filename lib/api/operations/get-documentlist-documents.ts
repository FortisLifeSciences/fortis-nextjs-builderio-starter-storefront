import { apiAuthClient } from '@/lib/api/util/api-auth-client'

export default async function getDocumentListDocuments(
  documentListName: string,
  filter: string
): Promise<any[]> {
  if (!documentListName) return []

  const authToken = await apiAuthClient.getAccessToken()
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
  return data?.items ?? []
}
