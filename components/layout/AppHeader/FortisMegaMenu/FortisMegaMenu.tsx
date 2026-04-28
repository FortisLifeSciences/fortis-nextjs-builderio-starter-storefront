import React, { useState, useEffect, useRef } from 'react'

import builder from '@builder.io/react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { Box, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

import MenuPopover from './MenuPopover'

interface MenuItem {
  viewAllText: string
  categoryLink: string
  categoryName: string
  childCategory: any[]
  featuredContent: any[]
  typeOfMenu: string
}

interface MegaMenuProps {
  scrolled?: boolean
}

export const FortisMegaMenu: React.FC<MegaMenuProps> = ({ scrolled }) => {
  const [menuContent, setMenuContent] = useState<MenuItem[] | null>(null)
  const [hoveredMenu, setHoveredMenu] = useState<MenuItem | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Ref to manage timeout

  useEffect(() => {
    async function fetchMenuContent() {
      try {
        const content = await builder.get('menu').toPromise()
        {
          content && setMenuContent(content.data?.category)
        }
      } catch (error) {
        console.error('Failed to fetch menu content:', error)
      }
    }
    fetchMenuContent()
  }, [])

  const handleMouseEnter = (menu: MenuItem) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current) // Cancel any pending hide timeout
    }
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(menu)
      setIsDropdownOpen(true)
    }, 300)
  }

  const handleMouseLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false)
      setHoveredMenu(null)
    }, 300) // Delay of 300ms before closing
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {menuContent?.map((menu, index) => (
        <React.Fragment key={index}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px',
              gap: '8px',
              cursor: 'pointer',
            }}
            onMouseOver={() => handleMouseEnter(menu)}
            onMouseLeave={handleMouseLeave}
          >
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontSize: '15px',
                lineHeight: '150%',
                letterSpacing: '-0.005em',
                color: scrolled ? 'primary.main' : 'common.white',
                whiteSpace: 'nowrap',
              }}
              tabIndex={0}
              onFocus={() => handleMouseEnter(menu)}
              onBlur={handleMouseLeave}
            >
              {menu.categoryName === 'About Fortis' ? 'About Fortis' : menu.categoryName}
            </Typography>
            {hoveredMenu === menu ? (
              <KeyboardArrowUpIcon
                sx={{ color: scrolled ? 'primary.main' : 'common.white', fontSize: '20px' }}
              />
            ) : (
              <KeyboardArrowDownIcon
                sx={{ color: scrolled ? 'primary.main' : 'common.white', fontSize: '20px' }}
              />
            )}
          </Box>

          <AnimatePresence>
            {isDropdownOpen && hoveredMenu === menu && (
              <motion.div
                initial={{ opacity: 0, translateY: -10, translateX: '-50%' }}
                animate={{ opacity: 1, translateY: 0, translateX: '-50%' }}
                exit={{ opacity: 0, translateY: -10, translateX: '-50%' }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  top: scrolled ? '66px' : '82px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1,
                  display: 'flex',
                  boxShadow: '3px 3px 10px rgba(0,0,0,0.2)',
                  width: '1200px',
                }}
                tabIndex={0}
                onMouseEnter={() => handleMouseEnter(menu)}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter(menu)}
                onBlur={handleMouseLeave}
              >
                <MenuPopover
                  parentName={menu.categoryName}
                  parentLink={menu.categoryLink}
                  viewAllText={menu.categoryName === 'Services' ? '' : menu.viewAllText}
                  childCategory={menu.childCategory}
                  featuredContent={menu.featuredContent}
                  typeOfMenu={menu.typeOfMenu}
                  onMouseEnter={() => handleMouseEnter(menu)}
                  onClose={handleMouseLeave}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </React.Fragment>
      ))}
    </Box>
  )
}

export default FortisMegaMenu
