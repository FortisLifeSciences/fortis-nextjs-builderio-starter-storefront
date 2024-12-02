import React, { useState, useEffect } from 'react'

import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import Link from 'next/link'

import styles from './ProductRecentDocuments.module.css'
import { grey } from '@/styles/theme'

const tableCellStyles = {
  color: grey[900],
  fontFamily: 'Poppins',
  fontSize: '16px',
  fontWeight: 300,
  lineHeight: '42px',
  padding: 0,
  paddingLeft: '20px',
  paddingTop: '10px',
}

const tableCellLinkStyle = {
  color: '#30299A',
  display: 'inline-flex',
  alignItems: 'center',
  fontWeight: 500,
}

const ProductRecentDocuments = (props: any) => {
  const { code, properties, documents } = props
  const hostUrl = `https://${process.env.NEXT_PUBLIC_KIBO_HOST}`

  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [showAllChecked, setShowAllChecked] = useState(false)

  const getCurrentLotAttributeValue = () => {
    return (
      properties.find((property: any) => property.attributeFQN === 'tenant~current-lot-variant')
        ?.value || null
    )
  }

  const showAllDocuments = (event: any) => {
    setShowAllChecked(event.target.checked)
  }

  const filterDocuments = (showAll: boolean) => {
    if (showAll) {
      return documents.filter(
        (document: any) =>
          document.properties.assettype && document.properties.assettype !== 'ProductImage'
      )
    } else {
      return documents.filter(
        (document: any) =>
          document.properties.assettype &&
          document.properties.assettype !== 'ProductImage' &&
          document.properties.displayonpdp
      )
    }
  }

  useEffect(() => {
    setFilteredDocuments(filterDocuments(showAllChecked))
  }, [showAllChecked, documents])

  if (!filterDocuments.length) {
    return null
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h3" pt={2} sx={{ mb: '10px', color: '#30299A', fontSize: '30px' }}>
        Recent Documents for {code}
      </Typography>
      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
        <FormControlLabel
          control={<Checkbox checked={showAllChecked} onChange={showAllDocuments} />}
          label="Show All Documents"
          sx={{ '& .MuiFormControlLabel-label': { fontSize: '16px' } }}
        />
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 0,
          boxShadow: '0px 1px 0px rgba(0,0,0,0.14),0px 1px 0px rgba(0,0,0,0.12)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {['Document', 'Lot', ''].map((header, index) => (
                <TableCell
                  key={index}
                  sx={{
                    ...tableCellStyles,
                    backgroundColor: grey[300],
                    fontWeight: 500,
                    paddingTop: 0,
                    width: index === 0 ? '60%' : index === 1 ? '25%' : '15%',
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((document: any) => (
              <TableRow key={document.id}>
                <TableCell sx={{ ...tableCellStyles, width: '60%' }}>
                  <Link
                    href={`${hostUrl}${'/cms/files/'}${document.properties.salsifyname}`}
                    target="_blank"
                    style={{
                      ...tableCellLinkStyle,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ marginRight: '5px' }}>
                      draft
                    </span>
                    <span className={styles.customLink}>
                      {document.properties.assettype === 'Datasheet'
                        ? 'Product Data Sheet'
                        : 'Safety Data Sheet'}
                    </span>
                  </Link>
                </TableCell>
                <TableCell sx={{ ...tableCellStyles, paddingLeft: 0, width: '25%' }}>
                  <span>
                    {document.properties.assetlotnumber
                      ? `${document.properties.assetlotnumber} ${
                          document.properties.assetlotnumber === getCurrentLotAttributeValue()
                            ? '(current lot)'
                            : ''
                        }`
                      : ''}
                  </span>
                </TableCell>
                <TableCell sx={{ ...tableCellStyles, textAlign: 'left', width: '15%' }}>
                  <Link
                    href={`${hostUrl}${'/cms/files/'}${document.properties.salsifyname}`}
                    target="_blank"
                    style={{
                      ...tableCellLinkStyle,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ marginRight: '5px' }}>
                      download
                    </span>
                    <span className={styles.customLink}>Download</span>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default ProductRecentDocuments
