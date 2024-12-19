import React, { useEffect } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Grid,
  Typography,
  useMediaQuery,
  Theme,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material'
import { find } from 'lodash'
import { useTranslation } from 'next-i18next'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

import { KiboSelect, KiboTextBox } from '@/components/common'

import {
  CrPurchaseOrderCustomField,
  CrPurchaseOrderPayment,
  CustomerPurchaseOrderPaymentTerm,
  Maybe,
} from '@/lib/gql/types'

const schema = yup.object().shape({
  purchaseOrderNumber: yup.string().required('This field is required'),
  paymentTerm: yup.string().when('$purchaseOrderPaymentTerms', {
    is: (purchaseOrderPaymentTerms: any) =>
      purchaseOrderPaymentTerms && purchaseOrderPaymentTerms.length > 1,
    then: yup.string().required('This field is required when more data is present.'),
    otherwise: yup.string().nullable(),
  }),
  authorizerName: yup.string().required('This field is required'),
  authorizerPhone: yup
    .string()
    .matches(
      /^\d{3}-\d{3}-\d{4}$/,
      'Phone number format is invalid. It must fit the xxx-xxx-xxxx format.'
    )
    .required('This field is required'),
  referenceNumber: yup.string().nullable().notRequired(),
})

interface PurchaseOrderFormProps {
  creditLimit: number
  availableBalance: number
  purchaseOrderPaymentTerms: CustomerPurchaseOrderPaymentTerm[]
  customFields?: Maybe<CrPurchaseOrderCustomField[]>
  purchaseOrderNumber?: string
  validateForm: boolean
  onFormStatusChange: (isValid: boolean) => void
  onSavePurchaseData: (data: CrPurchaseOrderPayment & { isDataUpdated: boolean }) => void
}

