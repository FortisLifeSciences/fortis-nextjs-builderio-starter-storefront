import '@testing-library/jest-dom'
import { useRouter } from 'next/router' // Import useRouter from next/router

import { useUpdateRoutes } from './useUpdateRoutes'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const push = jest.fn()

// Cast useRouter to jest.Mock to enable mockImplementation
const mockedUseRouter = useRouter as jest.Mock

mockedUseRouter.mockImplementation(() => ({
  query: { categoryCode: '41', filters: 'Tenant~color:black,Tenant~color:blue' },
  push,
}))

describe('useUpdateRoutes', () => {
  const { updateRoute } = useUpdateRoutes()

  it('should add the filter to the url if filter is not present', () => {
    updateRoute('Tenant~color:black')
    expect(push).toHaveBeenCalledWith(
      {
        pathname: undefined,
        query: { categoryCode: '41', filters: 'Tenant~color:blue' },
      },
      undefined,
      { scroll: false, shallow: true }
    )
  })

  it('should remove the filter from the url if filter is present', () => {
    updateRoute('Tenant~color:red')
    expect(push).toHaveBeenCalled()
  })

  it('should remove all the filters', () => {
    updateRoute('')
    expect(push).toHaveBeenCalled()
  })
})
