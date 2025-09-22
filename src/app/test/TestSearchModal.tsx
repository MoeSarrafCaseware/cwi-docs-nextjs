"use client";
import { useState, useEffect, useRef, useMemo } from "react";
// import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

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

type TestSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TestSearchModal({ isOpen, onClose }: TestSearchModalProps) {
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
          const results: SearchResult[] = data.results.map((result: { title: string; href: string; section: string; snippet: string; matchType: string }) => ({
            title: result.title,
            path: `/test/docs${result.href}`, // Route to test docs
            section: result.section,
            level: 1,
            type: 'page' as const,
            content: result.snippet,
            matchType: result.matchType
          }));
          
          const sectionResults: {[key: string]: SearchResult[]} = {};
          if (data.sectionResults) {
            Object.keys(data.sectionResults).forEach(section => {
              sectionResults[section] = data.sectionResults[section].map((result: { title: string; href: string; section: string; snippet: string; matchType: string }) => ({
                title: result.title,
                path: `/test/docs${result.href}`, // Route to test docs
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-[20vh] px-4">
        <div className="relative w-full max-w-2xl">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search documentation in ${getLanguageDisplay()}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg bg-purple-900/30 border border-purple-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono text-purple-300 bg-purple-800/50 border border-purple-600/50 rounded">
                ESC
              </kbd>
            </div>
          </div>

          {/* Search Results */}
          {query.length >= 2 && (
            <div className="mt-4 bg-black/90 border border-purple-800/50 rounded-lg shadow-2xl backdrop-blur-sm">
              {isSearching ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                  <p className="text-purple-400 text-sm">Searching...</p>
                </div>
              ) : searchData && searchData.results.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {searchData.sortedSections.map((section, _sectionIndex) => {
                    const sectionResults = searchData.sectionResults[section] || [];
                    if (sectionResults.length === 0) return null;

                    return (
                      <div key={section} className="border-b border-purple-800/30 last:border-b-0">
                        <div className="px-4 py-2 bg-purple-900/20 border-b border-purple-800/30">
                          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                            {section}
                          </h3>
                        </div>
                        <div className="py-1">
                          {sectionResults.map((result, resultIndex) => {
                            const globalIndex = allResults.findIndex(r => r === result);
                            const isSelected = globalIndex === selectedIndex;
                            
                            return (
                              <button
                                key={`${section}-${resultIndex}`}
                                onClick={() => handleSelect(result)}
                                className={`w-full text-left px-4 py-3 hover:bg-purple-800/30 transition-colors ${
                                  isSelected ? 'bg-purple-800/40 border-l-2 border-cyan-400' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      result.matchType === 'title' ? 'bg-cyan-400' : 
                                      result.matchType === 'content' ? 'bg-purple-400' : 'bg-gray-400'
                                    }`}></div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className={`text-sm font-medium ${
                                        isSelected ? 'text-cyan-300' : 'text-white'
                                      }`}>
                                        {result.title}
                                      </h4>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        result.matchType === 'title' ? 'bg-cyan-400/20 text-cyan-300' :
                                        result.matchType === 'content' ? 'bg-purple-400/20 text-purple-300' :
                                        'bg-gray-400/20 text-gray-300'
                                      }`}>
                                        {result.matchType}
                                      </span>
                                    </div>
                                    {result.content && (
                                      <p className="text-xs text-gray-400 line-clamp-2">
                                        {result.content}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-purple-400 font-mono">
                                        {result.path.replace('/test/docs', '')}
                                      </span>
                                    </div>
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
              ) : query.length >= 2 ? (
                <div className="p-6 text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-400 mb-1">No results found</p>
                  <p className="text-xs text-gray-500">Try different keywords or check your spelling</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Search Tips */}
          {query.length < 2 && (
            <div className="mt-4 bg-black/50 border border-purple-800/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Search Tips</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs bg-purple-800/50 border border-purple-600/50 rounded text-purple-300">↑↓</kbd>
                  <span>Navigate results</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs bg-purple-800/50 border border-purple-600/50 rounded text-purple-300">Enter</kbd>
                  <span>Select result</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs bg-purple-800/50 border border-purple-600/50 rounded text-purple-300">Esc</kbd>
                  <span>Close search</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
