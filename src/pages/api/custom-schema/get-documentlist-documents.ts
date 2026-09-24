import { getDocumentListDocuments } from '@/lib/api/operations'

export default async function handler(req: any, res: any) {
  try {
    const { documentListName, filter } = req.body

    if (!documentListName) {
      return res.status(400).json({ success: false, message: 'DocumentList Name is required' })
    }

    const items = await getDocumentListDocuments(documentListName, filter)
    res.status(200).json({ success: true, response: { items } })
  } catch (error) {
    console.error('Error while fetching the document list data:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
