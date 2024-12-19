import { renderHook, waitFor } from '@testing-library/react'

import { useCreateOrderAttribute } from './useCreateOrderAttribute'
import { orderMock } from '@/__mocks__/stories'
import { createQueryClientWrapper } from '@/__test__/utils/renderWithQueryClient'

describe('[hooks] useCreateOrderAttributes', () => {
  it('should use useCreateOrderAttributes to update checkout attribute object', async () => {
    const { result } = renderHook(() => useCreateOrderAttribute(), {
      wrapper: createQueryClientWrapper(),
    })

    result.current.createOrderAttributes.mutateAsync({
      orderId: 'mock-order-id',
      orderAttributeInput: [
        {
          attributeDefinitionId: 1,
          fullyQualifiedName: 'order-attribute',
          values: ['order-attr-value'],
        },
      ],
    })
    await waitFor(() => {
      expect(result.current.createOrderAttributes.data).toStrictEqual(orderMock.checkout)
    })
  })
})
