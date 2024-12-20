import { useEffect, useState } from 'react'

import { Box } from '@mui/material'
import getConfig from 'next/config'

import PdpValidationAttributes from './PDPValidationModal'

const { publicRuntimeConfig } = getConfig()

const styles = {
  iconCss: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '24px',
    color: 'primary.main',
  },
  iconText: {
    display: 'inline-block',
    color: 'primary.main',
    fontFamily: 'Poppins',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '25px',
    marginLeft: '8px',
    textDecorationLine: 'underline',
    '&:hover': {
      textDecorationLine: 'none',
    },
  },
}

const PdpIconAttributes = (props: any) => {
  const { product } = props

  const [isModalOpen, setModalOpen] = useState(false)
  const [properties, setProperties] = useState(product?.properties)

  const handleOpenModal = () => setModalOpen(true)
  const handleCloseModal = () => setModalOpen(false)

  const handleScroll = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -125
      const yPosition = element.getBoundingClientRect().top + window.scrollY + yOffset
      window.scrollTo({ top: yPosition, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    setProperties(product?.properties)
  }, [props])

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', // 4 equal columns
        // gap: '10px', // Spacing between items
        marginTop: '10px',
        marginLeft: '10px',
        '@media (max-width: 1200px)': {
          gridTemplateColumns: 'repeat(3, 1fr)', // 2 columns for medium screens
        },
        '@media (max-width: 600px)': {
          gridTemplateColumns: 'repeat(2, 1fr)', // 1 column for small screens
        },
      }}
    >
      {/* Validation Text */}
      {properties?.map((data: any) =>
        data?.attributeFQN === publicRuntimeConfig?.validationTextAttrFQN ? (
          <Box
            sx={{ ...styles.iconCss, cursor: 'pointer', color: '#348345' }}
            key={data.attributeFQN}
            onClick={handleOpenModal}
          >
            <span className="material-symbols-outlined">verified</span>
            <Box sx={{ ...styles.iconText, color: '#348345' }}>Validated</Box>
          </Box>
        ) : null
      )}

      {/* Documents Link */}
      <Box
        sx={{ ...styles.iconCss, cursor: 'pointer' }}
        onClick={() => handleScroll('document-section')}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          draft
        </span>
        <Box sx={styles.iconText}>Documents</Box>
      </Box>

      {/* Citations */}
      {properties?.map((data: any) =>
        data?.attributeFQN === publicRuntimeConfig?.citationCountVariantAttrFQN ? (
          data?.values[0]?.value > 0 ? (
            <Box
              sx={{ ...styles.iconCss, cursor: 'pointer' }}
              onClick={() => handleScroll('citation-document-section')}
              key="citations"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                note_stack
              </span>
              <Box sx={{ ...styles.iconText, marginLeft: '4px' }}>
                Citations ({data?.values[0]?.value})
              </Box>
            </Box>
          ) : null
        ) : null
      )}

      {/* Manufacturing Certification */}
      {properties?.map((data: any) =>
        data?.attributeFQN === publicRuntimeConfig?.mfgCertificationAttrFQN ? (
          data?.values[0]?.value === 'ISO13485' ? (
            <Box sx={{ ...styles.iconCss, color: '#348345' }} key="iso-certification">
              <span className="material-symbols-outlined">task_alt</span>
              <Box sx={{ ...styles.iconText, color: '#348345', textDecoration: 'none' }}>
                {data?.values[0]?.stringValue}
              </Box>
            </Box>
          ) : null
        ) : null
      )}

      {/* Manufacturing Availability (GMP Ready) */}
      {properties?.map((data: any) =>
        data?.attributeFQN === publicRuntimeConfig?.mfgAvailabilityAttrFQN ? (
          data?.values[0]?.value === 'gmp_ready' ? (
            <Box sx={{ ...styles.iconCss, color: '#1468C8' }} key="gmp-ready">
              <span className="material-symbols-outlined">manufacturing</span>
              <Box sx={{ ...styles.iconText, color: '#1468C8', textDecoration: 'none' }}>
                {data?.values[0]?.stringValue}
              </Box>
            </Box>
          ) : null
        ) : null
      )}

      {/* Manufacturing Availability (Lyo-Ready) */}
      {properties?.map((data: any) =>
        data?.attributeFQN === publicRuntimeConfig?.mfgAvailabilityAttrFQN ? (
          data?.values[0]?.value === 'lyo_ready' ? (
            <Box sx={{ ...styles.iconCss, color: '#CD461D' }} key="lyo-ready">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                grain
              </span>
              <Box sx={{ ...styles.iconText, color: '#CD461D', textDecoration: 'none' }}>
                {data?.values[0]?.stringValue}
              </Box>
            </Box>
          ) : null
        ) : null
      )}

      {/* Modal Popup */}
      {isModalOpen && <PdpValidationAttributes product={product} onClose={handleCloseModal} />}
    </Box>
  )
}

export default PdpIconAttributes
