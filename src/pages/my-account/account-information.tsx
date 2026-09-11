import { getMyAccountServerSideProps } from '@/components/layout/MyAccountLayout/getMyAccountServerSideProps'
import { isB2BAccount } from '@/components/layout/MyAccountLayout/myAccountNav'
import { MyAccountPageShell } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import type { MyAccountPageProps } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import { AccountInformationTemplate } from '@/components/page-templates'

import type { NextPage } from 'next'

export const getServerSideProps = getMyAccountServerSideProps

const AccountInformationPage: NextPage<MyAccountPageProps> = (props) => (
  <MyAccountPageShell {...props}>
    {(user) => (
      <AccountInformationTemplate user={user} isB2BUser={isB2BAccount(user?.accountType)} />
    )}
  </MyAccountPageShell>
)

export default AccountInformationPage
