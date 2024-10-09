import { useTranslation } from 'next-i18next'

import { B2BAccountCreateForm } from '@/components/b2b'
import { CustomDialog } from '@/components/common'
import { CreateCustomerB2bAccountParams } from '@/lib/types'

import { B2BAccount } from '@/lib/gql/types'

interface B2BAccountFormDialogProps {
  accounts?: B2BAccount[]
  isAddingAccountToChild: boolean
  isRequestAccount: boolean
  b2BAccount?: B2BAccount
  formTitle?: string
  primaryButtonText: string
  onSave: (data: CreateCustomerB2bAccountParams) => void
  onClose: () => void
}

const B2BAccountFormDialog = (props: B2BAccountFormDialogProps) => {
  const { t } = useTranslation('common')
  const {
    accounts,
    isAddingAccountToChild,
    isRequestAccount = false,
    b2BAccount,
    primaryButtonText,
    onSave,
    onClose,
  } = props
  return (
    <CustomDialog
      showCloseButton
      Title={t('create-an-account')}
      showContentTopDivider={false}
      showContentBottomDivider={false}
      Actions={''}
      Content={
        <B2BAccountCreateForm
          accounts={accounts}
          b2BAccount={b2BAccount}
          isAddingAccountToChild={isAddingAccountToChild}
          isRequestAccount={isRequestAccount}
          primaryButtonText={primaryButtonText}
          onSave={onSave}
          onClose={onClose}
        />
      }
      customMaxWidth="832px"
      onClose={onClose}
    />
  )
}

export default B2BAccountFormDialog
