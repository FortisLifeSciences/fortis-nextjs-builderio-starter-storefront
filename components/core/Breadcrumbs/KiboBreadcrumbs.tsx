import React from 'react'

import { Icon, Typography } from '@mui/material'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from 'next/link'

import { BreadCrumb as BreadCrumbType } from '@/lib/types'

interface BreadcrumbsProps {
  breadcrumbs: BreadCrumbType[]
  separator?: React.ReactNode
}

export default function KiboBreadcrumbs({
  breadcrumbs,
  separator = (
    <Icon className="material-icons-outlined" sx={{ fontSize: '16px', color: 'primary.main' }}>
      chevron_right
    </Icon>
  ),
  ...rest
}: BreadcrumbsProps) {
  return (
    <div role="presentation">
      <Breadcrumbs separator={separator} {...rest} sx={{ fontSize: '14px', fontWeight: '500' }}>
        {breadcrumbs?.map((item: BreadCrumbType, index) => {
          return (
            <Link href={item.link as string} key={index} passHref aria-label="breadcrumb-link">
              <Typography
                variant="body2"
                color="primary.main"
                sx={{
                  fontSize: '14px',
                  lineHeight: '20px',
                  textDecoration: index + 1 < breadcrumbs.length ? 'underline' : 'none',
                  fontWeight: '500',
                  '&:hover': { textDecoration: 'none' },
                }}
              >
                {item.text}
              </Typography>
            </Link>
          )
        })}
      </Breadcrumbs>
    </div>
  )
}
