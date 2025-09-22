"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import TestSearchModal from './TestSearchModal';

type TestSearchContextType = {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
};

const TestSearchContext = createContext<TestSearchContextType | undefined>(undefined);

export function TestSearchProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  // Handle Cmd+K shortcut - only respond when in /test route
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        // Only respond if we're in the /test route
        if (pathname.startsWith('/test')) {
          e.preventDefault();
          openSearch();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pathname]);

  return (
    <TestSearchContext.Provider value={{ isSearchOpen, openSearch, closeSearch }}>
      {children}
      <TestSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </TestSearchContext.Provider>
  );
}

export function useTestSearch() {
  const context = useContext(TestSearchContext);
  if (context === undefined) {
    throw new Error('useTestSearch must be used within a TestSearchProvider');
  }
  return context;
}
