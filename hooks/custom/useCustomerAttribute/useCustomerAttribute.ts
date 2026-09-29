import { useCallback, useEffect, useState } from 'react'

interface AuditInfo {
  updateDate: string
  createDate: string
  updateBy: string
  createBy: string
}

export interface CustomerAttribute {
  auditInfo: AuditInfo
  fullyQualifiedName: string
  attributeDefinitionId: number
  values: string[]
}

interface UseCustomerAttributeParams {
  userId?: string | null
  accountId?: number | null
  attributeFqn: string
}

export const useCustomerAttribute = (params: UseCustomerAttributeParams) => {
  const { userId, accountId, attributeFqn } = params

  const [attribute, setAttribute] = useState<CustomerAttribute | null>(null)
  const [value, setValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchAttribute = useCallback(async () => {
    if (!accountId || !userId) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/getCustomerAttribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: { userId, accountId, attributeFqn } }),
      })

      const attributeDetails = await response.json()

      setValue(attributeDetails?.data?.values?.[0] ?? '')
      setAttribute(attributeDetails?.data ?? null)
    } catch (error) {
      console.error(`Error fetching customer attribute ${attributeFqn}:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, accountId, attributeFqn])

  useEffect(() => {
    fetchAttribute()
  }, [fetchAttribute])

  const saveAttribute = useCallback(
    async (newValue: string) => {
      if (!accountId || !userId) return

      const isExisting = attribute?.fullyQualifiedName === attributeFqn
      const endpoint = isExisting
        ? '/api/user/updateCustomerAttribute'
        : '/api/addCustomerAttribute'

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Payload: {
              userId,
              accountId,
              attributeFqn: attribute?.fullyQualifiedName || attributeFqn,
              attributeDefinitionId: attribute?.attributeDefinitionId,
              value: newValue,
            },
          }),
        })

        const attributeDetails = await response.json()

        setValue(attributeDetails?.data?.values?.[0] ?? '')
        setAttribute(attributeDetails?.data ?? attribute)
      } catch (error) {
        console.error(`Error saving customer attribute ${attributeFqn}:`, error)
      }
    },
    [userId, accountId, attributeFqn, attribute]
  )

  return { value, attribute, isLoading, saveAttribute, refetch: fetchAttribute }
}
