export const LeftTextHeroStyle = {
  leftTxtHeroContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    maxWidth: '1366px',
    height: { md: '551px', sm: '550px', xs: '596px' },
    position: 'relative',
    flexDirection: { md: 'row', sm: 'row', xs: 'column' },
    paddingTop: '27px',
  },
  leftTxtBox: {
    width: '82.5%',
    height: { md: '516px' },
    position: 'absolute',
    top: '48%',
    transform: 'translateY(-50%)',
    left: 0,
    zIndex: 1,
    borderRadius: '5px',
    background: '#EDEDED',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexDirection: 'column',
    padding: '0 45px',
    backgroundSize: { md: 'cover', sm: 'contain', xs: 'cover' },
    backgroundRepeat: 'no-repeat',
    backgroundPosition: { xs: 'right top' },
    '@media (max-width: 600px)': {
      width: '100%',
      height: 'auto',
      position: 'relative',
      top: '30%',
      padding: '20px',
      zIndex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    '@media (min-width: 601px) and (max-width: 990px)': {
      padding: '0 20px',
      zIndex: 1,
      height: 'auto',
    },
  },
  leftTxtHeading: {
    color: '#30299A',
    width: { md: '589px', sm: '400px', xs: '345px' },
    height: { md: 'auto', xs: 'auto' },
    fontFamily: 'Poppins',
    fontSize: { md: '40px', xs: '30px' },
    fontWeight: { md: 500, xs: 500 },
    lineHeight: { md: '55px', xs: '42px' },
    marginBottom: { md: '27px', xs: '10px' },
    padding: { sm: '0 10px' },
    '@media (min-width: 900px) and (max-width: 990px)': {
      width: '560px',
    },
  },
  leftTxtParagraph: {
    color: '#020027',
    width: { md: '589px', sm: '350px', xs: '345px' },
    height: 'auto',
    fontFamily: 'Poppins',
    fontSize: { md: '22px', xs: '18px' },
    fontWeight: { md: 300, xs: 300 },
    lineHeight: { md: '35px', xs: '28px' },
    marginBottom: { md: '27px', xs: '15px' },
    padding: { sm: '0 10px' },
    '@media (min-width: 900px) and (max-width: 990px)': {
      width: '560px',
    },
  },
  leftTxtPrimaryButton: {
    backgroundColor: '#30299A',
    color: ' #fff',
    borderRadius: '0px 26px',
    border: '1px solid #FFF',
    display: 'inline-flex',
    padding: '12px 18px',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    height: { md: '49px' },
    '&:hover': {
      backgroundColor: '#4C47C4',
    },
  },
  leftTxtSecondaryButton: {
    backgroundColor: '#fff',
    color: '#30299A',
    borderRadius: '0px 26px',
    border: '1px solid #30299A',
    display: 'inline-flex',
    padding: '12px 18px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    width: 'auto',
    height: { md: '49px' },
    '&:hover': {
      backgroundColor: '#E3E2FF',
      border: '1px solid #E3E2FF',
      color: '#4C47C4',
    },
  },
  leftTxtImage: {
    width: '48%',
    height: { md: '551px', sm: '400px' },
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: 0,
    zIndex: 2,
    '@media (max-width: 600px)': {
      position: 'relative',
      width: '100%',
      height: '100%',
      top: 0,
      right: 0,
      zIndex: 2,
    },
    '@media (min-width: 601px) and (max-width: 990px)': {
      width: '48%',
    },
  },
}
