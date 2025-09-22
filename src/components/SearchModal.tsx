"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import sidebarNavigation from "../content/sidebar-navigation.json";
import searchIndex from "../content/search-index.json";

type SearchResult = {
  title: string;
  path: string;
  section: string;
  level: number;
  type: 'page' | 'section';
  content?: string;
  matchType: 'title' | 'content' | 'keyword';
};

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Flatten navigation data for search
  const searchData = useMemo(() => {
    const results: SearchResult[] = [];
    
    sidebarNavigation.navigationSections.forEach(section => {
      // Add section headers
      results.push({
        title: section.title,
        path: `#${section.id}`,
        section: section.title,
        level: 0,
        type: 'section',
        matchType: 'title'
      });

      // Recursively add all items
      const addItems = (items: any[], parentPath = "", level = 1) => {
        items.forEach(item => {
          // Use href field directly for navigation, fallback to name-based slug
          const itemSlug = item.href ? encodeURIComponent(item.href) : item.name.toLowerCase().replace(/\s+/g, "-");
          const itemPath = parentPath ? `${parentPath}/${itemSlug}` : `/docs/${itemSlug}`;
          
          // Get content from search index (use href as key if available)
          const searchKey = item.href ? item.href.replace(/^\//, '') : itemPath.replace('/docs/', '');
          const pageData = searchIndex.pages[searchKey as keyof typeof searchIndex.pages];
          
          results.push({
            title: item.name,
            path: itemPath,
            section: section.title,
            level,
            type: 'page',
            content: pageData?.content,
            matchType: 'title'
          });

          if (item.children) {
            addItems(item.children, itemPath, level + 1);
          }
        });
      };

      addItems(section.items);
    });

    return results;
  }, []);

  // Helper function to calculate match score
  const getScore = (item: SearchResult, query: string): number => {
    let score = 0;
    
    if (item.title.toLowerCase().includes(query)) score += 100;
    if (item.section.toLowerCase().includes(query)) score += 50;
    if (item.content?.toLowerCase().includes(query)) score += 30;
    
    if (item.type === 'page') {
      const searchKey = item.path.replace('/docs/', '');
      const pageData = searchIndex.pages[searchKey as keyof typeof searchIndex.pages];
      if (pageData?.keywords?.some(keyword => keyword.toLowerCase().includes(query))) {
        score += 20;
      }
    }
    
    return score;
  };

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    const results: SearchResult[] = [];
    
    searchData.forEach(item => {
      let matchType: 'title' | 'content' | 'keyword' = 'title';
      let score = 0;
      
      // Title match (highest priority)
      if (item.title.toLowerCase().includes(lowercaseQuery)) {
        score += 100;
        matchType = 'title';
      }
      
      // Section match
      if (item.section.toLowerCase().includes(lowercaseQuery)) {
        score += 50;
      }
      
      // Content match from search index
      if (item.content && item.content.toLowerCase().includes(lowercaseQuery)) {
        score += 30;
        matchType = 'content';
      }
      
      // Keyword match
      if (item.type === 'page') {
        const searchKey = item.path.replace('/docs/', '');
        const pageData = searchIndex.pages[searchKey as keyof typeof searchIndex.pages];
        if (pageData?.keywords?.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))) {
          score += 20;
          matchType = 'keyword';
        }
      }
      
      if (score > 0) {
        results.push({ ...item, matchType });
      }
    });
    
    // Sort by score (highest first) and limit to 8 results
    return results
      .sort((a, b) => {
        const aScore = getScore(a, lowercaseQuery);
        const bScore = getScore(b, lowercaseQuery);
        return bScore - aScore;
      })
      .slice(0, 8);
  }, [query, searchData, getScore]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleSelect(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Search effect
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.results) {
          const results: SearchResult[] = data.results.map((result: any) => ({
            title: result.title,
            path: `/docs/${encodeURIComponent(result.href)}`,
            section: result.section,
            level: 1,
            type: 'page' as const,
            content: result.snippet,
            matchType: result.matchType
          }));
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'page') {
      router.push(result.path);
    }
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-[20vh] px-4">
        <div className="relative w-full max-w-2xl">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono text-gray-400 bg-gray-700 border border-gray-600 rounded">
                ESC
              </kbd>
            </div>
          </div>

          {/* Results */}
          {query && (
            <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
              {isSearching ? (
                <div className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.path}-${index}`}
                      onClick={() => handleSelect(result)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                        index === selectedIndex ? 'bg-gray-700' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {result.type === 'section' ? (
                              <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                            <span className="text-white font-medium truncate">
                              {result.title}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-400">
                            <div className="truncate">
                              {result.section}
                              {result.level > 1 && (
                                <span className="text-gray-500">
                                  {' • '}
                                  {Array(result.level - 1).fill('').map((_, i) => (
                                    <span key={i} className="text-gray-500">→</span>
                                  ))}
                                </span>
                              )}
                            </div>
                            {result.content && result.matchType !== 'title' && (
                              <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                                {result.content.length > 100 
                                  ? result.content.substring(0, 100) + '...'
                                  : result.content
                                }
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono text-gray-400 bg-gray-700 border border-gray-600 rounded">
                            ↵
                          </kbd>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-300">No results found</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Try searching for something else
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {query && (
            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="inline-flex items-center px-1.5 py-0.5 text-xs font-mono bg-gray-700 border border-gray-600 rounded">
                    ↑↓
                  </kbd>
                  <span>to navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="inline-flex items-center px-1.5 py-0.5 text-xs font-mono bg-gray-700 border border-gray-600 rounded">
                    ↵
                  </kbd>
                  <span>to select</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="inline-flex items-center px-1.5 py-0.5 text-xs font-mono bg-gray-700 border border-gray-600 rounded">
                  ESC
                </kbd>
                <span>to close</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
