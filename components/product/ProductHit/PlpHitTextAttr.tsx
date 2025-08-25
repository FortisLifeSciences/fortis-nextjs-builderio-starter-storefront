import { Box } from '@mui/material'

type prod = {
  reactivity: any
  sourceSpecies: any
  applications: any
  platforms: any
  conjugate: any
  assayRange: any
  sampleType: any
  detectionMethod: any
  host: any
  format: any
  epitopeTag: any
  immunogen: any
  purity: any
}

const PlpHitTextAttr = ({
  reactivity,
  sourceSpecies,
  applications,
  platforms,
  conjugate,
  assayRange,
  sampleType,
  detectionMethod,
  host,
  format,
  epitopeTag,
  immunogen,
  purity,
}: prod) => {
  const orderedAttributes = [
    { label: 'Reactivity', value: reactivity?.join(', ') },
    { label: 'Source Species', value: sourceSpecies?.join(', ') },
    { label: 'Applications', value: applications?.join(', ') },
    { label: 'Platforms ', value: platforms },
    { label: 'Conjugate ', value: conjugate },
    { label: 'Assay Range', value: assayRange },
    { label: 'Sample Type', value: sampleType },
    { label: 'Detection Method', value: detectionMethod },
    { label: 'Host', value: host },
    { label: 'Format', value: format },
    { label: 'Epitope Tag', value: epitopeTag?.join(', ') },
    { label: 'Immunogen', value: immunogen },
    { label: 'Purity  ', value: purity },
  ]

  const visibleAttributes = orderedAttributes.filter((attr) => attr.value).slice(0, 4)

  return (
    <Box>
      {visibleAttributes.map((attr, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box
            sx={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              color: '#333',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '22px',
              width: '25%',
              wordWrap: 'break-word',
              textAlign: 'left',
            }}
          >
            {attr.label}:
          </Box>
          <Box
            sx={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              color: '#333',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '22px',
              width: 'calc(75% - 50px)',
              wordWrap: 'break-word',
              textAlign: 'left',
            }}
          >
            {attr.value}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default PlpHitTextAttr
