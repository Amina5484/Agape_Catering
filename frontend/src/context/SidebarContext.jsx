import React, { createContext, useState, useContext, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  // State for sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(false);
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State to track if we're on desktop view - use 768px as the threshold for mobile
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  // State to track if a card has been clicked
  const [hasClickedCard, setHasClickedCard] = useState(false);

  // Update isDesktop state when window resizes
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);

      // If going to mobile from desktop, close sidebar
      if (!desktop && sidebarVisible) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarVisible]);

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const showSidebar = () => {
    setSidebarVisible(true);
    setHasClickedCard(true);
  };

  const hideSidebar = () => {
    setSidebarVisible(false);
    setIsMobileMenuOpen(false);
    setHasClickedCard(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (!isMobileMenuOpen) {
      setSidebarVisible(true);
    }
  };

  // Only show hamburger on mobile
  const shouldShowHamburger = !isDesktop;

  // Desktop sidebar should be visible only after card click
  const shouldShowSidebar = isDesktop
    ? hasClickedCard && sidebarVisible
    : sidebarVisible;

  return (
    <SidebarContext.Provider
      value={{
        sidebarVisible: shouldShowSidebar,
        isMobileView: !isDesktop,
        setSidebarVisible,
        toggleSidebar,
        showSidebar,
        hideSidebar,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
        setHasClickedCard,
        hasClickedCard,
        shouldShowHamburger,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
