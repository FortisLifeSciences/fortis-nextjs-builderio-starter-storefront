const PHONE = '@media (max-width: 767px)'

const SIZE_CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 8 5 5 5-5'/%3E%3C/svg%3E\") no-repeat center/contain"

export const ProductCardLayoutStyles = {
  main: {
    height: '100%',
    '& a': {
      height: 'auto',
    },
    [PHONE]: {
      maxWidth: '100%',
    },
  },
  cardRoot: {
    height: '100%',
    '& > a.product-card, & > a.product-card-search': {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      width: '100%',
      textDecoration: 'none',
      color: 'inherit',
      cursor: 'pointer',
    },
    [PHONE]: {
      maxWidth: '100%',
      border: 0,
      borderBottom: '1px solid #EAEAF1',
      borderRadius: 0,
      overflow: 'visible',
      '&:hover': {
        boxShadow: 'none',
        borderColor: '#EAEAF1',
      },
    },
  },
  cardLinkBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    [PHONE]: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '14px 16px 0',
    },
  },
  cardMedia: {
    aspectRatio: '4 / 3',
    [PHONE]: {
      order: 2,
      flex: '0 0 56px',
      width: '56px',
      height: '56px',
      aspectRatio: 'auto',
      marginLeft: '12px',
      border: '1px solid #F2F2F7',
      borderRadius: '8px',
      overflow: 'hidden',
    },
  },
  cardContent: {
    minWidth: 0,
    padding: '14px',
    overflowWrap: 'anywhere',
    [PHONE]: {
      padding: 0,
    },
  },
  eyebrow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: '0 6px',
    minWidth: 0,
    [PHONE]: {
      gap: '0 5px',
    },
  },
  eyebrowSeparator: {
    color: '#8B8AA0',
    fontFamily: 'Poppins',
    fontSize: '10px',
    lineHeight: '16px',
  },
  brandLabel: {
    '&&': {
      fontSize: '10px',
    },
    [PHONE]: {
      fontWeight: '700',
      letterSpacing: '0.04em',
    },
  },
  productNameStyle: {
    marginTop: '4px',
    '&&': {
      fontSize: '13px',
    },
    [PHONE]: {
      marginTop: '3px',
      lineHeight: 1.35,
      WebkitLineClamp: 3,
      '&&': {
        fontSize: '15px',
      },
    },
  },
  catalogNum: {
    marginTop: 0,
    '&&': {
      fontSize: '11px',
    },
  },
  tagsRow: {
    gap: '5px',
    marginTop: '7px',
    [PHONE]: {
      display: 'block',
      marginTop: '3px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      color: '#5C5A70',
      fontFamily: 'Poppins',
      fontSize: '12.5px',
      lineHeight: 1.45,
    },
  },
  tagPill: {
    fontSize: '9.5px',
    [PHONE]: {
      display: 'inline',
      padding: 0,
      backgroundColor: 'transparent',
      borderRadius: 0,
      color: '#5C5A70',
      fontSize: '12.5px',
      fontWeight: '400',
      lineHeight: 1.45,
      '& + &::before': {
        content: '" · "',
      },
    },
  },
  badgeRow: {
    marginTop: '7px',
    [PHONE]: {
      flexWrap: 'nowrap',
      gap: '8px',
      marginTop: '3px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
  },
  badgeText: {
    '&&': {
      fontSize: '11px',
    },
  },
  ctaButton: {
    marginTop: 'auto',
    paddingTop: '15px',
    '& .MuiButton-root': {
      height: '36px',
      fontSize: '12px',
    },
    [PHONE]: {
      paddingTop: '10px',
      paddingBottom: '14px',
    },
  },
  buyBox: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 14px 14px',
    cursor: 'default',
    fontFamily: 'Poppins',
    [PHONE]: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0 12px',
      minHeight: '40px',
      padding: '10px 16px 14px',
    },
  },
  priceLine: {
    minWidth: 0,
    [PHONE]: {
      display: 'flex',
      flex: '1 1 auto',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      columnGap: '5px',
    },
  },
  price: {
    color: '#1B1A24',
    fontSize: '18px',
    fontWeight: '800',
    lineHeight: 1.6,
    letterSpacing: '-0.02em',
    fontFamily: 'Poppins',
    margin: 0,
    [PHONE]: {
      fontSize: '15px',
      fontWeight: '700',
      letterSpacing: 0,
      lineHeight: 1.35,
    },
  },
  priceOnRequest: {
    color: '#5C5A70',
    fontSize: '13px',
    fontWeight: '700',
    lineHeight: 1.6,
    fontFamily: 'Poppins',
    margin: 0,
    [PHONE]: {
      fontSize: '15px',
      lineHeight: 1.35,
    },
  },
  sizeLine: {
    color: '#8B8AA0',
    fontSize: '11px',
    fontWeight: '400',
    lineHeight: 1.6,
    fontFamily: 'Poppins',
    marginTop: '2px',
    [PHONE]: {
      marginTop: 0,
      color: '#5C5A70',
      fontSize: '12.5px',
      '&::before': {
        content: '"/ "',
      },
    },
  },
  sizeChange: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: 0,
    color: '#3B33B8',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 600,
    lineHeight: 'inherit',
    textAlign: 'left',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    '&::after': {
      content: '""',
      width: '9px',
      height: '9px',
      flexShrink: 0,
      backgroundColor: 'currentColor',
      WebkitMask: SIZE_CHEVRON,
      mask: SIZE_CHEVRON,
    },
    '&.Mui-focusVisible': { outline: '2px solid #30299A', outlineOffset: '3px' },
    [PHONE]: {
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: '-12px -6px',
      },
    },
  },
  buyNote: {
    color: '#5C5A70',
    fontSize: '11px',
    lineHeight: 1.6,
    fontFamily: 'Poppins',
    marginTop: '8px',
    [PHONE]: {
      flexBasis: '100%',
      marginTop: '4px',
    },
  },
  buyAction: {
    marginTop: '11px',
    '& .MuiButton-root': {
      display: 'block',
      width: '100%',
      height: 'auto',
      minHeight: '36px',
      padding: '9px',
      backgroundColor: '#30299A',
      border: '1px solid #30299A',
      borderRadius: '9px',
      color: '#FFFFFF',
      fontFamily: 'Poppins',
      fontSize: '12px',
      fontWeight: '700',
      lineHeight: 1.3,
      textAlign: 'center',
      textTransform: 'none',
      boxShadow: 'none',
      transition: 'background-color .15s ease, border-color .15s ease',
      '&:hover': {
        backgroundColor: '#3B33B8',
        borderColor: '#3B33B8',
        boxShadow: 'none',
      },
      '&.Mui-disabled': {
        color: '#FFFFFF',
        opacity: 0.6,
      },
      '&.add-to-cart-button, &.add-to-cart-button-search, &.custom-CTA-button, &.custom-CTA-button-search':
        {
          minHeight: '36px !important',
          padding: '9px !important',
          borderRadius: '9px !important',
          fontSize: '12px !important',
          lineHeight: '1.3 !important',
        },
      '&.added, &.added:hover': {
        backgroundColor: '#34BC34',
        borderColor: '#34BC34',
        opacity: 1,
      },
    },
    [PHONE]: {
      flexShrink: 0,
      marginTop: 0,
      '& .MuiButton-root, & .MuiButton-root.add-to-cart-button, & .MuiButton-root.add-to-cart-button-search, & .MuiButton-root.custom-CTA-button, & .MuiButton-root.custom-CTA-button-search':
        {
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'auto',
          minWidth: 0,
          minHeight: '36px !important',
          padding: '0 14px !important',
          borderRadius: '8px !important',
          fontSize: '12.5px !important',
          whiteSpace: 'nowrap',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-6px -4px',
          },
        },
      '& .MuiButton-root.custom-CTA-button, & .MuiButton-root.custom-CTA-button-search': {
        backgroundColor: '#FFFFFF',
        color: '#30299A',
        borderColor: '#30299A',
        '&:hover': {
          backgroundColor: '#F4F3FC',
          borderColor: '#30299A',
        },
      },
    },
  },
}
