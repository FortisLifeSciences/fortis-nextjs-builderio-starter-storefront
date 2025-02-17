import { createTheme } from '@mui/material/styles'
import type {} from '@mui/lab/themeAugmentation'
declare module '@mui/material/styles/createPalette' {
  interface PaletteOptions {
    red?: PaletteColorOptions
  }
}

// Extend MUI's SvgIconProps to accept custom font sizes
declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsSizeOverrides {
    '16px': true
  }
}

export const grey = {
  900: '#020027', //Fortis theme
  // Fill Form Label Text, information text
  700: '#494949',
  // Home Page background
  600: '#8D8D8D', //Fortis theme
  // Thin borders, placeholder text
  500: '#6A6A6A', //Fortis theme
  // Header Accent Color, page separator bar
  400: '#CDCDCD',
  // Button background and border color
  300: '#EDEDED', //Fortis theme
  // Order Summary Background
  100: '#F7F7F7',
  // Secondary Button (cancel button)
  50: '#FAFAFA',
}

export const red = {
  900: '#BD3742', //Fortis theme
  // wishlist color
  700: '#BD3742', //Fortis theme
  600: '#BD3742', //Fortis theme
  500: '#BD3742', //Fortis theme
  300: '#EBC3C6', //Fortis theme
  100: '#EBC3C6', //Fortis theme
  50: '#EBC3C6', //Fortis theme
}

const buttonStyleOverrides = {
  root: {
    textTransform: 'capitalize' as any,

    '&:hover': {
      boxShadow: 'none',
    },
  },
  containedPrimary: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
    ...(ownerState.disabled && {
      backgroundColor: `${theme.palette.primary.light} !important`,
      color: `${theme.palette.common.white} !important`,
    }),
  }),
  containedSecondary: {
    backgroundColor: grey[50],
    borderColor: grey[500],
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: grey[300],
    },
  },
  containedInherit: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: 'none',
    color: '#fff',
    '&:hover': {
      backgroundColor: grey[900],
    },
  },
}
// Create a base theme instance and define the basic design options
let theme = createTheme({
  typography: {
    fontFamily: 'Poppins',
    htmlFontSize: 16,
    h1: {
      fontSize: '2.5rem', // 40px
      fontWeight: '500',
      lineHeight: '3.438rem', // 55px
      '@media (max-width:910px)': {
        fontSize: '1.875rem', // 30px
        lineHeight: '2.625rem', // 42px
      },
    },
    h2: {
      fontSize: '2.375rem', // 38px
      fontWeight: '500',
      lineHeight: '3.25rem', // 52px
      '@media (max-width:910px)': {
        fontSize: '1.625rem', // 26px
        lineHeight: '2.188rem', // 35px
      },
    },
    h3: {
      fontSize: '1.875rem', // 30px
      fontWeight: '500',
      lineHeight: '2.813rem', // 45px
      '@media (max-width:910px)': {
        fontSize: '1.5rem', // 24px
        lineHeight: '2.188rem', // 35px
      },
    },
    h4: {
      fontSize: '1.25rem', // 20px
      fontWeight: '500',
      lineHeight: '1.563rem', // 25px
      '@media (max-width:910px)': {
        fontSize: '1rem', // 16px
        lineHeight: '1.375rem', // 22px
      },
    },
    h5: {
      fontSize: '1.5rem', // 24px
      fontWeight: '300',
      lineHeight: '2.188rem', // 35px
      '@media (max-width:910px)': {
        fontSize: '1.25rem', // 20px
        lineHeight: '1.875rem', // 30px
      },
    },
    h6: {
      fontSize: '0.875rem', // 14px
      fontWeight: '500',
      lineHeight: '1.25rem', // 20px
      '@media (max-width:910px)': {
        fontSize: '0.875rem', // 14px
        lineHeight: '1.25rem', // 20px
      },
    },
    subtitle1: {
      // footnote
      fontSize: '0.688rem', // 11px
      fontWeight: '500',
      lineHeight: '1.25rem', // 20px,
    },
    // subtitle2: {
    //   fontSize: '1rem', // 16px
    // },
    body1: {
      fontSize: '1.375rem', // 22px
      fontWeight: '300',
      lineHeight: 'normal',
      '@media (max-width:910px)': {
        fontSize: '1.125rem', // 18px
        lineHeight: '1.75rem', // 28px
      },
    },
    body2: {
      fontSize: '1rem', // 16px
      fontWeight: '300',
      lineHeight: '1.563rem', // 25px
      '@media (max-width:910px)': {
        fontSize: '0.875rem', // 14px
        lineHeight: '1.375rem', // 22px
      },
    },
    button: {
      //Button1-Large
      fontSize: '1.375rem', // 22px
      fontWeight: '300',
      lineHeight: '1.875rem', // 30px
      '@media (max-width:910px)': {
        fontSize: '1rem', // 16px
        lineHeight: '1.5rem', // 24px
      },
    },
  },
  palette: {
    primary: {
      main: '#30299A', //Fortis theme
      light: '#4C47C4', //Fortis theme
    },
    secondary: {
      main: '#E3E2FF', //Fortis theme
      light: '#FFFFFF',
    },
    text: {
      primary: grey[900],
      secondary: grey[500],
    },
    warning: {
      main: '#EBC3C6', //Fortis theme
    },
    error: {
      main: '#BD3742', //Fortis theme
    },
    success: {
      main: '#348345',
    },
    grey: { ...grey },
    red: { ...red },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        ...buttonStyleOverrides,
      },
    },
    MuiLoadingButton: {
      styleOverrides: {
        ...buttonStyleOverrides,
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          zIndex: 2000,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .Mui-selected': {
            backgroundColor: `${grey[900]} !important`,
            color: '#FFFFFF',
          },
        },
      },
    },
  },
})
// compose theme (place theme options that depend on the base theme here)
theme = createTheme(theme)
export default theme
