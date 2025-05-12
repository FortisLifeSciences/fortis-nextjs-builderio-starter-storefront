import { Box, Button } from '@mui/material'
import { useTranslation } from 'next-i18next'

interface ManualFilterControlsProps {
  onClear: () => void
  onClose: () => void
  disabled: boolean
}

const ManualFilterControls = ({ onClear, onClose, disabled }: ManualFilterControlsProps) => {
  const { t } = useTranslation('common')

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: '0 1rem 1rem 1rem',
        backgroundColor: '#fff',
        position: 'sticky',
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <Button
        variant="contained"
        color="secondary"
        sx={{ textTransform: 'capitalize' }}
        disabled={disabled}
        onClick={onClear}
      >
        {t('clear-all')}
      </Button>
      <Button
        variant="contained"
        color="primary"
        sx={{ textTransform: 'capitalize', backgroundColor: 'rgb(76, 71, 196)' }}
        onClick={onClose}
      >
        {t('view-results')}
      </Button>
    </Box>
  )
}

export default ManualFilterControls
