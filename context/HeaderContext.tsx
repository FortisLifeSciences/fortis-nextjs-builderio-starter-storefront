import { createContext, ReactNode, useContext, useState } from 'react'

interface HeaderState {
  isHamburgerMenuVisible?: boolean
  isSearchBarVisible?: boolean
  isStoreLocatorVisible?: boolean
  isMobileSearchPortalVisible?: boolean
  isCartDrawerVisible?: boolean
}

export interface HeaderContextType {
  headerState: HeaderState
  toggleSearchBar: (value: boolean) => void
  toggleHamburgerMenu: () => void
  toggleStoreLocator: () => void
  toggleMobileSearchPortal: () => void
  toggleCartDrawer: (value?: boolean) => void
}

interface HeaderContextProviderProps {
  children: ReactNode
}

export const HeaderContext = createContext({
  headerState: {
    isSearchBarVisible: false,
    isHamburgerMenuVisible: false,
    isStoreLocatorVisible: false,
    isMobileSearchPortalVisible: false,
    isCartDrawerVisible: false,
  },
  toggleSearchBar: (value: boolean) => null,
  toggleHamburgerMenu: () => null,
  toggleStoreLocator: () => null,
  toggleMobileSearchPortal: () => null,
  toggleCartDrawer: (value?: boolean) => null,
} as HeaderContextType)

export const HeaderContextProvider = ({ children }: HeaderContextProviderProps) => {
  const [headerState, setHeaderState] = useState<HeaderState>({
    isSearchBarVisible: false,
    isHamburgerMenuVisible: false,
    isStoreLocatorVisible: false,
    isMobileSearchPortalVisible: false,
    isCartDrawerVisible: false,
  })

  const toggleSearchBar = (value: boolean) =>
    setHeaderState({ ...headerState, isSearchBarVisible: value })

  const toggleHamburgerMenu = () => {
    setHeaderState({
      ...headerState,
      isMobileSearchPortalVisible: false,
      isHamburgerMenuVisible: !headerState.isHamburgerMenuVisible,
    })
  }

  const toggleStoreLocator = () =>
    setHeaderState({
      ...headerState,
      isMobileSearchPortalVisible: false,
      isStoreLocatorVisible: !headerState.isStoreLocatorVisible,
    })

  const toggleMobileSearchPortal = () =>
    setHeaderState({
      ...headerState,
      isHamburgerMenuVisible: false,
      isMobileSearchPortalVisible: !headerState.isMobileSearchPortalVisible,
    })

  const toggleCartDrawer = (value?: boolean) =>
    setHeaderState({
      ...headerState,
      isCartDrawerVisible: value !== undefined ? value : !headerState.isCartDrawerVisible,
    })

  const values = {
    headerState,
    toggleSearchBar,
    toggleHamburgerMenu,
    toggleStoreLocator,
    toggleMobileSearchPortal,
    toggleCartDrawer,
  }
  return <HeaderContext.Provider value={values}>{children}</HeaderContext.Provider>
}

export const useHeaderContext = () => {
  const context = useContext(HeaderContext)

  if (context === undefined) throw new Error('useContext must be inside a Provider with a value')
  return context
}
