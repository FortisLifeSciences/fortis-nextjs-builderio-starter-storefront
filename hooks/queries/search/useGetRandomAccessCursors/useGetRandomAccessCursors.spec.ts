import { renderHook } from '@testing-library/react-hooks'

import { getRandomAccessCursorsResult } from './useGetRandomAccessCursors'
import { randomAccessCursorMock } from '@/__mocks__/stories/randomAccessCursorsMock'

describe('[hooks] getRandomAccessCursorsResult', () => {
  it('should return search random access cursors', async () => {
    const result = await getRandomAccessCursorsResult()
    expect(result).toEqual(randomAccessCursorMock)
  })
})
