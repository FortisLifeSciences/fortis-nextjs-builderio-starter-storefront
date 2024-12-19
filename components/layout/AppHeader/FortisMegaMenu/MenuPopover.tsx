import React, { useState } from 'react'

import EastIcon from '@mui/icons-material/East'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { Box, Divider, Grid, Paper, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

import {
  megaMenuContainer,
  menuItem,
  featuredContentColumn,
  submenuItem,
  arrowIcon,
  hoveredArrowIcon,
  menuSection,
  dividerStyle,
  subMenuSection,
  featuredText,
  animatedUnderline,
} from './MenuPopover.styles'

interface CustomDropdownProps {
  parentName: string
  parentLink: string
  viewAllText: string
  childCategory: any[]
  featuredContent: any[]
  typeOfMenu: string
  onClose: () => void
  onMouseEnter: () => void
}

const MenuPopover: React.FC<CustomDropdownProps> = ({
  parentName,
  parentLink,
  viewAllText,
  childCategory,
  featuredContent,
  typeOfMenu,
  onClose,
  onMouseEnter,
}) => {
  const [activeCategory, setActiveCategory] = useState(childCategory[0])

  const handleMouseEnterCategory = (category: (typeof childCategory)[0]) => {
    setActiveCategory(category)
  }

  const handleMouseLeave = () => {
    onClose()
  }

  const handleMouseOver = () => {
    onMouseEnter()
  }

  const handleLinkClick = () => {
    onClose() // Close the popover when a link is clicked
  }

  return (
    <Paper
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {typeOfMenu === 'Multi-tier menu' ? (
        <Box sx={megaMenuContainer}>
          <Grid container spacing={1} sx={{ alignItems: 'flex-start', alignContent: 'flex-start' }}>
            <Grid
              item
              xs={12}
              sx={{ height: '60px', display: 'flex', justifyContent: 'space-between' }}
            >
              <Typography variant="h3" sx={{ color: 'primary.main', fontStyle: 'normal' }}>
                {parentName}
              </Typography>
              {viewAllText && (
                <Box sx={submenuItem}>
                  <Link href={parentLink} passHref style={{ paddingLeft: '28px' }}>
                    <Typography
                      variant="body2"
                      sx={{ ...animatedUnderline, color: 'primary.main', fontStyle: 'normal' }}
                      onClick={handleLinkClick}
                    >
                      {viewAllText}
                    </Typography>
                  </Link>
                </Box>
              )}
            </Grid>
            <Divider sx={dividerStyle} />
            <Grid item xs={4} sx={menuSection}>
              {childCategory.map((category, index) =>
                !category.childCategory || category.childCategory.length === 0 ? (
                  // If no child categories, render the link directly
                  <Box key={index} sx={submenuItem}>
                    <Link href={category.categoryLink} passHref style={{ paddingLeft: '16px' }}>
                      <Typography
                        variant="body2"
                        sx={{ ...animatedUnderline, color: 'primary.main', fontStyle: 'normal', whiteSpace: 'normal' }}
                        onClick={handleLinkClick}
                      >
                        {category.categoryName}
                      </Typography>
                    </Link>
                  </Box>
                ) : (
                  // If there are child categories, render the normal category block
                  <Box
                    key={index}
                    sx={{
                      ...menuItem,
                      ...(category === activeCategory
                        ? {
                            backgroundColor: 'secondary.main',
                            borderLeft: '5px solid #30299A !important',
                          }
                        : {}),
                    }}
                    onMouseEnter={() => handleMouseEnterCategory(category)}
                  >
                    {category === activeCategory ? (
                      <>
                        <Typography
                          variant="body2"
                          sx={{ paddingLeft: '10px', color: 'primary.main', fontStyle: 'normal', whiteSpace: 'normal' }}
                        >
                          {category.categoryName}
                        </Typography>
                        <Box component="span" sx={hoveredArrowIcon}>
                          <EastIcon sx={{ color: 'primary.main' }} />
                        </Box>
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="body2"
                          sx={{ paddingLeft: '15px', color: 'primary.main', fontStyle: 'normal', whiteSpace: 'normal' }}
                        >
                          {category.categoryName}
                        </Typography>
                        <Box component="span" sx={arrowIcon}>
                          <NavigateNextIcon sx={{ color: 'primary.main' }} />
                        </Box>
                      </>
                    )}
                  </Box>
                )
              )}
            </Grid>
            <Grid item xs={4} sx={subMenuSection}>
              {activeCategory.childCategory?.map((submenu: any, index: any) => (
                <Box key={index} sx={submenuItem}>
                  <Link href={submenu.categoryLink} passHref style={{ paddingLeft: '28px' }}>
                    <Typography
                      variant="body2"
                      sx={{ ...animatedUnderline, color: 'primary.main', fontStyle: 'normal', whiteSpace: 'normal' }}
                      onClick={handleLinkClick}
                    >
                      {submenu.categoryName}
                    </Typography>
                  </Link>
                </Box>
              ))}
              <Box sx={{ ...submenuItem, marginTop: '50px' }}>
                <Link href={activeCategory.categoryLink} passHref style={{ paddingLeft: '28px' }}>
                  <Typography
                    variant="body2"
                    sx={{ ...animatedUnderline, color: 'primary.main', fontStyle: 'normal', whiteSpace: 'normal' }}
                    onClick={handleLinkClick}
                  >
                    View All {activeCategory.categoryName}
                  </Typography>
                </Link>
              </Box>
            </Grid>
            <Grid item xs={4} sx={menuSection}>
              {featuredContent.map((content, index) => (
                <Box key={index} className="featured-item" sx={featuredContentColumn}>
                  <Box sx={{ display: 'flex', borderRadius: '5px', overflow: 'hidden' }}>
                    <Image
                      src={content.image}
                      width={169}
                      height={130}
                      style={{ objectFit: 'cover' }}
                      alt="Featured Image"
                    />
                  </Box>
                  <Box sx={featuredText}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: '700',
                        color: 'primary.main',
                        height: 'auto',
                        whiteSpace: 'normal',
                        fontStyle: 'normal',
                      }}
                    >
                      {content.title}
                    </Typography>
                    <Link href={content.linkUrl} passHref>
                      <Typography
                        variant="body2"
                        sx={{
                          ...animatedUnderline,
                          color: 'primary.main',
                          whiteSpace: 'normal',
                          fontStyle: 'normal',
                        }}
                        onClick={handleLinkClick}
                      >
                        {content.linkText}
                      </Typography>
                    </Link>
                  </Box>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={megaMenuContainer}>
          <Grid container spacing={1}>
            <Grid item xs={12} sx={{ height: '60px' }}>
              <Typography variant="h3" sx={{ color: 'primary.main', fontStyle: 'normal' }}>
                {parentName}
              </Typography>
            </Grid>
            <Divider sx={dividerStyle} />
            <Grid
              container
              item
              xs={8}
              sx={{ padding: '16px', paddingTop: '37px !important', alignContent: 'flex-start' }}
            >
              {childCategory.map((category, index) => (
                <Grid item xs={6} key={index} sx={submenuItem}>
                  <Link href={category.categoryLink} passHref style={{ paddingLeft: '28px' }}>
                    <Typography
                      variant="body2"
                      sx={{ ...animatedUnderline, color: 'primary.main', fontStyle: 'normal' }}
                      onClick={handleLinkClick}
                    >
                      {category.categoryName}
                    </Typography>
                  </Link>
                </Grid>
              ))}
            </Grid>
            <Grid item xs={4} sx={menuSection}>
              {featuredContent.map((content, index) => (
                <Box key={index} className="featured-item" sx={featuredContentColumn}>
                  <Box
                    sx={{ display: 'flex', borderRadius: '5px', overflow: 'hidden', width: '50%' }}
                  >
                    <Image
                      src={content.image}
                      width={169}
                      height={130}
                      style={{ objectFit: 'cover' }}
                      alt="Featured Image"
                    />
                  </Box>
                  <Box sx={featuredText}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: '700',
                        color: 'primary.main',
                        height: 'auto',
                        whiteSpace: 'normal',
                        fontStyle: 'normal',
                      }}
                    >
                      {content.title}
                    </Typography>
                    <Link href={content.linkUrl} passHref>
                      <Typography
                        variant="body2"
                        sx={{
                          ...animatedUnderline,
                          color: 'primary.main',
                          whiteSpace: 'normal',
                          fontStyle: 'normal',
                        }}
                        onClick={handleLinkClick}
                      >
                        {content.linkText}
                      </Typography>
                    </Link>
                  </Box>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  )
}

export default MenuPopover
