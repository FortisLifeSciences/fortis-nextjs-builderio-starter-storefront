import { Skeleton, Stack } from '@mui/material'

import type { SxProps, Theme } from '@mui/material'

export interface KiboSkeletonProps {
  // 'text' | 'rectangular' | 'rounded' | 'circular' - same variants as MUI's Skeleton.
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular'
  width?: number | string
  height?: number | string
  // Number of placeholder bars to stack - e.g. 3 for a few lines of a loading list.
  count?: number
  // Gap between bars when count > 1, in MUI spacing units.
  gap?: number | string
  sx?: SxProps<Theme>
}

// Generic, reusable loading placeholder - drop it anywhere a value/row/card is still loading.
// Wraps MUI's Skeleton so every usage across the app shares the same look and can be themed
// or swapped out in one place; `count` stacks several bars for list/paragraph-style placeholders.
const KiboSkeleton = (props: KiboSkeletonProps) => {
  const { variant = 'text', width = '100%', height, count = 1, gap = 1, sx } = props

  if (count <= 1) {
    return <Skeleton variant={variant} width={width} height={height} sx={sx} />
  }

  return (
    <Stack gap={gap}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant={variant} width={width} height={height} sx={sx} />
      ))}
    </Stack>
  )
}

export default KiboSkeleton
