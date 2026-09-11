import { useCallback } from 'react'

import getConfig from 'next/config'
import { useReCaptcha } from 'next-recaptcha-v3'

import { getMyAccountServerSideProps } from '@/components/layout/MyAccountLayout/getMyAccountServerSideProps'
import { MyAccountPageShell } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import type { MyAccountPageProps } from '@/components/layout/MyAccountLayout/withMyAccountPage'
import { PaymentTemplate } from '@/components/page-templates'
import { useSnackbarContext } from '@/context'
import { useCardContactActions } from '@/hooks'
import { validateGoogleReCaptcha } from '@/lib/helpers'
import type { BillingAddress, CardType } from '@/lib/types'

import type { CustomerAccount } from '@/lib/gql/types'
import type { NextPage } from 'next'

export const getServerSideProps = getMyAccountServerSideProps

const PaymentContent = ({ user }: { user: CustomerAccount }) => {
  const { cards, contacts, handleSave } = useCardContactActions(user?.id as number)
  const { publicRuntimeConfig } = getConfig()
  const reCaptchaKey = publicRuntimeConfig.recaptcha.reCaptchaKey
  const { executeRecaptcha } = useReCaptcha()
  const { showSnackbar } = useSnackbarContext()

  const submitFormWithRecaptcha = useCallback(
    (address: BillingAddress, card: CardType, isUpdatingAddress: boolean) => {
      if (!executeRecaptcha) return

      executeRecaptcha('enquiryFormSubmit').then(async (gReCaptchaToken: string) => {
        const captcha = await validateGoogleReCaptcha(gReCaptchaToken)

        if (captcha?.status === 'success') {
          await handleSave(address, card, isUpdatingAddress)
        } else {
          showSnackbar(captcha.message, 'error')
        }
      })
    },
    [executeRecaptcha, handleSave, showSnackbar]
  )

  return (
    <PaymentTemplate
      user={user}
      cards={cards}
      contacts={contacts}
      onSave={(address, card, isUpdatingAddress) =>
        reCaptchaKey
          ? submitFormWithRecaptcha(address, card, isUpdatingAddress)
          : handleSave(address, card, isUpdatingAddress)
      }
    />
  )
}

const PaymentPage: NextPage<MyAccountPageProps> = (props) => (
  <MyAccountPageShell {...props}>{(user) => <PaymentContent user={user} />}</MyAccountPageShell>
)

export default PaymentPage
