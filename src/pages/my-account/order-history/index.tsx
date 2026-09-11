import { useRouter } from 'next/router'

import { getMyAccountServerSideProps } from '@/components/layout/MyAccountLayout/getMyAccountServerSideProps'
import { MyAccountPageShell } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import type { MyAccountPageProps } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import { MyAccountOrderHistoryTemplate } from '@/components/page-templates'

import type { NextPage } from 'next'

export const getServerSideProps = getMyAccountServerSideProps

const OrderHistoryPage: NextPage<MyAccountPageProps> = (props) => {
  const router = useRouter()
  const qs = router?.query as { filters?: string }
  const queryFilters = qs?.filters ? qs.filters.split(',') : []

  return (
    <MyAccountPageShell {...props}>
      {(user) => <MyAccountOrderHistoryTemplate user={user} queryFilters={queryFilters} />}
    </MyAccountPageShell>
  )
}

export default OrderHistoryPage
