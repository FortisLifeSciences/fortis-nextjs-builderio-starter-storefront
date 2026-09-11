import { getMyAccountServerSideProps } from '@/components/layout/MyAccountLayout/getMyAccountServerSideProps'
import { MyAccountPageShell } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import type { MyAccountPageProps } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import { ShippingAddressTemplate } from '@/components/page-templates'
import { useCardContactActions } from '@/hooks'

import type { CustomerAccount } from '@/lib/gql/types'
import type { NextPage } from 'next'

export const getServerSideProps = getMyAccountServerSideProps

const ShippingAddressContent = ({ user }: { user: CustomerAccount }) => {
  const { contacts } = useCardContactActions(user?.id as number)

  return <ShippingAddressTemplate user={user} contacts={contacts} />
}

const ShippingAddressPage: NextPage<MyAccountPageProps> = (props) => (
  <MyAccountPageShell {...props}>
    {(user) => <ShippingAddressContent user={user} />}
  </MyAccountPageShell>
)

export default ShippingAddressPage
