import { useEffect, useState } from 'react'

import {
  Box,
  GlobalStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material'
import { grey } from '@mui/material/colors'

import GetThemeSettings from '@/src/pages/api/getThemeSettings'

const styles = {
  a: {
    color: '#30299A',
    textDecoration: 'underline',
  },
  text: {
    color: `${grey[900]}`,
    fontFamily: 'Poppins',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '42px',
    padding: 0,
    paddingLeft: '20px',
  },
}

// Define TypeScript types
interface Property {
  attributeFQN: string
  values: { stringValue: string }[]
}

interface Product {
  properties?: Property[]
}

interface ApplicationRange {
  Application: string
  ApplicationDilutionRange: string
}

interface ThemeMapping {
  applId: string
  longName: string
}

interface ProductApplicationsProps {
  product: Product
  currentProduct: Product
}

const ProductApplications = ({ product, currentProduct }: any) => {
  const [themeCodeMapping, setThemeCodeMapping] = useState<ThemeMapping[]>([])
  const [applicationText, setApplicationText] = useState<string | null>(null)
  const [applicationTextVariant, setApplicationTextVariant] = useState<string | null>(null)
  const [applicationDilutionRange, setApplicationDilutionRange] = useState<ApplicationRange[]>([])
  const [newArray, setNewArray] = useState<ApplicationRange[]>([])
  const [showView, setShowView] = useState(false)

  useEffect(() => {
    const properties = product?.properties || []
    const getApplicationText = properties.find(
      (data: Property) => data.attributeFQN === 'tenant~application-text'
    )
    const getApplicationTextVariant = currentProduct?.properties?.find(
      (data: Property) => data.attributeFQN === 'tenant~application-text-variant'
    )
    const getApplicationDilutionRange = currentProduct?.properties?.find(
      (data: Property) => data.attributeFQN === 'tenant~application-dilution-range'
    )

    setApplicationText(getApplicationText?.values[0]?.stringValue || null)
    setApplicationTextVariant(getApplicationTextVariant?.values[0]?.stringValue || null)
    setApplicationDilutionRange(
      JSON.parse(getApplicationDilutionRange?.values[0]?.stringValue || '[]')
    )

    const hasRelevantData =
      !!getApplicationText || !!getApplicationTextVariant || !!getApplicationDilutionRange
    setShowView(hasRelevantData)
  }, [product, currentProduct])

  useEffect(() => {
    if (!applicationDilutionRange.length || !themeCodeMapping.length) return

    const updatedArray = applicationDilutionRange.map((data: ApplicationRange) => {
      const matchedItem = themeCodeMapping.find(
        (item) => data.Application.toLowerCase() === item.applId.toLowerCase()
      )
      return matchedItem
        ? {
            Application: matchedItem.longName,
            ApplicationDilutionRange: data.ApplicationDilutionRange,
          }
        : data
    })

    setNewArray(updatedArray)
  }, [applicationDilutionRange, themeCodeMapping])

  useEffect(() => {
    const fetchThemeSettings = async () => {
      try {
        const settings = await GetThemeSettings()
        setThemeCodeMapping(settings?.data?.themeCodeMapping || [])
      } catch (error) {
        console.error('Error fetching theme settings:', error)
      }
    }
    fetchThemeSettings()
  }, [])

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
      {showView && (
        <Box sx={{ width: '100%', maxWidth: '1200px' }}>
          <Typography variant="h3" sx={{ marginBottom: '10px' }}>
            Applications
          </Typography>

          {applicationText && (
            <Box sx={{ marginBottom: '22px', color: `${grey[900]}` }}>
              <Typography
                variant="body2"
                gutterBottom
                sx={{ color: '#020027' }}
                dangerouslySetInnerHTML={{
                  __html: applicationText,
                }}
              />
            </Box>
          )}

          {applicationTextVariant && (
            <Box sx={{ marginBottom: '22px', color: `${grey[900]}` }}>
              <Typography
                variant="body2"
                gutterBottom
                sx={{ color: '#020027' }}
                dangerouslySetInnerHTML={{
                  __html: applicationTextVariant,
                }}
              />
            </Box>
          )}

          {applicationDilutionRange.length > 0 && (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 0,
                boxShadow: '0px 1px 0px rgba(0,0,0,0.14),0px 1px 0px rgba(0,0,0,0.12)',
              }}
            >
              <Table>
                <TableBody>
                  {newArray.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell
                        variant="head"
                        sx={{
                          ...styles.text,
                          width: '25%',
                          backgroundColor: `${grey[300]}`,
                          fontWeight: 500,
                        }}
                      >
                        {data.Application}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...styles.text,
                          width: '75%',
                          color: `${grey[900]}`,
                          fontWeight: 300,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: data.ApplicationDilutionRange,
                        }}
                      />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <GlobalStyles styles={styles} />
        </Box>
      )}
    </Box>
  )
}

export default ProductApplications
