import { Box, Typography, Link, Grid } from '@mui/material'

const styles = {
  displayFlex: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '16px',
  },
  heading: {
    width: '22%',
    '@media (max-width: 600px)': {
      width: '50%',
    },
    '@media (min-width: 601px) and (max-width: 1024px)': {
      width: '32%',
    },
  },
  value: {
    width: '78%',
    '@media (max-width: 600px)': {
      width: '50%',
    },
    '@media (min-width: 601px) and (max-width: 1024px)': {
      width: '68%',
    },
  },
  headingFont: {
    color: 'text.primary',
    fontWeight: 500,
  },
  link: {
    color: 'primary.main',
    '&:hover': {
      color: 'primary.light',
      textDecoration: 'none',
    },
  },
}

const AdditionalProductInfo = (props: any) => {
  const { product } = props
  console.log('Product Details: ', product)
  const targetSentence = product?.properties?.find(
    (data: any) => data.attributeFQN === 'tenant~target-sentence'
  )
  const geneId = product?.properties?.find((data: any) => data.attributeFQN === 'tenant~gene-id')
  const geneSymbol = product?.properties?.find((data: any) => data.attributeFQN === 'tenant~symbol')
  const geneName = product?.properties?.find(
    (data: any) => data.attributeFQN === 'tenant~gene-name'
  )
  const uniportId = product?.properties?.find(
    (data: any) => data.attributeFQN === 'tenant~uniprot-id'
  )
  const proteinName = product?.properties?.find(
    (data: any) => data.attributeFQN === 'tenant~protein-name'
  )
  const alternateNames = product?.properties?.find(
    (data: any) => data.attributeFQN === 'tenant~gene-aliases'
  )

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', mb: 3 }}>
      {targetSentence && (
        <Box sx={{ mb: '19px' }}>
          <Typography variant="h3" sx={{ mb: '10px' }}>
            Additional Product Information
          </Typography>
          <Typography
            variant="body2"
            dangerouslySetInnerHTML={{
              __html: targetSentence?.values[0]?.stringValue,
            }}
          />
        </Box>
      )}
      {(geneId || geneSymbol || geneName || uniportId || proteinName) && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={6}>
            {geneId && (
              <Box sx={styles.displayFlex}>
                <Grid sx={styles.heading}>
                  <Typography variant="body2" sx={styles.headingFont}>
                    {geneId?.attributeDetail?.name} :
                  </Typography>
                </Grid>
                <Grid sx={styles.value}>
                  <Typography variant="body2">
                    <Link
                      href={`https://ncbi.nlm.nih.gov/gene/${geneId?.values[0]?.stringValue}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={styles.link}
                    >
                      {geneId?.values[0]?.stringValue}
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '16px', marginLeft: '8px' }}
                      >
                        open_in_new
                      </span>
                    </Link>
                  </Typography>
                </Grid>
              </Box>
            )}
            {geneSymbol && (
              <Box sx={styles.displayFlex}>
                <Grid sx={styles.heading}>
                  <Typography variant="body2" sx={styles.headingFont}>
                    {geneSymbol?.attributeDetail?.name} :
                  </Typography>
                </Grid>
                <Grid sx={styles.value}>
                  <Typography variant="body2">{geneSymbol?.values[0]?.stringValue}</Typography>
                </Grid>
              </Box>
            )}
            {geneName && (
              <Box sx={styles.displayFlex}>
                <Grid sx={styles.heading}>
                  <Typography variant="body2" sx={styles.headingFont}>
                    {geneName?.attributeDetail?.name} :
                  </Typography>
                </Grid>
                <Grid sx={styles.value}>
                  <Typography variant="body2">{geneName?.values[0]?.stringValue}</Typography>
                </Grid>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={6} sx={{ paddingTop: { xs: 0 } }}>
            {uniportId && (
              <Box sx={styles.displayFlex}>
                <Grid sx={styles.heading}>
                  <Typography variant="body2" sx={styles.headingFont}>
                    {uniportId?.attributeDetail?.name} :
                  </Typography>
                </Grid>
                <Grid sx={styles.value}>
                  <Typography variant="body2">
                    <Link
                      href={`https://www.uniprot.org/uniprotkb/${uniportId?.values[0]?.stringValue}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={styles.link}
                    >
                      {uniportId?.values[0]?.stringValue}
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '16px', marginLeft: '8px' }}
                      >
                        open_in_new
                      </span>
                    </Link>
                  </Typography>
                </Grid>
              </Box>
            )}
            {proteinName && (
              <Box sx={styles.displayFlex}>
                <Grid sx={styles.heading}>
                  <Typography variant="body2" sx={styles.headingFont}>
                    {proteinName?.attributeDetail?.name} :
                  </Typography>
                </Grid>
                <Grid sx={styles.value}>
                  <Typography variant="body2">{proteinName?.values[0]?.stringValue}</Typography>
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      )}
      {alternateNames && (
        <Box sx={{ mt: '4px' }}>
          <Typography variant="h4" sx={{ mb: '10px' }}>
            Alternate Names
          </Typography>
          <Typography
            variant="body2"
            dangerouslySetInnerHTML={{
              __html: alternateNames?.values[0]?.stringValue,
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default AdditionalProductInfo
