import React, { ReactNode } from 'react'

import Close from '@mui/icons-material/Close'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  styled,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { Container, maxHeight } from '@mui/system'

import FullWidthDivider from '../FullWidthDivider/FullWidthDivider'
import theme from '@/styles/theme'

export interface KiboDialogProps {
  isOpen?: boolean
  Title?: ReactNode
  isAlignTitleCenter?: boolean
  showCloseButton?: boolean
  Content: ReactNode
  Actions?: ReactNode
  isDialogCentered?: boolean
  customMaxWidth?: string
  customMaxHeight?: string
  showContentTopDivider?: boolean
  showContentBottomDivider?: boolean
  onClose: () => void
}

interface StyledDialogProps {
  theme?: Theme
  customMaxWidth?: string
  customMaxHeight?: string
  isDialogCentered: boolean
}

const StyledDialog = styled(Dialog, {
  shouldForwardProp: (prop) => prop !== 'customMaxWidth' && prop !== 'isDialogCentered',
})(({ customMaxWidth, customMaxHeight, isDialogCentered }: StyledDialogProps) => ({
  '& .MuiDialogContent-root': {
    padding: 0,
    paddingBlock: '1rem',
    overflowY: 'unset',
  },
  '& .MuiDialogActions-root': {
    padding: 0,
    paddingBlock: '1rem',
  },
  '& .MuiDialog-paper': {
    margin: 0,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    ...(customMaxWidth && {
      maxWidth: customMaxWidth,
    }),
    ...(customMaxHeight && {
      maxHeight: customMaxHeight,
    }),
  },
  ...(isDialogCentered === false && {
    top: '3.438rem',
    '& .MuiDialog-scrollPaper': {
      alignItems: 'flex-start',
    },
    '& .MuiDialog-paperScrollBody': {
      verticalAlign: 'top',
    },
  }),
}))

const StyledDialogTitle = styled(DialogTitle)(() => ({
  margin: 0,
  padding: '20px 0 0 0',
}))

const StyledIconButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: '0.625rem',
  top: '0.625rem',
}))

const StyledClose = styled(Close)(() => ({
  width: '24px',
  height: '24px',
  color: '#8D8D8D',
}))

const CustomDialog = (props: KiboDialogProps) => {
  const {
    isOpen = true,
    Title,
    isAlignTitleCenter = false,
    showCloseButton = true,
    Content,
    Actions,
    customMaxWidth = '',
    showContentTopDivider = true,
    showContentBottomDivider = true,
    onClose,
  } = props

  const mdScreen = useMediaQuery(theme.breakpoints.up('md'))

  return (
    <StyledDialog
      onClose={onClose}
      aria-labelledby="kibo-dialog-title"
      open={isOpen}
      customMaxWidth={customMaxWidth}
      isDialogCentered={mdScreen ? true : false}
      data-test-id="kibo-dialog"
    >
      <Container maxWidth={'xl'}>
        <StyledDialogTitle
          id="kibo-dialog-title"
          textAlign={isAlignTitleCenter ? 'center' : 'left'}
        >
          {Title && (
            <Typography
              sx={{
                //styleName: H3;
                fontFamily: 'Poppins',
                fontSize: '30px',
                fontWeight: '500',
                lineHeight: '45px',
                textAlign: 'left',
                color: '#30299A',
              }}
              component="span"
            >
              {Title}
            </Typography>
          )}
          {showCloseButton && (
            <StyledIconButton aria-label="close" onClick={onClose}>
              <StyledClose />
            </StyledIconButton>
          )}
        </StyledDialogTitle>
        {showContentTopDivider && <FullWidthDivider />}
        <DialogContent style={{ paddingTop: '10px' }}>{Content}</DialogContent>
        {showContentBottomDivider && <FullWidthDivider />}
        {Actions != '' ? <DialogActions>{Actions}</DialogActions> : ''}
      </Container>
    </StyledDialog>
  )
}

export default CustomDialog
