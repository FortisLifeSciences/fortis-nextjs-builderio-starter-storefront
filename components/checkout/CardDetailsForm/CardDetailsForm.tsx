import React, { useEffect, useState } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import { styled, FormControl, Box, Grid } from '@mui/material'
import creditCardType from 'credit-card-type'
import { useTranslation } from 'next-i18next'
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form'
import * as yup from 'yup'

import { KiboImage, KiboTextBox } from '@/components/common'
import {
  prepareCardDataParams,
  validateExpiryDate,
  isCardNumberValid,
  isCardTypeValid,
  getCreditCardLogo,
} from '@/lib/helpers/credit-card'
import type { CardForm } from '@/lib/types'

export interface CardDetailsFormProps {
  cardValue?: CardForm
  validateForm: boolean
  showCvv?: boolean
  onSaveCardData: (cardData: CardForm) => void
  onFormStatusChange?: (status: boolean) => void
}

const StyledCardDiv = styled('div')(() => ({
  maxWidth: '26.313rem',
  paddingLeft: '0.5rem',
}))

const useCardSchema = (showCvv: boolean) => {
  const { t } = useTranslation('common')
  return yup.object({
    cardNumber: yup.string().when('$isEdit', (isEdit, schema) => {
      if (!isEdit) {
        return schema
          .required(t('card-number-required'))
          .test('card-invalid', t('invalid-card-number'), (value: string) =>
            isCardNumberValid(value)
          )
          .test('card-type', t('card-not-supported'), (value: string) => isCardTypeValid(value))
      } else {
        return schema.required(t('card-number-required'))
      }
    }),
    expiryDate: yup
      .string()
      .required(t('expiry-date-required'))
      .matches(/^(0?[1-9]|1[012])[/-]\d{4}$/g, t('invalid-expiry-date-format'))
      .test('expiry-date', t('invalid-expiry-date'), (value) => validateExpiryDate(value)),
    cvv: yup.string().when('$isEdit', (isEdit, schema) => {
      if (!isEdit && showCvv) {
        return schema.required(t('cvv-is-required')).matches(/^\d{3,4}$/g, t('invalid-cvv'))
      }
    }),
  })
}
const CardDetailsForm = (props: CardDetailsFormProps) => {
  const {
    validateForm = false,
    showCvv = true,
    onSaveCardData,
    onFormStatusChange,
    cardValue,
  } = props
  const { t } = useTranslation('common')
  const cardSchema = useCardSchema(showCvv)
  const [cardTypeLogo, setCardTypeLogo] = useState(getCreditCardLogo(cardValue?.cardType as string))

  const {
    formState: { errors, isValid },
    control,
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: cardValue ? cardValue : undefined,
    resolver: yupResolver(cardSchema),
    shouldFocusError: true,
    context: { isEdit: cardValue?.cardNumber?.includes('*') },
  })

  const onValid = async (formData: CardForm) => {
    const cardData = prepareCardDataParams(formData)
    const cardDataParams = { ...cardData, isCardDetailsValidated: isValid, isDataUpdated: true }
    onSaveCardData(cardDataParams)
  }

  const handleCardType = (field: ControllerRenderProps<CardForm, 'cardNumber'>, value: string) => {
    field.onChange(value)
    const cardType = creditCardType(value)[0]
    setCardTypeLogo(getCreditCardLogo(value.length > 8 ? cardType?.niceType.toUpperCase() : ''))
  }

  useEffect(() => {
    if (onFormStatusChange) onFormStatusChange(isValid)
    if (validateForm) handleSubmit(onValid)()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, validateForm])

  return (
    <StyledCardDiv data-testid="card-details" sx={{ ml: 0, pl: 0 }}>
      <FormControl sx={{ width: '100%' }}>
        <Grid container columnGap={4}>
          <Grid item xs={12}>
            <Controller
              name="cardNumber"
              control={control}
              defaultValue={cardValue?.cardNumber}
              render={({ field }) => (
                <KiboTextBox
                  value={field.value || ''}
                  label={t('card-number')}
                  required={true}
                  onChange={(_name, value) => {
                    const sanitizedValue = value.replace(/\s/g, '')
                    handleCardType(field, sanitizedValue)
                  }}
                  onBlur={field.onBlur}
                  error={!!errors?.cardNumber}
                  helperText={errors?.cardNumber?.message as unknown as string}
                  icon={
                    <Box pr={1} mt={1}>
                      <KiboImage src={cardTypeLogo} alt={'cardType'} width={45} height={24} />
                    </Box>
                  }
                  {...(cardValue && { disabled: true })}
                  inputProps={{ maxLength: 16 }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Controller
              name="expiryDate"
              control={control}
              defaultValue={cardValue?.expiryDate}
              render={({ field }) => (
                <KiboTextBox
                  value={field.value || ''}
                  label={t('expires-mm-yyyy')}
                  required={true}
                  onChange={(_name, value) => {
                    if (value?.length > 1 && value?.length < 3) {
                      field.onChange(`${value}/`)
                    } else {
                      field.onChange(value)
                    }
                  }}
                  onBlur={field.onBlur}
                  error={!!errors?.expiryDate}
                  helperText={errors?.expiryDate?.message as unknown as string}
                />
              )}
            />
          </Grid>
          {showCvv && (
            <>
              <Grid item xs={8} md={3}>
                <Controller
                  name="cvv"
                  control={control}
                  defaultValue={cardValue?.cvv}
                  render={({ field }) => {
                    return !cardValue ? (
                      <KiboTextBox
                        type="password"
                        value={field.value || ''}
                        label={t('cvv-code')}
                        required={true}
                        onChange={(_name, value) => field.onChange(value)}
                        onBlur={field.onBlur}
                        error={!!errors?.cvv}
                        helperText={errors?.cvv?.message as unknown as string}
                        // icon={
                        //   <Box pr={1} pt={0} sx={{ cursor: 'pointer' }}>
                        //     <Tooltip title={t('cvv-tooltip-text')} placement="top" sx={{ width: '0.75rem', height: '0.75rem' }}>
                        //       <Help color="disabled" />
                        //     </Tooltip>
                        //   </Box>
                        // }
                        // {...(cardValue && { disabled: true })}
                      />
                    ) : (
                      <></>
                    )
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </FormControl>
    </StyledCardDiv>
  )
}

export default CardDetailsForm
