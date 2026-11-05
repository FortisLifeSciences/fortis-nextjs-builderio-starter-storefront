import { getMyAccountServerSideProps } from '@/components/layout/MyAccountLayout/getMyAccountServerSideProps'
import { MyAccountPageShell } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import type { MyAccountPageProps } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import { ListsTemplate } from '@/components/page-templates'

import type { NextPage } from 'next'

export const getServerSideProps = getMyAccountServerSideProps

const B2BListsPage: NextPage<MyAccountPageProps> = (props) => (
  <MyAccountPageShell {...props}>{() => <ListsTemplate />}</MyAccountPageShell>
)

export default B2BListsPage
