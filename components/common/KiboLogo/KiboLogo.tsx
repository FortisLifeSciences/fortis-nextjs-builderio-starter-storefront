import { Box } from '@mui/system'
import { StaticImageData } from 'next/image'

import KiboImage from '../KiboImage/KiboImage'
import Logo from '@/public/kibo_logo.png'

interface KiboLogoProps {
  logo?: string | StaticImageData // URL or File
  alt?: string
  small?: boolean
  mobile?: boolean
}

const styles = {
  logoContainer: {
    width: {
      xs: '120.5px',
      md: '163.5px',
    },
    height: {
      xs: '31.5px',
      md: '42.5px',
    },
  },
  smallLogo: {
    width: '134px',
    height: '35px',
  },
  mobileLogo: {
    width: '120.6px',
    height: '31.35px',
  },
}

const KiboLogo = ({ logo = Logo, alt = 'kibo-logo', small, mobile }: KiboLogoProps) => {
  return (
    <Box
      width={'100%'}
      sx={small ? styles.smallLogo : mobile ? styles.mobileLogo : styles.logoContainer}
    >
      <KiboImage src={logo} alt={alt} fill mobile loading="eager" />
    </Box>
  )
}

export default KiboLogo
