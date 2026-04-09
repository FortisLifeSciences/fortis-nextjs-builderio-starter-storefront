import React, { ReactNode, useEffect, useState } from 'react'

import builder from '@builder.io/react'
import ArrowBackIos from '@mui/icons-material/ArrowBackIos'
import Close from '@mui/icons-material/Close'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Slide,
  Theme,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import type { Maybe, MenuItem, PrCategory } from '@/lib/gql/types'

interface CategoryNestedNavigationProps {
  categoryTree?: Maybe<PrCategory>[]
  children?: ReactNode
  onCategoryClick: (categoryCode: string, slug?: string) => void
  onCloseMenu: (isOpen: boolean) => void
}

const styles = {
  floatRight: {
    marginLeft: 'auto',
  },
  smallIcon: {
    fontSize: (theme: Theme) => theme.typography.body2,
    color: 'primary.main',
  },
  listHeader: {
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1.5,
    paddingBottom: 1.5,
  },
  listContent: {
    backgroundColor: 'common.white',
    paddingLeft: 2,
    paddingRight: 2,
  },
  directLinks: {
    color: 'primary.main',
    textDecoration: 'underline',
    textDecorationColor: '#30299A',
    textUnderlineOffset: '6px',
  },
}

const CategoryNestedNavigation = (props: CategoryNestedNavigationProps) => {
  const { children, onCloseMenu } = props
  const { t } = useTranslation('common')

  const router = useRouter()

  const initialSubHeader: {
    backLink: string | null
    categoryCode: string
    label: string | null
  } = {
    backLink: null,
    categoryCode: '',
    label: null,
  }

  useEffect(() => {
    async function fetchMenuContent() {
      try {
        const content = await builder.get('menu').toPromise()
        setMenuContent(content.data?.category)
      } catch (error) {
        console.error('Failed to fetch menu content:', error)
      }
    }
    fetchMenuContent()
  }, [])

  const [menuContent, setMenuContent] = useState<MenuItem[]>([])
  const [subHeader, setSubHeader] = useState<typeof initialSubHeader>(initialSubHeader)
  const [activeCategory, setActiveCategory] = useState<MenuItem[] | null>(menuContent)
  const [parentCategory, setParentCategory] = useState<MenuItem | null | undefined>(null)
  const [categoryStack, setCategoryStack] = useState<MenuItem[]>([])

  const gotoCart = () => {
    router.push('/cart')
    setParentCategory(null)
    onCloseMenu(true)
  }

  const handleClose = (shouldClose: boolean) => {
    reset()
    setParentCategory(null)
    onCloseMenu(shouldClose)
  }

  const reset = () => {
    setActiveCategory(menuContent)
    setSubHeader(initialSubHeader)
    setCategoryStack([])
  }

  const handleCategoryClick = (clickedCategory: Maybe<MenuItem>) => {
    if (clickedCategory?.childCategory?.length) {
      const selectedCategory: Maybe<MenuItem> = activeCategory?.find(
        (category) => category?.categoryCode === clickedCategory?.categoryCode
      ) as Maybe<MenuItem>

      setActiveCategory(selectedCategory?.childCategory as [])

      setSubHeader({
        backLink: t('back'),
        label: selectedCategory?.categoryName as string,
        categoryCode: selectedCategory?.categoryCode as string,
      })

      setParentCategory(selectedCategory)
      setCategoryStack((prev) => [...prev, selectedCategory as MenuItem])
    } else {
      null
    }
  }

  const handleBackClick = () => {
    // Pop the current level off the stack; the new top is the previous parent
    const newStack = categoryStack.slice(0, -1)
    setCategoryStack(newStack)

    const previousCategory = newStack.length > 0 ? newStack[newStack.length - 1] : null

    if (!previousCategory) {
      // Back at root
      setParentCategory(null)
      reset()
      return
    }

    setParentCategory(previousCategory)
    setActiveCategory(previousCategory?.childCategory as MenuItem[])
    setSubHeader({
      backLink: t('back'),
      label: previousCategory?.categoryName as string,
      categoryCode: previousCategory?.categoryCode as string,
    })
  }

  useEffect(() => {
    if (menuContent.length > 0) {
      setActiveCategory(menuContent)
    }
  }, [menuContent])

  const gotoContact = () => {
    router.push('/contact-us')
    setParentCategory(null)
    onCloseMenu(true)
  }
  return (
    <>
      <Box
        sx={{
          height: '8px',
          width: '100%',
          backgroundColor: 'secondary.main',
        }}
      ></Box>
      <List
        sx={{ width: '100%', bgcolor: 'background.paper', pb: 0 }}
        aria-labelledby="category-nested-list"
        role="list"
        subheader={
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            pl={2}
            pr={2}
            pt={'4px'}
            height={'52px'}
          >
            {subHeader.backLink !== null && (
              <>
                <IconButton
                  size="small"
                  aria-label="back-arrow-button"
                  onClick={handleBackClick}
                  sx={{ padding: 0 }}
                >
                  <ArrowBackIos sx={{ ...styles.smallIcon }} />
                </IconButton>
                <ListSubheader
                  component="div"
                  sx={{ ...styles.directLinks, flex: 1, paddingX: 1, color: 'primary.main' }}
                >
                  {subHeader.backLink}
                </ListSubheader>
              </>
            )}
            <IconButton size="small" aria-label="close-button" onClick={() => handleClose(false)}>
              <Close sx={{ color: 'primary.main' }} />
            </IconButton>
          </Box>
        }
      >
        {subHeader.label !== null && subHeader.label !== '' && (
          <ListItem sx={styles.listHeader}>
            <ListItemText
              primary={
                <Typography variant="h4" sx={{ color: 'primary.main' }}>
                  {subHeader.label}
                </Typography>
              }
            />
          </ListItem>
        )}
        {/* <Divider /> */}
        {activeCategory?.map((category: Maybe<MenuItem>, index: number) => {
          return (
            <>
              <Slide
                key={category?.categoryCode || index}
                direction="right"
                in={Boolean(activeCategory.length)}
                appear={true}
              >
                <Box>
                  {category?.childCategory?.length ? (
                    <ListItemButton
                      sx={{ paddingInline: 2 }}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant={category?.typeOfMenu ? 'h4' : 'body2'}
                            color="primary"
                          >
                            {category?.categoryName === 'About Fortis'
                              ? 'About'
                              : category?.categoryName}
                          </Typography>
                        }
                      />
                      <Box component="span">
                        <NavigateNextIcon sx={{ color: 'primary.main' }} />
                      </Box>
                    </ListItemButton>
                  ) : (
                    <ListItemButton sx={{ paddingInline: 2 }}>
                      <Link href={category?.categoryLink || '#'} passHref legacyBehavior>
                        <ListItemText
                          primary={
                            <Typography
                              variant={category?.typeOfMenu ? 'h4' : 'body2'}
                              sx={styles.directLinks}
                              color="primary"
                            >
                              {category?.categoryName === 'About Fortis'
                                ? 'About'
                                : category?.categoryName}
                            </Typography>
                          }
                          onClick={() => handleClose(true)}
                        />
                      </Link>
                    </ListItemButton>
                  )}
                </Box>
              </Slide>
            </>
          )
        })}
        {parentCategory && parentCategory !== undefined && (
          <ListItemButton sx={{ paddingInline: 2 }}>
            <Link href={parentCategory?.categoryLink || '#'} passHref legacyBehavior>
              <ListItemText
                primary={
                  <Typography variant={'body2'} sx={styles.directLinks} color="primary">
                    {parentCategory?.viewAllText
                      ? parentCategory.viewAllText
                      : `View All ${parentCategory?.categoryName}`}
                  </Typography>
                }
                onClick={() => handleClose(true)}
              />
            </Link>
          </ListItemButton>
        )}
        {children && subHeader.label === initialSubHeader.label && (
          <>
            <Divider variant="middle" sx={{ paddingTop: '12px', marginBottom: '16px' }} />
            <ListItemButton sx={styles.listContent} onClick={gotoContact}>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={styles.directLinks} color="primary">
                    Contact
                  </Typography>
                }
              />
            </ListItemButton>
            <ListItemButton sx={styles.listContent}>
              <ListItemText primary={children} />
            </ListItemButton>
            <ListItemButton onClick={gotoCart} sx={styles.listContent}>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={styles.directLinks} color="primary">
                    Cart
                  </Typography>
                }
              />
            </ListItemButton>
          </>
        )}
      </List>
    </>
  )
}

export default CategoryNestedNavigation
