"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";

type SearchResult = {
  title: string;
  path: string;
  section: string;
  level: number;
  type: 'page' | 'section';
  content?: string;
  matchType: 'title' | 'content' | 'keyword';
};

type SearchData = {
  results: SearchResult[];
  sectionResults: {[key: string]: SearchResult[]};
  sortedSections: string[];
  query: string;
};

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { currentLanguage, currentRegion, getLanguageDisplay } = useLanguage();

  // Flatten all results for keyboard navigation
  const allResults = useMemo(() => {
    if (!searchData) return [];
    const flattened: SearchResult[] = [];
    searchData.sortedSections.forEach(section => {
      if (searchData.sectionResults[section]) {
        flattened.push(...searchData.sectionResults[section]);
      }
    });
    return flattened;
  }, [searchData]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < allResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : allResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (allResults[selectedIndex]) {
            handleSelect(allResults[selectedIndex]);
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
  }, [isOpen, allResults, selectedIndex, onClose]);

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
      setSearchData(null);
      setIsSearching(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${currentLanguage}&region=${currentRegion}`);
        const data = await response.json();
        
        if (data.results) {
          const results: SearchResult[] = data.results.map((result: any) => ({
            title: result.title,
            path: `/docs${result.href}`,
            section: result.section,
            level: 1,
            type: 'page' as const,
            content: result.snippet,
            matchType: result.matchType
          }));
          
          const sectionResults: {[key: string]: SearchResult[]} = {};
          if (data.sectionResults) {
            Object.keys(data.sectionResults).forEach(section => {
              sectionResults[section] = data.sectionResults[section].map((result: any) => ({
                title: result.title,
                path: `/docs${result.href}`,
                section: result.section,
                level: 1,
                type: 'page' as const,
                content: result.snippet,
                matchType: result.matchType
              }));
            });
          }
          
          setSearchData({
            results,
            sectionResults,
            sortedSections: data.sortedSections || [],
            query: data.query
          });
        } else {
          setSearchData(null);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchData(null);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [query, currentLanguage, currentRegion]);

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
              placeholder={`Search documentation in ${getLanguageDisplay()}...`}
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
              {/* Language indicator */}
              <div className="px-4 py-2 bg-gray-700 border-b border-gray-600">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>Searching in {getLanguageDisplay()}</span>
                </div>
              </div>
              {isSearching ? (
                <div className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Searching...</p>
                </div>
              ) : searchData && allResults.length > 0 ? (
                <div className="py-2 max-h-96 overflow-y-auto">
                  {searchData.sortedSections.map((sectionTitle, sectionIndex) => {
                    const sectionResults = searchData.sectionResults[sectionTitle];
                    if (!sectionResults || sectionResults.length === 0) return null;
                    
                    return (
                      <div key={sectionTitle} className={`${sectionIndex > 0 ? 'mt-6' : ''}`}>
                        {/* Section Header */}
                        <div className="px-4 py-3 bg-gray-700 border-b border-gray-600">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="text-gray-200 font-semibold text-sm">{sectionTitle}</span>
                            <span className="text-gray-400 text-xs bg-gray-600 px-2 py-1 rounded-full">{sectionResults.length}</span>
                          </div>
                        </div>
                        
                        {/* Section Results */}
                        <div className="divide-y divide-gray-700">
                          {sectionResults.map((result, index) => {
                            const globalIndex = allResults.findIndex(r => r.path === result.path);
                            return (
                              <button
                                key={`${result.path}-${index}`}
                                onClick={() => handleSelect(result)}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                                  globalIndex === selectedIndex ? 'bg-blue-600' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span className="text-white font-medium truncate">
                                        {result.title}
                                      </span>
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
                                  <div className="ml-4 flex-shrink-0">
                                    <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono text-gray-400 bg-gray-700 border border-gray-600 rounded">
                                      ↵
                                    </kbd>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
