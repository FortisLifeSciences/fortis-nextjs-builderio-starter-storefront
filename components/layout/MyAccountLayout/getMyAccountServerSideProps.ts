import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { getCurrentUser } from '@/lib/api/operations'

import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'

export const getMyAccountServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, req, res } = context

  const response = await getCurrentUser(req as NextApiRequest, res as NextApiResponse)

  return {
    props: {
      customerAccount: response?.customerAccount ?? null,
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  }
}
