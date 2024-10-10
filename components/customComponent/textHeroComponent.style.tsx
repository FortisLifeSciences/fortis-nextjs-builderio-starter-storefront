/*Text Hero custom component */
export const TextHeroStyle = {
  containerBox: {
    display: 'flex',
    justifyContent: 'center',
  },
  heroComponent: {
    width: '100%',
    maxWidth: '1366px',
    height: { md: '565px', sm: '400px', xs: '339px' },
    position: 'relative',
    overflow: 'hidden',
  },
  image1: {
    width: '70.8%',
    height: '100%',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: 0,
    zIndex: 2,
    display: { xs: 'none', sm: 'block', md: 'block' },
  },
  image2: {
    width: '70.8%',
    height: '100%',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: 0,
    zIndex: 1,
    display: { xs: 'none', sm: 'block', md: 'block' },
  },
  paragraphText: {
    width: { md: 'auto', sm: '400px', xs: 'auto' },
    height: { md: 'auto', sm: 'auto', xs: '283px' },
    minHeight: '327px',
    borderRadius: '5px',
    backgroundSize: { md: 'contain', sm: 'contain', xs: 'contain' },
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 3,
    position: 'relative',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: { md: '30px', sm: '20px' },
    '@media (max-width: 480px)': {
      top: '40%',
    },
  },
  paragraphTextP: {
    fontFamily: 'Poppins',
    width: { md: '626px', sm: '450px', xs: 'auto' },
    fontSize: { md: '28px', sm: '20px', xs: '18px' },
    fontWeight: { md: 300, sm: 500, xs: 500 },
    lineHeight: { md: '42px', sm: '32px', xs: '30px' },
    textAlign: 'center',
    padding: { xs: '23px' },
  },
}
