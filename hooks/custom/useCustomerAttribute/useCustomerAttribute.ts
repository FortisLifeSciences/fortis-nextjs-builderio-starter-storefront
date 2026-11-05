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
  const [isSaving, setIsSaving] = useState<boolean>(false)

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
      const savedAttribute = attributeDetails?.data

      if (savedAttribute?.fullyQualifiedName === attributeFqn) {
        setValue(savedAttribute?.values?.[0] ?? '')
        setAttribute(savedAttribute)
      } else {
        setValue('')
        setAttribute(null)
      }
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
      if (!accountId || !userId) return false

      const previousValue = value
      const previousAttribute = attribute

      const isExisting = previousAttribute?.fullyQualifiedName === attributeFqn
      const endpoint = isExisting
        ? '/api/user/updateCustomerAttribute'
        : '/api/addCustomerAttribute'

      setValue(newValue)
      setIsSaving(true)

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Payload: {
              userId,
              accountId,
              attributeFqn: previousAttribute?.fullyQualifiedName || attributeFqn,
              attributeDefinitionId: previousAttribute?.attributeDefinitionId,
              value: newValue,
            },
          }),
        })

        const attributeDetails = await response.json()
        const savedAttribute = attributeDetails?.data

        if (!response.ok || savedAttribute?.fullyQualifiedName !== attributeFqn) {
          setValue(previousValue)
          setAttribute(previousAttribute)
          return false
        }

        setValue(savedAttribute?.values?.[0] ?? newValue)
        setAttribute(savedAttribute)
        return true
      } catch (error) {
        console.error(`Error saving customer attribute ${attributeFqn}:`, error)
        setValue(previousValue)
        setAttribute(previousAttribute)
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [userId, accountId, attributeFqn, attribute, value]
  )

  return { value, attribute, isLoading, isSaving, saveAttribute, refetch: fetchAttribute }
}
