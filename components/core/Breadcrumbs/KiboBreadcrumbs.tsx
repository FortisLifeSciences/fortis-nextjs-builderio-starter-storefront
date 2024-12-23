import React from 'react'

import { Typography } from '@mui/material'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from 'next/link'

import { BreadCrumb as BreadCrumbType } from '@/lib/types'

interface BreadcrumbsProps {
  breadcrumbs: BreadCrumbType[]
  separator?: string
}

export default function KiboBreadcrumbs({
  breadcrumbs,
  separator = '>',
  ...rest
}: BreadcrumbsProps) {
  return (
    <div role="presentation">
      <Breadcrumbs separator={separator} {...rest} sx={{ fontSize: '16px', fontWeight: '500' }}>
        {breadcrumbs?.map((item: BreadCrumbType, index) => {
          return (
            <Link href={item.link as string} key={index} passHref aria-label="breadcrumb-link">
              <Typography
                variant="body2"
                color="primary.main"
                sx={{
                  textDecoration: index + 1 < breadcrumbs.length ? 'underline' : 'none',
                  fontWeight: index + 1 < breadcrumbs.length ? '300' : '500',
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
