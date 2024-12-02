import React from 'react'

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material'
import Link from 'next/link'

import { grey } from '@/styles/theme'

const ProdAttr = [
  'tenant~target',
  'tenant~verified-reactivity',
  'tenant~applications-variant',
  'tenant~ph',
  'tenant~host',
  'tenant~clonality',
  'tenant~clone',
  'tenant~format',
  'tenant~immunogen',
  'tenant~iso-type',
  'tenant~conjugate-type-variant',
  'tenant~purity-variant',
  'tenant~antigen-species',
  'tenant~stock-concentration',
  'tenant~storage-variant',
  'tenant~storage-handling',
  'tenant~storage-buffer',
  'tenant~shelf-life-variant',
  'tenant~physical-state',
  'tenant~buffer',
  'tenant~usage-instructions',
  'tenant~prodprocedures-1',
  'tenant~country-of-origin',
  'tenant~contents',
  'tenant~contents-variant',
]

const ProductSpecifications = ({ product }: { product: any }) => {
  // Render the table rows based on product properties and ProdAttr
  const renderRows = () => {
    return ProdAttr.map((attributeFQN) => {
      // Find the property data that matches the current attributeFQN
      const property = product.properties.find((data: any) => data.attributeFQN === attributeFQN)
      if (property) {
        const name = property.attributeDetail.name || 'No Name Available'
        const valueArray: string[] = []
        if (property?.values) {
          property?.values.forEach((element: any) => {
            valueArray.push(element.stringValue)
          })
        }
        return (
          <TableRow key={attributeFQN}>
            <TableCell
              variant="head"
              sx={{
                width: '20%',
                backgroundColor: `${grey[300]}`,
                color: `${grey[900]}`,
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '42px',
                padding: 0,
                paddingLeft: '20px',
              }}
            >
              {name}
            </TableCell>
            <TableCell
              sx={{
                width: '80%',
                color: `${grey[900]}`,
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 300,
                lineHeight: '42px',
                padding: 0,
                paddingLeft: '20px',
                ul: {
                  marginLeft: '20px',
                },
              }}
              dangerouslySetInnerHTML={{
                __html: valueArray.join(', '),
              }}
            />
          </TableRow>
        )
      }
      return null // If no matching property is found, return nothing
    })
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'left' }}>
      <Box sx={{ width: '100%', maxWidth: '1200px' }}>
        <Typography variant="h3" pt={2} sx={{ marginBottom: '10px' }}>
          Specifications
        </Typography>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 0,
            boxShadow: '0px 1px 0px rgba(0,0,0,0.14),0px 1px 0px rgba(0,0,0,0.12)',
          }}
        >
          <Table>
            <TableBody>{renderRows()}</TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default ProductSpecifications
