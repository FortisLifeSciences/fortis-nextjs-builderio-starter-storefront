import type { MouseEventHandler } from 'react'
import { Fragment } from 'react'

import { Typography, Badge, Box, Theme, Tooltip } from '@mui/material'
import { styled } from '@mui/material/styles'

interface HeaderActionProps {
  title?: string
  subtitle?: string
  icon?: any
  mobileIconColor?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  badgeContent?: string | number
  showTitleInMobile?: boolean
  iconFontSize?: 'small' | 'medium' | 'large'
  isElementVisible?: boolean
  source?: string
}
const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    fontSize: '0.625rem',
    height: '16px',
    minWidth: '16px',
    padding: '0 2px',
  },
}))

const styles = {
  hoverOver: { '&:hover': { textDecoration: 'underline', cursor: 'pointer' } },
}

const HeaderAction = (props: HeaderActionProps) => {
  const {
    title,
    subtitle,
    onClick,
    isElementVisible,
    badgeContent,
    mobileIconColor = 'white',
    showTitleInMobile = false,
    iconFontSize = 'large',
    source,
  } = props
  const Icon = props.icon

  // Conditional rendering for mobileHeader source
  if (source === 'mobileHeader') {
    return (
      <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={onClick}>
        <Typography
          variant="body2"
          color="primary"
          component="span"
          sx={{
            color: 'primary.main',
            textDecoration: 'underline',
            textDecorationColor: '#30299A',
            textUnderlineOffset: '6px',
          }}
        >
          Account
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{ cursor: 'pointer', marginX: 1 }}
      onClick={onClick}
    >
      {!isElementVisible ? (
        <Tooltip
          title={
            <Fragment>
              <Typography variant="body2">{title}</Typography>
              <Typography variant="body2">{subtitle}</Typography>
            </Fragment>
          }
        >
          <StyledBadge
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            color="primary"
            badgeContent={badgeContent}
          >
            {Icon && (
              <Icon
                fontSize={iconFontSize}
                sx={(theme: Theme) => ({
                  color: 'grey.900',
                  [theme.breakpoints.down('md')]: {
                    color: mobileIconColor,
                  },
                })}
              ></Icon>
            )}
          </StyledBadge>
        </Tooltip>
      ) : (
        <>
          <StyledBadge
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            color="primary"
            badgeContent={badgeContent}
          >
            {Icon && (
              <Icon
                fontSize={iconFontSize}
                sx={(theme: Theme) => ({
                  color: 'grey.900',
                  [theme.breakpoints.down('md')]: {
                    color: mobileIconColor,
                  },
                })}
              ></Icon>
            )}
          </StyledBadge>
          <Box
            ml={1}
            sx={{
              display: {
                xs: showTitleInMobile ? 'block' : 'none',
                md: 'block',
              },
            }}
          >
            <Typography
              variant="body2"
              component="span"
              fontWeight="bold"
              color="text.primary"
              sx={{ display: 'block', ...styles.hoverOver }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              component="span"
              color="text.primary"
              sx={{ display: 'block' }}
            >
              {subtitle}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  )
}

export default HeaderAction
