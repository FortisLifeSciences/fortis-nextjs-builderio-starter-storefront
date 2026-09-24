import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/my-account/account-information',
      permanent: false,
    },
  }
}

const MyAccountPage = () => null

export default MyAccountPage
