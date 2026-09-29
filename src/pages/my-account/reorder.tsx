import { getMyAccountServerSideProps } from '@/components/layout/MyAccountLayout/getMyAccountServerSideProps'
import { MyAccountPageShell } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import type { MyAccountPageProps } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import { ReorderTemplate } from '@/components/page-templates'

import type { NextPage } from 'next'

export const getServerSideProps = getMyAccountServerSideProps

const ReorderPage: NextPage<MyAccountPageProps> = (props) => (
  <MyAccountPageShell {...props}>{() => <ReorderTemplate />}</MyAccountPageShell>
)

export default ReorderPage
