"use client";
import Image from "next/image";
import { useSearch } from "./SearchProvider-new";
import { useLanguage } from "@/components/LanguageProvider";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const { openSearch } = useSearch();
  const { currentLanguage, currentRegion, availableLanguages, setLanguage, getLanguageDisplay } = useLanguage();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageSelect = (language: string, region: string) => {
    setLanguage(language, region);
    setIsLanguageDropdownOpen(false);
    
    // Navigate to the equivalent page in the new language
    if (pathname.startsWith('/docs/')) {
      const pathSegments = pathname.split('/');
      if (pathSegments.length >= 3) {
        // Find the language segment index
        let languageIndex = -1;
        for (let i = 0; i < pathSegments.length; i++) {
          if (pathSegments[i] === 'docs' && i + 1 < pathSegments.length) {
            languageIndex = i + 1;
            break;
          }
        }
        
        if (languageIndex !== -1) {
          // Replace the language segment with the new language
          pathSegments[languageIndex] = language;
          const newPath = pathSegments.join('/');
          router.push(newPath);
        }
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black backdrop-blur border-b border-purple-900/30">
      <div className="max-w mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo and language selector */}
          <div className="flex items-center gap-3">
            <Image src="/caseware-logo.svg" alt="Caseware" width={130} height={22} priority />
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="inline-flex items-center gap-1 rounded-full bg-purple-900/20 border border-purple-700/50 px-2.5 py-1 text-xs text-purple-200 hover:bg-purple-800/30 transition-colors"
              >
                {getLanguageDisplay()}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-black border border-purple-700/50 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {availableLanguages.map((lang) => (
                      <div key={lang.code}>
                        <div className="px-3 py-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                          {lang.name}
                        </div>
                        {lang.regions.map((region) => (
                          <button
                            key={`${lang.code}-${region}`}
                            onClick={() => handleLanguageSelect(lang.code, region)}
                            className={`w-full text-left px-6 py-2 text-sm hover:bg-purple-900/30 transition-colors ${
                              currentLanguage === lang.code && currentRegion === region
                                ? 'text-cyan-400 bg-purple-900/30'
                                : 'text-gray-200'
                            }`}
                          >
                            {lang.name} - {region.charAt(0).toUpperCase() + region.slice(1)}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right nav */}
          <nav className="hidden md:flex items-center gap-4">
            <button 
              onClick={openSearch}
              className="hidden lg:inline-flex items-center gap-1 rounded-full bg-cyan-900/20 border border-cyan-700/50 px-2.5 py-1 text-xs text-cyan-200 hover:text-cyan-100 hover:bg-cyan-800/30 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              ⌘K
            </button>

            <a href="#" className="px-2 py-1 text-sm text-gray-300 hover:text-purple-300 transition-colors">Docs</a>
            <a href="#" className="px-2 py-1 text-sm text-gray-300 hover:text-purple-300 transition-colors">Blog</a>
            <a href="#" className="px-2 py-1 text-sm text-gray-300 hover:text-purple-300 transition-colors">Showcase</a>
            <a href="#" className="px-2 py-1 text-sm text-gray-300 hover:text-purple-300 transition-colors">Sponsor</a>

            <button className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 px-3 py-1 text-sm text-white transition-all duration-200">
              Plus
            </button>

            <div className="ml-2 w-8 h-8 bg-gray-800/70 border border-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12 .5A11.5 11.5 0 0 0 .5 12.3c0 5.2 3.4 9.6 8.2 11.1.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.1-1.2-1.4-1.2-1.4-1-.7.1-.7.1-.7 1.1.1 1.6 1.2 1.6 1.2 1 .1.7 1.8 2.8 1.3.1-.8.4-1.3.7-1.6-2.7-.3-5.4-1.4-5.4-6 0-1.3.5-2.5 1.4-3.4-.1-.3-.6-1.6.1-3.3 0 0 1.1-.4 3.5 1.3a12.1 12.1 0 0 1 6.3 0c2.4-1.7 3.5-1.3 3.5-1.3.7 1.7.3 3 .1 3.3.9.9 1.4 2.1 1.4 3.4 0 4.6-2.7 5.7-5.4 6 .4.3.7 1 .7 2v3c0 .3.2.7.8.6 4.8-1.5 8.2-5.9 8.2-11.1A11.5 11.5 0 0 0 12 .5Z" clipRule="evenodd" />
              </svg>
            </div>
          </nav>

          {/* Mobile menu */}
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-purple-300 focus:outline-none focus:text-purple-300 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
