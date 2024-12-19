import { renderHook, waitFor } from '@testing-library/react'

import { useUpdateOrderAttributes } from './useUpdateOrderAttributes'
import { orderMock } from '@/__mocks__/stories'
import { createQueryClientWrapper } from '@/__test__/utils/renderWithQueryClient'

describe('[hooks] useCreateOrderAttributes', () => {
  it('should use useUpdateOrderAttributes to update checkout attribute object', async () => {
    const { result } = renderHook(() => useUpdateOrderAttributes(), {
      wrapper: createQueryClientWrapper(),
    })

    result.current.updateOrderAttributes.mutateAsync({
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
      expect(result.current.updateOrderAttributes.data).toStrictEqual(orderMock.checkout)
    })
  })
})
