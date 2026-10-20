import React, { useEffect, useState } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import { styled, FormControl, Box, Grid } from '@mui/material'
import creditCardType from 'credit-card-type'
import { useTranslation } from 'next-i18next'
import { useForm, Controller, ControllerRenderProps, useWatch } from 'react-hook-form'
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
  fullWidth?: boolean
  showCardTypeIcon?: boolean
  onSaveCardData: (cardData: CardForm) => void
  onFormStatusChange?: (status: boolean, formData?: CardForm) => void
}

const StyledCardDiv = styled('div', {
  shouldForwardProp: (prop) => prop !== 'fullWidth',
})<{ fullWidth?: boolean }>(({ fullWidth }) => ({
  maxWidth: fullWidth ? '100%' : '26.313rem',
  paddingLeft: '0.5rem',
}))

const cardInputSx = {
  height: '44px',
  borderRadius: '8px',
  borderColor: '#C9C8D9',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  '&:hover': { borderColor: '#30299A' },
  '&.MuiInputBase-root:focus-within': {
    borderColor: '#30299A',
    boxShadow: '0 0 0 3px rgba(48, 41, 154, 0.15)',
  },
  '&.Mui-error': { borderColor: 'error.main' },
  '& .MuiInputBase-input': { padding: '0 14px', letterSpacing: '0.02em' },
  '& .MuiInputBase-input::placeholder': { color: '#8C8BA3', opacity: 1 },
}

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
      .matches(/^(0?[1-9]|1[0-2])[/]\d{4}$/g, t('invalid-expiry-date-format'))
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
    fullWidth = false,
    showCardTypeIcon = true,
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

  const watchedFormData = useWatch({ control })

  const onValid = async (formData: CardForm) => {
    const cardData = prepareCardDataParams(formData)
    const cardDataParams = { ...cardData, isCardDetailsValidated: isValid, isDataUpdated: true }
    onSaveCardData(cardDataParams)

    if (onFormStatusChange) onFormStatusChange(isValid, cardDataParams) // Send form data
  }

  const handleCardType = (field: ControllerRenderProps<CardForm, 'cardNumber'>, value: string) => {
    field.onChange(value)
    const cardType = creditCardType(value)[0]
    setCardTypeLogo(getCreditCardLogo(value.length > 8 ? cardType?.niceType.toUpperCase() : ''))
  }

  useEffect(() => {
    if (onFormStatusChange) {
      const cardDataParams = {
        ...prepareCardDataParams(watchedFormData), // Prepare card data
        isCardDetailsValidated: isValid,
        isDataUpdated: false, // Since it's not saved yet
      }
      onFormStatusChange(isValid, cardDataParams)
    }
    if (validateForm && isValid) {
      handleSubmit(onValid)()
    }
  }, [isValid, validateForm, watchedFormData])

  return (
    <StyledCardDiv data-testid="card-details" fullWidth={fullWidth} sx={{ ml: 0, pl: 0 }}>
      <FormControl sx={{ width: '100%' }}>
        <Grid container columnGap={4} rowGap={2}>
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
                  sx={cardInputSx}
                  onChange={(_name, value) => {
                    const sanitizedValue = value.replace(/\s/g, '')
                    handleCardType(field, sanitizedValue)
                  }}
                  onBlur={field.onBlur}
                  error={!!errors?.cardNumber}
                  helperText={errors?.cardNumber?.message as unknown as string}
                  {...(showCardTypeIcon && {
                    icon: (
                      <Box pr={1.5} display="flex" alignItems="center">
                        <KiboImage src={cardTypeLogo.src} alt={'cardType'} width={32} height={20} />
                      </Box>
                    ),
                  })}
                  {...(cardValue && { disabled: true })}
                  inputProps={{ maxLength: 16 }}
                />
              )}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md
            sx={{ flexBasis: { md: 'calc(50% - 16px)' }, maxWidth: { md: 'calc(50% - 16px)' } }}
          >
            <Controller
              name="expiryDate"
              control={control}
              defaultValue={cardValue?.expiryDate}
              render={({ field }) => (
                <KiboTextBox
                  value={field.value || ''}
                  label={t('expires-mm-yyyy')}
                  placeholder={t('expiry-date-placeholder')}
                  sx={cardInputSx}
                  required={true}
                  onChange={(_name, value) => {
                    const previous = field.value || ''
                    const isDeleting = value.length < previous.length
                    const slashIndex = value.indexOf('/')

                    let month: string
                    let year: string
                    if (slashIndex !== -1) {
                      month = value.substring(0, slashIndex).replace(/\D/g, '').substring(0, 2)
                      year = value
                        .substring(slashIndex + 1)
                        .replace(/\D/g, '')
                        .substring(0, 4)
                    } else {
                      const digits = value.replace(/\D/g, '').substring(0, 6)
                      month = digits.substring(0, 2)
                      year = digits.substring(2)
                    }

                    const formattedValue =
                      slashIndex !== -1 || (month.length === 2 && !isDeleting)
                        ? `${month}/${year}`
                        : month

                    field.onChange(formattedValue)
                  }}
                  onBlur={() => {
                    const current = field.value || ''
                    if (current.includes('/')) {
                      let [month, year] = current.split('/')
                      if (month.length === 1) month = `0${month}`
                      if (year.length === 2) year = `20${year}`
                      field.onChange(`${month}/${year}`)
                    }
                    field.onBlur()
                  }}
                  error={!!errors?.expiryDate}
                  helperText={errors?.expiryDate?.message as unknown as string}
                />
              )}
            />
          </Grid>
          {showCvv && (
            <>
              <Grid
                item
                xs={12}
                md
                sx={{ flexBasis: { md: 'calc(50% - 16px)' }, maxWidth: { md: 'calc(50% - 16px)' } }}
              >
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
                        placeholder={t('cvv-placeholder')}
                        required={true}
                        sx={cardInputSx}
                        onChange={(_name, value) => {
                          const sanitizedValue = value.replace(/\D/g, '').substring(0, 4)
                          field.onChange(sanitizedValue)
                        }}
                        onBlur={field.onBlur}
                        error={!!errors?.cvv}
                        inputProps={{ maxLength: 4 }}
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
