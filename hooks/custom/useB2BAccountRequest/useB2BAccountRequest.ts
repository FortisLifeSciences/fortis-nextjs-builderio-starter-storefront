import { useEffect, useRef, useState } from 'react'

import builder from '@builder.io/react'

import { useCreateCustomerB2bAccountMutation } from '@/hooks/mutations/b2b/accountHierarchy/useCreateCustomerB2bAccount/useCreateCustomerB2bAccount'
import { makeGraphQLClient } from '@/lib/gql/client'
import { getCheckoutQuery } from '@/lib/gql/queries'
import { buildCreateCustomerB2bAccountParams } from '@/lib/helpers/buildCreateCustomerB2bAccountParams'
import { CreateCustomerB2bAccountParams } from '@/lib/types'

import type { CrOrder } from '@/lib/gql/types'

export interface B2BAccountRequestCallbacks {
  onExistingUser: () => void
  onSuccess: () => void
  onError: (error: unknown) => void
}

export interface AccountAtCheckoutResult {
  status: 'created' | 'exists' | 'guest' | 'failed'
  checkoutId?: string
  checkout?: CrOrder
  account?: any
  customerAccount?: any
  behaviors?: number[]
}

const B2B_ACCOUNT_MAPPING_ENTITY_LIST = 'B2BAccountMapping@fortis'

const postJson = async (url: string, body: unknown) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response.json()
}

const extractDomain = (email: string) => {
  const atIndex = email.indexOf('@')
  return atIndex !== -1 ? email.slice(atIndex + 1) : ''
}

export const useB2BAccountRequest = () => {
  const { createCustomerB2bAccount } = useCreateCustomerB2bAccountMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)
  const [googleReCaptcha, setGoogleReCaptcha] = useState<any>(null)
  const [pardotFormUrl, setPardotFormUrl] = useState('')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await builder.get('theme-setting').promise()
        setGoogleReCaptcha(settings?.data?.googleReCaptcha)
        setPardotFormUrl(settings?.data?.pardotFormHandlerUrl)
      } finally {
        setIsReady(true)
      }
    }
    fetchSettings()
  }, [])

  const validateReCaptcha = async () => {
    if (!googleReCaptcha?.reCaptchAccountCreation) return null
    if (typeof grecaptcha === 'undefined' || !grecaptcha.enterprise) return null

    const siteKey = googleReCaptcha?.accountCreationSiteKey || process.env.accountCreationSiteKey

    return new Promise<any>((resolve) => {
      grecaptcha.enterprise.ready(async () => {
        try {
          const responseKey = await grecaptcha.enterprise.execute(siteKey, { action: 'signup' })
          resolve(
            await postJson('/api/user/validate-recaptcha', {
              payLoad: { googleReCaptcha, responseKey },
            })
          )
        } catch {
          resolve(null)
        }
      })
    })
  }

  const sendToPardot = async (account: any) => {
    if (!pardotFormUrl) return
    const user = account?.users?.[0]
    await fetch(pardotFormUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
      },
      mode: 'no-cors',
      body: new URLSearchParams({
        userFirstName: user?.firstName,
        userLastName: user?.lastName,
        companyName: account?.companyOrOrganization,
        userEmail: user?.emailAddress,
        customerID: user?.userId,
        accountID: account?.id,
        marketing_optin: user?.acceptsMarketing,
      }),
    }).catch(() => undefined)
  }

  const finalizeAccount = async (accountId: number, entityResult: any) => {
    const purchaseOrderPayLoad = { accountId }

    const salesRepDetails = await postJson('/api/user/addSalesRep', { purchaseOrderPayLoad })
    if (salesRepDetails?.success !== true) return

    const activeAccountDetails = await postJson('/api/user/b2baccountActive', {
      purchaseOrderPayLoad,
    })
    if (activeAccountDetails?.success !== true) return

    await sendToPardot(activeAccountDetails?.data)

    const creditLine = entityResult?.entityDetails?.creditLine
    if (creditLine === 'true' || creditLine === true) {
      await postJson('/api/user/create-purchase-order', { purchaseOrderPayLoad })
    }
  }

  const submitAccountRequest = async (
    formValues: CreateCustomerB2bAccountParams,
    { onExistingUser, onSuccess, onError }: B2BAccountRequestCallbacks
  ) => {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      const emailAddress = formValues.emailAddress

      const userDetails = await postJson('/api/user/getAccountsByUser', { emailAddress })
      if (userDetails?.success === true) {
        onExistingUser()
        return
      }

      const entityResult = await postJson('/api/user/get-entity', {
        entityPayLoad: {
          entityListFullName: B2B_ACCOUNT_MAPPING_ENTITY_LIST,
          id: extractDomain(emailAddress),
        },
      })

      const reCaptchaResult = await validateReCaptcha()

      const variables = buildCreateCustomerB2bAccountParams(formValues)
      const createdAccount = await createCustomerB2bAccount.mutateAsync({
        ...variables,
        b2BAccountInput: {
          ...variables.b2BAccountInput,
          ...(entityResult?.entityDetails?.externalID && {
            externalId: entityResult.entityDetails.externalID,
          }),
          ...(reCaptchaResult?.success
            ? {
                attributes: [
                  {
                    fullyQualifiedName: 'tenant~recaptcha-score',
                    values: reCaptchaResult?.score,
                  },
                ],
              }
            : {}),
        },
      })

      if (!createdAccount?.id) throw new Error('B2B account was not created')

      await finalizeAccount(createdAccount.id, entityResult)
      onSuccess()
    } catch (error) {
      console.error('Account request error:', error)
      onError(error)
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  const createAccountAtCheckout = async (checkoutId: string): Promise<AccountAtCheckoutResult> => {
    try {
      const reCaptchaResult = await validateReCaptcha()
      const result: AccountAtCheckoutResult = await postJson('/api/user/createAccountAtCheckout', {
        checkoutId,
        reCaptchaScore: reCaptchaResult?.success ? reCaptchaResult?.score : undefined,
      })
      if (!result?.status) return { status: 'failed' }
      if (result.status === 'created') {
        sendToPardot(result.account)
      }
      if (result.checkoutId) {
        const response = await makeGraphQLClient().request({
          document: getCheckoutQuery,
          variables: { checkoutId: result.checkoutId },
        })
        if (!response?.checkout) return { status: 'failed' }
        result.checkout = response.checkout
      }
      return result
    } catch (error) {
      console.error('Account creation at checkout error:', error)
      return { status: 'failed' }
    }
  }

  return { submitAccountRequest, createAccountAtCheckout, isSubmitting, isReady }
}
