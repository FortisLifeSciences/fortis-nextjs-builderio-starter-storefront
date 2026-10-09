import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/react'
import mockRouter from 'next-router-mock'

import CartPage, { getServerSideProps } from '@/pages/cart'

jest.mock('next/router', () => require('next-router-mock'))

const toggleCartDrawer = jest.fn()
jest.mock('@/context', () => ({
  useHeaderContext: () => ({ toggleCartDrawer }),
}))

jest.mock('next-i18next/serverSideTranslations', () => ({
  serverSideTranslations: jest.fn(() => {
    return Promise.resolve({
      _nextI18Next: {
        initialI18nStore: { 'mock-locale': [{}], en: [{}] },
        initialLocale: 'mock-locale',
        userConfig: { i18n: [{}] },
      },
    })
  }),
}))

describe('[page] Cart Page', () => {
  beforeEach(() => {
    toggleCartDrawer.mockClear()
    mockRouter.setCurrentUrl('/cart')
  })

  it('should run getServerSideProps method and only load translations', async () => {
    const response = await getServerSideProps({ locale: 'en' } as any)
    expect(response).toStrictEqual({
      props: {
        _nextI18Next: {
          initialI18nStore: { 'mock-locale': [{}], en: [{}] },
          initialLocale: 'mock-locale',
          userConfig: { i18n: [{}] },
        },
      },
    })
  })

  it('should open the cart side-drawer and redirect home instead of rendering a cart page', async () => {
    render(<CartPage />)

    await waitFor(() => {
      expect(mockRouter.asPath).toBe('/')
    })
    expect(toggleCartDrawer).toHaveBeenCalledWith(true)
  })
})
