import React, { useState, useEffect, useRef, useCallback } from 'react'

import builder from '@builder.io/react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { Box } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import Router, { useRouter } from 'next/router'

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
  const router = useRouter()
  const [menuContent, setMenuContent] = useState<MenuItem[] | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])

  const closeMenu = useCallback(() => setOpenIndex(null), [])

  const toggleMenu = (index: number) =>
    setOpenIndex((current) => (current === index ? null : index))

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

  useEffect(() => {
    closeMenu()
  }, [router.asPath, closeMenu])

  useEffect(() => {
    Router.events.on('routeChangeStart', closeMenu)

    return () => {
      Router.events.off('routeChangeStart', closeMenu)
    }
  }, [closeMenu])

  useEffect(() => {
    if (openIndex === null) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const trigger = triggerRefs.current[openIndex]
      closeMenu()
      trigger?.focus()
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      closeMenu()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [openIndex, closeMenu])

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    closeMenu()
  }

  const handleTriggerKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowDown') return
    event.preventDefault()
    setOpenIndex(index)
    requestAnimationFrame(() => panelRefs.current[index]?.focus())
  }

  return (
    <Box
      ref={rootRef}
      onBlur={handleBlur}
      sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}
    >
      {menuContent?.map((menu, index) => {
        const isOpen = openIndex === index

        return (
          <React.Fragment key={index}>
            <Box
              component="button"
              type="button"
              id={`mega-menu-trigger-${index}`}
              aria-haspopup="true"
              aria-expanded={isOpen}
              aria-controls={`mega-menu-panel-${index}`}
              ref={(el: HTMLButtonElement | null) => {
                triggerRefs.current[index] = el
              }}
              onClick={() => toggleMenu(index)}
              onKeyDown={(event: React.KeyboardEvent) => handleTriggerKeyDown(event, index)}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '8px',
                gap: '8px',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontSize: '15px',
                lineHeight: '150%',
                letterSpacing: '-0.005em',
                color: scrolled ? 'primary.main' : 'common.white',
                whiteSpace: 'nowrap',
              }}
            >
              {menu.categoryName === 'About Fortis' ? 'About Fortis' : menu.categoryName}
              {isOpen ? (
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
              {isOpen && (
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
                    width: 'min(1200px, calc(100vw - 48px))',
                  }}
                  id={`mega-menu-panel-${index}`}
                  role="region"
                  aria-labelledby={`mega-menu-trigger-${index}`}
                  tabIndex={-1}
                  ref={(el: HTMLDivElement | null) => {
                    panelRefs.current[index] = el
                  }}
                >
                  <MenuPopover
                    parentName={menu.categoryName}
                    parentLink={menu.categoryLink}
                    viewAllText={menu.categoryName === 'Services' ? '' : menu.viewAllText}
                    childCategory={menu.childCategory}
                    featuredContent={menu.featuredContent}
                    typeOfMenu={menu.typeOfMenu}
                    onClose={closeMenu}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </React.Fragment>
        )
      })}
    </Box>
  )
}

export default FortisMegaMenu
