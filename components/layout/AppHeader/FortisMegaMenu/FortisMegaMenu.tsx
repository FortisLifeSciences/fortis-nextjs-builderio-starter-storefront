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
    setHoveredMenu(menu)
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false)
      setHoveredMenu(null)
    }, 300) // Delay of 300ms before closing
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      {menuContent?.map((menu, index) => (
        <React.Fragment key={index}>
          <Box
            sx={{
              margin: '20px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onMouseOver={() => handleMouseEnter(menu)}
            onMouseLeave={handleMouseLeave}
          >
            <Typography
              variant="h5"
              sx={{ fontSize: '16px', fontWeight: '500', color: 'primary.main' }}
            >
              {menu.categoryName}
            </Typography>
            {hoveredMenu === menu ? (
              <KeyboardArrowUpIcon sx={{ color: 'primary.main', marginLeft: '10px' }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ color: 'primary.main', marginLeft: '10px' }} />
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
                onMouseEnter={() => handleMouseEnter(menu)}
                onMouseLeave={handleMouseLeave}
              >
                <MenuPopover
                  parentName={menu.categoryName}
                  parentLink={menu.categoryLink}
                  viewAllText={menu.viewAllText}
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
