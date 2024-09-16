import { Builder } from '@builder.io/react'

export function registerDesignToken() {
  Builder.register('editor.settings', {
    designTokensOptional: true,
    styleStrictMode: false,
    designTokens: {
      colors: [
        { name: 'Purple', value: 'var(--brand-primary, #4C47C4)' },
        { name: 'Dark Purple', value: 'var(--brand-secondary, #30299A)' },
        { name: 'Light Purple', value: 'var(--brand-background, #E3E2FF)' },
        { name: 'Black', value: 'var(--brand-text-primary, #020027)' },
        { name: 'Dark Gray', value: 'var(--brand-text-secondary, #8D8D8D)' },
        { name: 'Light Gray', value: 'var(--brand-border, #EDEDED)' },
        { name: 'White', value: 'var(--brand-White, #FFFFFF)' },
        { name: 'Light Red', value: 'var(--brand-light-red, #EBC3C6)' },
        { name: 'Red', value: 'var(--brand-red, #BD3742)' },
      ],
      fontFamily: [{ name: 'Poppins', value: 'Poppins' }],
      fontSize: [
        { name: '40px', value: '40px' },
        { name: '38px', value: '38px' },
        { name: '30px', value: '30px' },
        { name: '26px', value: '26px' },
        { name: '24px', value: '24px' },
        { name: '22px', value: '22px' },
        { name: '20px', value: '20px' },
        { name: '18px', value: '18px' },
        { name: '16px', value: '16px' },
        { name: '14px', value: '14px' },
        { name: '11px', value: '11px' },
        { name: 'Button Pills', value: '16px' },
        { name: 'Breadcrumbs', value: '16px' },
        { name: 'Footnotes', value: '11px' },
      ],
      fontWeight: [
        { name: 'Poppins Light', value: '300' },
        { name: 'Poppins Medium ', value: '500' },
      ],
      lineHeight: [
        { name: '55px', value: '55px' },
        { name: '52px', value: '52px' },
        { name: '45px', value: '45px' },
        { name: '42px', value: '42px' },
        { name: '40px', value: '40px' },
        { name: '35px', value: '35px' },
        { name: '30px', value: '30px' },
        { name: '28px', value: '28px' },
        { name: '25px', value: '25px' },
        { name: '24px', value: '24px' },
        { name: '22px', value: '22px' },
        { name: '20px', value: '20px' },
      ],
      boxShadow: [
        { name: 'Component', value: '0 20px 20px 0 rgba(0, 0, 0, 0.20)' },
        { name: 'Large', value: '0 0 20px rgba(0, 0, 0, 0.5)' },
      ],
      borderRadius: [
        { name: 'Button Style', value: '0px 26px' },
        { name: 'Image', value: '100px 0px' },
      ],
      border: [
        { name: 'Secondary Button', value: '1px solid #30299A' },
        { name: 'Primary Button', value: '1px solid #FFF' },
      ],
      spacing: [
        { name: 'Tiny', value: '4px' },
        { name: 'Small', value: '8px' },
        { name: 'Medium', value: '16px' },
        { name: 'Large', value: '24px' },
        { name: 'XLarge', value: '32px' },
      ],
      opacity: [
        { name: 'Low', value: '0.3' },
        { name: 'Medium', value: '0.6' },
        { name: 'High', value: '1' },
      ],
    },
  })
}
