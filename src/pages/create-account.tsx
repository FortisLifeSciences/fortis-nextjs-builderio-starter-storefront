import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { CreateAccountTemplate } from '@/components/page-templates'
import type { CreateAccountPrefill } from '@/components/page-templates/CreateAccountTemplate/CreateAccountTemplate'

import type { GetServerSidePropsContext, NextPage } from 'next'

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, query } = context

  const prefill: CreateAccountPrefill = {
    firstName: (query.firstName as string) || '',
    lastNameOrSurname: (query.lastName as string) || '',
    companyOrOrganization: (query.company as string) || '',
    email: (query.email as string) || '',
  }

  return {
    props: {
      prefill,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}

interface CreateAccountPageProps {
  prefill: CreateAccountPrefill
}

const CreateAccountPage: NextPage<CreateAccountPageProps> = ({ prefill }) => (
  <CreateAccountTemplate prefill={prefill} />
)

export default CreateAccountPage
