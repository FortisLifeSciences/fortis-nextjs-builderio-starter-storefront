import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import MyAccountPage, { getServerSideProps } from '@/pages/my-account/index'

describe('[page] MyAccount Page', () => {
  it('should redirect to the account information page', async () => {
    const response = await getServerSideProps({} as any)

    expect(response).toStrictEqual({
      redirect: {
        destination: '/my-account/account-information',
        permanent: false,
      },
    })
  })

  it('should render nothing', () => {
    const { container } = render(<MyAccountPage />)

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
