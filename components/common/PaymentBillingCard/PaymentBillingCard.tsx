import { Box } from '@mui/material'
import { useTranslation } from 'next-i18next'

import { AddressCard, KeyValueDisplay, PaymentCard } from '@/components/common'
import { PageType, PaymentType } from '@/lib/constants'

import { CrPurchaseOrderCustomField, CrPurchaseOrderPaymentTerm, Maybe } from '@/lib/gql/types'

interface PaymentBillingCardProps {
  showAddress?: boolean
  pageType?: string
  cardNumberPart?: string
  expireMonth?: number
  expireYear?: number
  cardType?: string
  address1?: string
  address2?: string
  cityOrTown?: string
  postalOrZipCode?: string
  stateOrProvince?: string
  firstName?: string
  lastNameOrSurname?: string
  companyOrOrganization?: string
  countryCode?: string
  purchaseOrderNumber?: string
  paymentTerm?: CrPurchaseOrderPaymentTerm
  paymentType?: string
  poCustomFields?: Maybe<CrPurchaseOrderCustomField[]>
}

const PaymentBillingCard = (props: PaymentBillingCardProps) => {
  const {
    showAddress,
    pageType,
    cardNumberPart,
    expireMonth,
    expireYear,
    cardType,
    address1,
    address2,
    cityOrTown,
    postalOrZipCode,
    stateOrProvince,
    firstName,
    lastNameOrSurname,
    companyOrOrganization,
    countryCode,
    purchaseOrderNumber,
    paymentType,
    poCustomFields,
  } = props
  const { t } = useTranslation('common')

  return (
    <Box
      width={'100%'}
      maxWidth={873}
      display="flex"
      sx={{
        flexDirection: 'row',
        gap: 1,
      }}
    >
      {paymentType === PaymentType.CREDITCARD && (
        <>
          <PaymentCard
            pageType={pageType}
            cardNumberPart={cardNumberPart as string}
            expireMonth={expireMonth as number}
            expireYear={expireYear as number}
            cardType={cardType}
            // onPaymentCardSelection={() => null}
          />
          {showAddress && (
            <Box sx={{ display: 'flex', flexDirection: 'column', pt: 1, ml: 5 }}>
              <AddressCard
                title={t('billing-address')}
                variant={'body2'}
                firstName={firstName}
                lastNameOrSurname={lastNameOrSurname}
                companyOrOrganization={companyOrOrganization}
                address1={address1}
                address2={address2}
                cityOrTown={cityOrTown}
                stateOrProvince={postalOrZipCode}
                postalOrZipCode={stateOrProvince}
                countryCode={countryCode}
              />
            </Box>
          )}
        </>
      )}

      {paymentType === PaymentType.PURCHASEORDER && (
        <Box data-testid="purchase-order-card">
          <Box>
            <KeyValueDisplay
              variant={'body2'}
              color="grey.900"
              fontWeight={'normal'}
              sx={{ fontSize: '1rem' }}
              option={{
                name: t('po-number') + ':',
                value: purchaseOrderNumber,
              }}
            />
            {poCustomFields?.map((customField) => {
              return customField?.value ? (
                <KeyValueDisplay
                  variant={'body2'}
                  color="grey.900"
                  fontWeight={'normal'}
                  sx={{ fontSize: '1rem' }}
                  key={customField?.code}
                  option={{
                    name: customField?.label + ':',
                    value: customField?.value,
                  }}
                />
              ) : (
                <></>
              )
            })}
          </Box>
          {showAddress && (
            <Box sx={{ display: 'flex', flexDirection: 'column', pt: 1, ml: 5 }}>
              <AddressCard
                title={t('billing-address')}
                variant={'body2'}
                firstName={firstName}
                lastNameOrSurname={lastNameOrSurname}
                companyOrOrganization={companyOrOrganization}
                address1={address1}
                address2={address2}
                cityOrTown={cityOrTown}
                stateOrProvince={postalOrZipCode}
                postalOrZipCode={stateOrProvince}
                countryCode={countryCode}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
export default PaymentBillingCard
