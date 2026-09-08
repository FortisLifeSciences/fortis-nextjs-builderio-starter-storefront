import React from 'react'

import { Box, Typography } from '@mui/material'
import SvgIcon from '@mui/material/SvgIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { buildCategoryPathByCode } from '@/lib/helpers/buildStorefrontUrls'

type SvgIconComponent = typeof SvgIcon

const emptyCartColors = {
  heading: '#3F33CF',
  sectionTitle: '#070707',
  tileLabel: '#000000',
  tileBg: '#F8F9FC',
  iconBg: '#DFE6FF',
  icon: '#30299A',
}

const emptyCartIconsPath = '/emptycart-icons'

interface CategoryTile {
  label: string
  categoryCode: string
  // Filename under public/emptycart-icons
  iconSrc?: string
  // MUI icon fallback when no image exists
  icon?: SvgIconComponent
}

const productCategories: CategoryTile[] = [
  {
    label: 'Antibodies & Antigens',
    categoryCode: 'antibodies-antigens',
    iconSrc: 'Antibodies & Antigens.png',
  },
  { label: 'Assays & Kits', categoryCode: 'assays-kits', iconSrc: 'Assays & Kits.png' },
  { label: 'Bulk & OEM', categoryCode: 'bulk-oem', iconSrc: 'Bulk & OEM.png' },
  {
    label: 'Diagnostic Components',
    categoryCode: 'diagnostic-components',
    iconSrc: 'Diagnostic Components.png',
  },
  {
    label: 'Enzymes & Master Mixes',
    categoryCode: 'enzymes-master-mixes',
    iconSrc: 'Enzymes & Master Mixes.png',
  },
  {
    label: 'Lateral Flow Reagents',
    categoryCode: 'lateral-flow-reagents',
    iconSrc: 'Lateral FlowReagents.png',
  },
  { label: 'Nanoparticles', categoryCode: 'nanoparticles', iconSrc: 'Nanoparti-cles.png' },
  { label: 'VHH Libraries', categoryCode: 'vhh-libraries', iconSrc: 'VHH Libraries.png' },
  { label: 'Viral Vectors', categoryCode: 'viral-vectors', iconSrc: 'Viral Vectors.png' },
]

const serviceCategories: CategoryTile[] = [
  {
    label: 'Antibody Services',
    categoryCode: 'antibody-services',
    iconSrc: 'Antibodies & Antigens.png',
  },
  {
    label: 'Diagnostic Services',
    categoryCode: 'diagnostic-services',
    iconSrc: 'Diagnostic Components.png',
  },
  {
    label: 'Viral Vector Services',
    categoryCode: 'viral-vector-services',
    iconSrc: 'Viral Vectors.png',
  },
]

const CategoryGridTile = (props: CategoryTile) => {
  const { label, icon: Icon, iconSrc, categoryCode } = props

  return (
    <Link href={buildCategoryPathByCode(categoryCode)} style={{ textDecoration: 'none' }}>
      <Box
        data-testid={`empty-cart-category-${categoryCode}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8.8px',
          width: '118.76px',
          height: '149.55px',
          padding: '8.8px',
          borderRadius: '17.59px',
          opacity: 1,
          backgroundColor: emptyCartColors.tileBg,
          transition: 'background-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            backgroundColor: emptyCartColors.iconBg,
            transform: 'translateY(-2px)',
          },
        }}
      >
        {iconSrc ? (
          <Box
            sx={{
              position: 'relative',
              width: '80px',
              height: '70px',
            }}
          >
            <Image
              src={`${emptyCartIconsPath}/${iconSrc}`}
              alt={label}
              fill
              style={{ objectFit: 'contain' }}
              sizes="80px"
            />
          </Box>
        ) : (
          Icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: emptyCartColors.iconBg,
              }}
            >
              <Icon sx={{ color: emptyCartColors.icon, fontSize: '28px' }} />
            </Box>
          )
        )}
        <Typography
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: '21px',
            textAlign: 'center',
            color: emptyCartColors.tileLabel,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Link>
  )
}

const CategorySection = (props: { title: string; categories: CategoryTile[] }) => {
  const { title, categories } = props

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <Typography
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 400,
          fontSize: '20px',
          lineHeight: '140%',
          letterSpacing: '-0.005em',
          color: emptyCartColors.sectionTitle,
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: { xs: 'center', sm: 'flex-start' },
        }}
      >
        {categories.map((category) => (
          <CategoryGridTile key={category.categoryCode} {...category} />
        ))}
      </Box>
    </Box>
  )
}

const EmptyCart = () => {
  const { t } = useTranslation('common')

  return (
    <Box
      data-testid="empty-cart"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        paddingY: { xs: 3, md: 5 },
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontSize: { xs: '24px', md: '32px' },
          lineHeight: '120%',
          letterSpacing: '-0.01em',
          textTransform: 'capitalize',
          color: emptyCartColors.heading,
        }}
      >
        {t('empty-cart-title')}
      </Typography>

      <CategorySection title={t('browse-our-products')} categories={productCategories} />
      <CategorySection title={t('browse-our-services')} categories={serviceCategories} />
    </Box>
  )
}

export default EmptyCart
