import { Builder } from '@builder.io/react'

import FeaturedPageButton from '@/components/customComponent/featuredPageButtonComponent'
import IconTextButton from '@/components/customComponent/iconAndTextButton'
import LeftTextHero from '@/components/customComponent/leftTextHeroComponent'
import Button from '@/components/customComponent/textButton'
import TextHero from '@/components/customComponent/textHeroComponent'

const BuilderComponents = () => {
  Builder.registerComponent(Button, {
    name: 'textButton',
    inputs: [{ name: 'textButton', type: 'text' }],
  })
  Builder.registerComponent(IconTextButton, {
    name: 'Icon And Text Button',

    inputs: [
      {
        name: 'title',
        type: 'text',
      },
      {
        name: 'Icon',
        type: 'file',
      },
    ],

    image:
      'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F6bef27ee40d24f3b88239fd7e616f82a',
  })
  Builder.registerComponent(TextHero, {
    name: 'Home Page Hero Banner Component',
    inputs: [
      {
        name: 'FirstImage',
        type: 'file',
        friendlyName: 'First Image',
      },
      {
        name: 'SecondImage',
        type: 'file',
        friendlyName: 'Second Image',
      },
      {
        name: 'paragraphText',
        type: 'richText', // Rich text editor
        friendlyName: 'Text with Rich Formatting',
        helperText: 'You can add normal text in the same paragraph.',
      },
    ],
  })
  Builder.registerComponent(LeftTextHero, {
    name: 'Left Text Hero Component',
    inputs: [
      {
        name: 'leftTextImage',
        type: 'file',
        friendlyName: 'Image',
        helperText: 'Upload the image for the component.',
      },
      {
        name: 'ImageAltText',
        type: 'text',
        friendlyName: 'Image Alt Text',
        helperText: 'Image Alt Text.',
      },
      {
        name: 'leftTextHeading',
        type: 'text',
        friendlyName: 'Heading Text',
        helperText: 'Heading Text.',
      },
      {
        name: 'backgroundImage',
        type: 'file',
        friendlyName: 'Background Image',
        helperText: 'Upload the background image for the leftTxtBox (optional).',
      },
      {
        name: 'leftTextParagraph',
        type: 'text',
        friendlyName: 'Paragraph Text',
        helperText: 'Paragraph Text.',
      },
      {
        name: 'primaryButtonText',
        type: 'text',
        friendlyName: 'Primary Button Text',
        helperText: 'Primary Button Text.',
      },
      {
        name: 'primaryButtonUrl',
        type: 'url',
        friendlyName: 'Primary Button URL',
        helperText: 'Primary Button URL.',
      },
      {
        name: 'secondaryButtonText',
        type: 'text',
        friendlyName: 'Secondary Button Text',
        helperText: 'Secondary Button Text.',
      },
      {
        name: 'secondaryButtonUrl',
        type: 'url',
        friendlyName: 'Secondary Button URL',
        helperText: 'Secondary Button URL.',
      },
    ],
  })
  Builder.registerComponent(FeaturedPageButton, {
    name: 'Featured Page Button Component',
    inputs: [
      {
        name: 'selectMode',
        type: 'string',
        friendlyName: 'Select Mode',
        enum: [
          { label: 'Metadata code', value: 'metadata' },
          { label: 'Manually enter value', value: 'manual' },
        ],
        defaultValue: 'manual',
      },
      {
        name: 'featuredButtonStyle',
        type: 'string',
        friendlyName: 'Button Style',
        enum: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
        ],
        defaultValue: 'primary',
      },
      {
        name: 'url',
        type: 'string',
        friendlyName: 'Metadata URL',
        helperText:
          'Enter the URL to fetch metadata from. This will only be used if "Metadata" mode is selected.',
        showIf: (options) => options.get('selectMode') === 'metadata', // Show only when metadata mode is selected
      },
      // Primary Fields
      {
        name: 'primaryImage',
        type: 'file',
        friendlyName: 'Primary Image',
        helperText: 'Upload the image for the primary style.',
        showIf: (options) => options.get('featuredButtonStyle') === 'primary',
      },
      {
        name: 'primaryHeadingText',
        type: 'text',
        friendlyName: 'Primary Heading Text',
        showIf: (options) => options.get('featuredButtonStyle') === 'primary',
      },
      {
        name: 'primaryParagraphText',
        type: 'text',
        friendlyName: 'Primary Paragraph Text',
        showIf: (options) => options.get('featuredButtonStyle') === 'primary',
      },

      // Secondary Fields
      {
        name: 'secondaryImage',
        type: 'file',
        friendlyName: 'Secondary Image',
        helperText: 'Upload the image for the secondary style.',
        showIf: (options) => options.get('featuredButtonStyle') === 'secondary',
      },
      {
        name: 'secondaryHeadingText',
        type: 'text',
        friendlyName: 'Secondary Heading Text',
        showIf: (options) => options.get('featuredButtonStyle') === 'secondary',
      },
      {
        name: 'secondaryParagraphText',
        type: 'text',
        friendlyName: 'Secondary Paragraph Text',
        showIf: (options) => options.get('featuredButtonStyle') === 'secondary',
      },
    ],
  })
}
export default BuilderComponents
