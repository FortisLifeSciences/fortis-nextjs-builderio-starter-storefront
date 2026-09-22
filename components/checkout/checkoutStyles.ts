// Shared design tokens for the redesigned checkout flow (guest checkout, PO checkout).
// Keeping these in one place avoids drift between the components that reuse the same look.
export const checkoutColors = {
  border: '#D3D7D9',
  selectedBorder: '#30299A',
  selectedBg: '#EEF1FF',
  heading: '#070707',
  subtitle: '#333333',
  body: '#454545',
  placeholder: '#808080',
}

// Terms-checkbox / save-info-checkbox label copy
export const checkoutCheckboxLabelSx = {
  '& .MuiFormControlLabel-label': {
    fontFamily: 'Poppins',
    fontWeight: 400,
    fontSize: '15px',
    lineHeight: '150%',
    letterSpacing: '-0.005em',
  },
}

// "Place Order" / "Continue" primary buttons
export const checkoutPrimaryButtonSx = {
  padding: '16px 24px',
  borderRadius: '0px 24px', // top-left/bottom-right 0, top-right/bottom-left 24px
  boxShadow: 'none',
  cursor: 'pointer',
  fontFamily: 'Poppins',
  fontWeight: 600,
  fontSize: '16px',
  lineHeight: '100%',
  letterSpacing: '0%',
  textTransform: 'capitalize',
}