const PurchaseOrderForm = (props: PurchaseOrderFormProps) => {
  const {
    creditLimit,
    availableBalance,
    purchaseOrderPaymentTerms,
    customFields,
    purchaseOrderNumber,
    validateForm,
    onFormStatusChange,
    onSavePurchaseData,
  } = props
  const { t } = useTranslation('common')
  const mdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-digit characters
    phoneNumber = phoneNumber.replace(/\D/g, '')
    // Format the number as 111-111-1111
    if (phoneNumber.length > 3 && phoneNumber.length <= 6) {
      phoneNumber = phoneNumber.replace(/(\d{3})(\d+)/, '$1-$2')
    } else if (phoneNumber.length > 6) {
      phoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3')
    }
    return phoneNumber
  }

  const {
    control,
    formState: { isValid, errors, dirtyFields },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      purchaseOrderNumber: purchaseOrderNumber,
      paymentTerm: purchaseOrderPaymentTerms[0]?.description,
      authorizerName: find(
        customFields,
        (customField: CrPurchaseOrderCustomField) => customField?.code === 'authorizer-name'
      )?.value,
      authorizerPhone: find(
        customFields,
        (customField: CrPurchaseOrderCustomField) => customField?.code === 'authorizer-phone'
      )?.value,
      referenceNumber: find(
        customFields,
        (customField: CrPurchaseOrderCustomField) => customField?.code === 'reference-number'
      )?.value,
    },
    resolver: yupResolver(schema),
    shouldFocusError: true,
    context: { purchaseOrderPaymentTerms },
  })

  const singlePurchaseOrderPaymentTerms =
    purchaseOrderPaymentTerms?.length === 1 ? purchaseOrderPaymentTerms?.[0] : null

  const generateSelectOptions = () =>
    purchaseOrderPaymentTerms?.map((paymentTerm: any) => {
      return (
        <MenuItem key={paymentTerm?.code} value={paymentTerm.description}>
          {paymentTerm.description}
        </MenuItem>
      )
    })

  const onValid = async (formData: any) => {
    const purchaseOrderFormData = {
      isDataUpdated: true,
      ...formData,
      paymentTerm: singlePurchaseOrderPaymentTerms
        ? singlePurchaseOrderPaymentTerms
        : purchaseOrderPaymentTerms.find((term: any) => term.description === formData.paymentTerm),
      customFields: [
        {
          code: 'authorizer-name',
          label: 'Authorizer Name',
          value: formData?.authorizerName,
        },
        {
          code: 'authorizer-phone',
          label: 'Authorizer Phone',
          value: formData?.authorizerPhone,
        },
        {
          code: 'reference-number',
          label: 'Reference Number',
          value: formData?.referenceNumber,
        },
      ] as CrPurchaseOrderCustomField[],
    }
    onSavePurchaseData(purchaseOrderFormData)
  }

  useEffect(() => {
    if (isValid) {
      handleSubmit(onValid)()
    }
    if (onFormStatusChange) {
      onFormStatusChange(isValid)
    }
    if (validateForm) {
      handleSubmit(onValid)()
    }
  }, [isValid, validateForm])

  return (
    <Box
      component="form"
      sx={{
        m: 1,
        maxWidth: '872px',
      }}
      noValidate
      autoComplete="off"
      data-testid="purchase-order-form"
    >
      <Typography variant="h3" component="h3" sx={{ color: 'primary.main', mt: 3, mb: 2, p: 0 }}>
        {t('payment-information')}
      </Typography>
      <FormControl>
        <Grid container rowSpacing={0} columnGap={2.5}>
          <Grid item xs={12} md={5.82}>
            <Controller
              name="purchaseOrderNumber"
              control={control}
              defaultValue={''}
              render={({ field }) => (
                <KiboTextBox
                  {...field}
                  value={field.value || ''}
                  label={t('po-number')}
                  ref={null}
                  onChange={(_name: string, value: string) => field.onChange(value)}
                  onBlur={field.onBlur}
                  required
                  error={!!errors?.purchaseOrderNumber}
                  helperText={errors?.purchaseOrderNumber?.message as unknown as string}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={5.82}>
            <Controller
              name="authorizerName"
              control={control}
              defaultValue={''}
              render={({ field }) => (
                <KiboTextBox
                  {...field}
                  value={field.value}
                  label={t('authorizer-name')}
                  ref={null}
                  onChange={(_name: string, value: string) => field.onChange(value)}
                  onBlur={field.onBlur}
                  required
                  error={!!errors?.authorizerName}
                  helperText={errors?.authorizerName?.message as unknown as string}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={5.82}>
            <Controller
              name="referenceNumber"
              control={control}
              defaultValue={''}
              render={({ field }) => (
                <KiboTextBox
                  {...field}
                  value={field.value || ''}
                  label={t('reference-number')}
                  ref={null}
                  onChange={(_name: string, value: string) => field.onChange(value)}
                  onBlur={field.onBlur}
                  error={!!errors?.referenceNumber}
                  helperText={errors?.referenceNumber?.message as unknown as string}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={5.82}>
            <Controller
              name="authorizerPhone"
              control={control}
              defaultValue={''}
              render={({ field }) => (
                <KiboTextBox
                  {...field}
                  value={field.value}
                  label={t('authorizer-phone')}
                  ref={null}
                  onChange={(_name: string, value: string) => {
                    field.onChange(formatPhoneNumber(value))
                  }}
                  onBlur={field.onBlur}
                  required
                  error={!!errors?.authorizerPhone}
                  helperText={errors?.authorizerPhone?.message as unknown as string}
                />
              )}
            />
          </Grid>

          {singlePurchaseOrderPaymentTerms && (
            <Grid item xs={12} md={12} display={'none'}>
              <InputLabel shrink={true} sx={{ position: 'relative', left: '-13px' }}>
                {t('payment-terms')}
              </InputLabel>
              {singlePurchaseOrderPaymentTerms && (
                <Typography>{singlePurchaseOrderPaymentTerms.description}</Typography>
              )}
            </Grid>
          )}
          {purchaseOrderPaymentTerms.length > 1 && (
            <Grid item xs={12} md={6} display={'none'}>
              <Controller
                name="paymentTerm"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div>
                    <KiboSelect
                      name="payment-terms"
                      label={t('payment-terms')}
                      value={field.value || ''}
                      placeholder={t('select-payment-term')}
                      onChange={(_name, value) => field.onChange(value)}
                      onBlur={field.onBlur}
                      required={true}
                    >
                      {generateSelectOptions()}
                    </KiboSelect>
                  </div>
                )}
              />
            </Grid>
          )}

          {!mdScreen && (
            <Grid item xs={6} md={6} display={'none'}>
              <InputLabel shrink={true} sx={{ position: 'relative', left: '-13px' }}>
                {t('credit-limit')}
              </InputLabel>
              <Typography>{t('currency', { val: creditLimit })}</Typography>
            </Grid>
          )}
          {!mdScreen && (
            <Grid item xs={6} md={6} display={'none'}>
              <InputLabel shrink={true} sx={{ position: 'relative', left: '-13px' }}>
                {t('available-balance')}
              </InputLabel>
              <Typography>{t('currency', { val: availableBalance })}</Typography>
            </Grid>
          )}

          {mdScreen && (
            <Grid item xs={12} md={6} display={'none'}>
              <Stack direction="row" mt={'1rem'} mb={'1rem'}>
                <Typography fontWeight="bold" sx={{ marginRight: '1rem' }}>
                  {t('credit-limit')}
                </Typography>
                <Typography>{t('currency', { val: creditLimit })}</Typography>
              </Stack>
              <Stack direction="row">
                <Typography fontWeight="bold" sx={{ marginRight: '1rem' }}>
                  {t('available-balance')}
                </Typography>
                <Typography>{t('currency', { val: availableBalance })}</Typography>
              </Stack>
            </Grid>
          )}
        </Grid>
      </FormControl>
    </Box>
  )
}

export default PurchaseOrderForm
