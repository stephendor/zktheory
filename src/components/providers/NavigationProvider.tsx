'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useNavigationStore } from '../../stores/navigationStore';

interface NavigationProviderProps {
  children: React.ReactNode;
}

export default function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const setCurrentPath = useNavigationStore(state => state.setCurrentPath);

  // Update navigation state when pathname changes
  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname, setCurrentPath]);

  // Close mobile menu and search when pathname changes
  useEffect(() => {
    const { setMobileMenuOpen, setSearchOpen } = useNavigationStore.getState();
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return <>{children}</>;
}