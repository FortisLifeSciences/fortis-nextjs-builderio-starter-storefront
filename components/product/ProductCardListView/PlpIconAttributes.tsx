import { useState } from 'react'

import { Box, Grid } from '@mui/material'
import { color } from 'framer-motion'
import getConfig from 'next/config'
import Link from 'next/link'

import PdpValidationAttributes from '../PDPValidationModal'
import { ProductCustom } from '@/lib/types'

const { publicRuntimeConfig } = getConfig()

const plpIconStyles = {
  flexDirectionRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  plpIconCss: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '10px',
  },
  plpIconText: {
    display: 'inline-block',
    color: 'primary.main',
    fontFamily: 'Poppins',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '22px',
  },
}

const PlpIconAttributes = (props: any) => {
  const { productProperties, sliceValue } = props
  const properties = productProperties
  const [isModalOpen, setModalOpen] = useState(false)
  const handleOpenModal = () => setModalOpen(true)
  const handleCloseModal = () => setModalOpen(false)

  if (!productProperties || !Array.isArray(productProperties) || productProperties.length === 0) {
    return null
  }

  return (
    <Grid container spacing={2} sx={{ marginBottom: '10px' }}>
      {properties?.map((data: any) => {
        return data?.attributeFQN === 'tenant~validation-text' ? (
          <Grid
            item
            md={3}
            sm={3}
            sx={plpIconStyles.flexDirectionRow}
            onClick={handleOpenModal}
            style={{ cursor: 'pointer' }}
            key={data.attributeFQN}
          >
            <Box sx={{ ...plpIconStyles.plpIconCss, color: '#348345' }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '16px', color: '#348345' }}
              >
                verified
              </span>
            </Box>
            <Box
              sx={{
                ...plpIconStyles.plpIconText,
                color: '#348345',
              }}
            >
              Validated
            </Box>
          </Grid>
        ) : null
      })}

      {isModalOpen && (
        <PdpValidationAttributes product={productProperties} onClose={handleCloseModal} />
      )}

      {properties?.map((data: any) => {
        return data?.attributeFQN === 'tenant~trial-size-available' ? (
          data?.values[0]?.value === 'Yes' ? (
            <Grid item md={3} sm={3}>
              <Box sx={plpIconStyles.flexDirectionRow}>
                <Box sx={plpIconStyles.flexDirectionRow}>
                  <Box sx={plpIconStyles.plpIconCss}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '16px', color: '#1468C8' }}
                    >
                      labs
                    </span>
                  </Box>
                  <Box sx={{ ...plpIconStyles.plpIconText, color: '#1468C8' }}>
                    Trial Size Available
                  </Box>
                </Box>
              </Box>
            </Grid>
          ) : null
        ) : null
      })}

      {properties?.map((data: any) => {
        return data?.attributeFQN === 'tenant~formulation' ? (
          data?.values[0]?.value === 'bsa_free' ? (
            <Grid item md={3} sm={3}>
              <Box sx={plpIconStyles.flexDirectionRow}>
                <Box sx={plpIconStyles.flexDirectionRow}>
                  <Box sx={plpIconStyles.plpIconCss}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '16px', color: '#9E6C00' }}
                    >
                      block
                    </span>
                  </Box>
                  <Box sx={{ ...plpIconStyles.plpIconText, color: '#9E6C00' }}>
                    {data?.values[0]?.stringValue}
                  </Box>
                </Box>
              </Box>
            </Grid>
          ) : null
        ) : null
      })}

      {properties?.map((data: any) => {
        return data?.attributeFQN ===
          (sliceValue
            ? publicRuntimeConfig?.citationCountVariantAttrFQN
            : 'tenant~citation-count') ? (
          data?.values[0]?.value > 0 ? (
            <Grid item md={3} sm={3}>
              <Link href="#" style={{ textDecoration: 'none' }}>
                <Box sx={plpIconStyles.flexDirectionRow}>
                  <Box sx={plpIconStyles.plpIconCss}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '16px', color: 'primary.main' }}
                    >
                      note_stack
                    </span>
                  </Box>
                  <Box sx={{ ...plpIconStyles.plpIconText, color: 'primary.main' }}>
                    Citations({data?.values[0]?.value})
                  </Box>
                </Box>
              </Link>
            </Grid>
          ) : null
        ) : null
      })}

      {properties?.map((data: any) => {
        return data?.attributeFQN === publicRuntimeConfig?.mfgCertificationAttrFQN ? (
          data?.values[0]?.value === 'ISO13485' ? (
            <Grid item md={3} sm={3}>
              <Box sx={plpIconStyles.flexDirectionRow}>
                <Box sx={plpIconStyles.plpIconCss}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: '#348345' }}
                  >
                    task_alt
                  </span>
                </Box>
                <Box sx={{ ...plpIconStyles.plpIconText, color: '#348345' }}>
                  {data?.values[0]?.value}
                </Box>
              </Box>
            </Grid>
          ) : null
        ) : null
      })}

      {properties?.map((data: any) => {
        return data?.attributeFQN === publicRuntimeConfig?.mfgAvailabilityAttrFQN ? (
          data?.values[0]?.value === 'gmp_ready' ? (
            <Grid item md={3} sm={3}>
              <Box sx={plpIconStyles.flexDirectionRow}>
                <Box sx={plpIconStyles.flexDirectionRow}>
                  <Box sx={plpIconStyles.plpIconCss}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '16px', color: '#1468C8' }}
                    >
                      manufacturing
                    </span>
                  </Box>
                  <Box sx={{ ...plpIconStyles.plpIconText, color: '#1468C8' }}>
                    {data?.values[0]?.stringValue}
                  </Box>
                </Box>
              </Box>
            </Grid>
          ) : null
        ) : null
      })}

      {properties?.map((data: any) => {
        return data?.attributeFQN === publicRuntimeConfig?.mfgAvailabilityAttrFQN ? (
          data?.values[0]?.value === 'Lyo-Ready' ? (
            <Grid item md={3} sm={3}>
              <Box sx={plpIconStyles.flexDirectionRow}>
                <Box sx={plpIconStyles.flexDirectionRow}>
                  <Box sx={plpIconStyles.plpIconCss}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '16px', color: '#CD461D' }}
                    >
                      grain
                    </span>
                  </Box>
                  <Box sx={{ ...plpIconStyles.plpIconText, color: '#CD461D' }}>
                    {data?.values[0]?.stringValue}
                  </Box>
                </Box>
              </Box>
            </Grid>
          ) : null
        ) : null
      })}
    </Grid>
  )
}

export default PlpIconAttributes
