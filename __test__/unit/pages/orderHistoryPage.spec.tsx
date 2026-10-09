import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { userMock } from '@/__mocks__/stories'
import { createQueryClientWrapper } from '@/__test__/utils'
import OrderHistoryPage, { getServerSideProps } from '@/pages/my-account/order-history/index'

const mockNextI18Next = {
  initialI18nStore: { 'mock-locale': [{}], en: [{}] },
  initialLocale: 'mock-locale',
  userConfig: { i18n: [{}] },
}

jest.mock('@/lib/api/operations', () => ({
  getCurrentUser: jest.fn(() => userMock),
}))

jest.mock('next-i18next/serverSideTranslations', () => ({
  serverSideTranslations: jest.fn(() => Promise.resolve({ _nextI18Next: mockNextI18Next })),
}))

const orderHistoryTemplateMock = () => <div data-testid="orderHistoryTemplate-mock" />
jest.mock(
  '@/components/page-templates/MyAccount/MyAccountOrderHistoryTemplate/MyAccountOrderHistoryTemplate.tsx',
  () => () => orderHistoryTemplateMock()
)

describe('[page] Order History Page', () => {
  it('should run getServerSideProps method', async () => {
    const context = {
      locale: 'mock-locale',
      req: { cookies: { kibo_at: '' } },
    }

    const response = await getServerSideProps(context as any)

    expect(response).toStrictEqual({
      props: {
        customerAccount: userMock.customerAccount,
        _nextI18Next: mockNextI18Next,
      },
    })
  })

  it('should render the Order History page template', () => {
    render(<OrderHistoryPage customerAccount={userMock.customerAccount as any} />, {
      wrapper: createQueryClientWrapper(),
    })

    expect(screen.getByTestId('orderHistoryTemplate-mock')).toBeVisible()
  })
})
