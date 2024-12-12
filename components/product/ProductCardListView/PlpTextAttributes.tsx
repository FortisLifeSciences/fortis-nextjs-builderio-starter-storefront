import { Box } from '@mui/material'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

const PlpTextAttributes = (props: any) => {
  const { productProperties, sliceValue } = props

  const attributeList = [
    'tenant~verified-reactivity',
    sliceValue ? 'tenant~applications-variant' : 'tenant~applications',
    'tenant~platforms',
    sliceValue ? 'tenant~conjugate-type-variant' : 'tenant~conjugate-type',
    'tenant~assay-range',
    'tenant~sample-type',
    'tenant~detection-method',
    'tenant~host',
    'tenant~format',
    'tenant~immunogen',
    sliceValue ? 'tenant~purity-variant' : 'tenant~purity',
  ]

  const getPropertyDetails = (fqn: string) => {
    const property = productProperties?.find((data: any) => data?.attributeFQN === fqn)
    if (property) {
      const name = property.attributeDetail?.name || 'No Name Available'
      const values = property.values?.map((v: any) => v.stringValue).join(', ') || 'No Values'
      return { name, values }
    }
    return null
  }

  const visibleProperties = attributeList
    .map((fqn) => getPropertyDetails(fqn))
    .filter((prop) => prop !== null)
    .slice(0, 4)

  if (!productProperties || visibleProperties.length === 0) {
    return null
  }

  return (
    <Box>
      {visibleProperties.map((property, index) => (
        <Box key={index} sx={{ display: 'flex' }}>
          <Box
            sx={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              color: '#333',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '22px',
              width: '25%',
            }}
          >
            {property?.name}:
          </Box>
          <Box
            sx={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              color: '#333',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '22px',
            }}
          >
            {property?.values}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default PlpTextAttributes
