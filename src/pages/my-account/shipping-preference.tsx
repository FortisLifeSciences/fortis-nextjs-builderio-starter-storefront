import { getMyAccountServerSideProps } from '@/components/layout/MyAccountLayout/getMyAccountServerSideProps'
import { isB2BAccount } from '@/components/layout/MyAccountLayout/myAccountNav'
import { MyAccountPageShell } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import type { MyAccountPageProps } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import { ShippingPreferenceTemplate } from '@/components/page-templates'

import type { NextPage } from 'next'

export const getServerSideProps = getMyAccountServerSideProps

const ShippingPreferencePage: NextPage<MyAccountPageProps> = (props) => (
  <MyAccountPageShell {...props}>
    {(user) =>
      isB2BAccount(user?.accountType) ? <ShippingPreferenceTemplate user={user} /> : null
    }
  </MyAccountPageShell>
)

export default ShippingPreferencePage
