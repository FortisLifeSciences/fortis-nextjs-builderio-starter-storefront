import { Typography, Box } from '@mui/material'
import { Variant } from '@mui/material/styles/createTypography'
import getConfig from 'next/config'

import type { CrAddress, Maybe } from '@/lib/gql/types'

interface AddressProps extends CrAddress {
  title?: string
  variant?: Variant
  firstName?: string
  middleNameOrInitial?: string
  lastNameOrSurname?: string
  companyOrOrganization?: string
}

const AddressCard = (props: AddressProps) => {
  console.log('props- address', props)
  const { publicRuntimeConfig } = getConfig()
  const {
    firstName,
    middleNameOrInitial,
    lastNameOrSurname,
    companyOrOrganization,
    title,
    address1,
    address2,
    cityOrTown,
    stateOrProvince,
    postalOrZipCode,
    variant = 'body1',
    countryCode,
  } = props

  const countries = publicRuntimeConfig.countries
  const countryName =
    countries.find((country: { code: Maybe<string> }) => country.code === countryCode)?.name ||
    'Not found'
  const isNameAvailable = firstName || middleNameOrInitial || lastNameOrSurname

  return (
    <>
      {title && (
        <Typography variant="subtitle2" fontWeight={600}>
          {title}
        </Typography>
      )}

      <Box data-testid="address-card">
        {isNameAvailable && (
          <Typography variant={variant}>{`${firstName} ${lastNameOrSurname}`}</Typography>
        )}
        <Typography variant={variant}>{companyOrOrganization}</Typography>
        <Typography variant={variant}>{address1}</Typography>
        <Typography variant={variant}>{address2}</Typography>
        <Box display="flex">
          <Typography variant={variant}>{cityOrTown}</Typography>
          {stateOrProvince && (
            <Typography variant={variant} sx={{ '&::before': { content: "','", pr: 0.5 } }}>
              {stateOrProvince}
            </Typography>
          )}
          {postalOrZipCode && (
            <Typography variant={variant} sx={{ '&::before': { content: "','", pr: 0.5 } }}>
              {postalOrZipCode}
            </Typography>
          )}
        </Box>
        <Typography variant={variant}>{countryName}</Typography>
      </Box>
    </>
  )
}

export default AddressCard
