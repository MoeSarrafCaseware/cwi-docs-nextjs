"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type LanguageConfig = {
  code: string;
  name: string;
  regions: string[];
};

type LanguageContextType = {
  currentLanguage: string;
  currentRegion: string;
  availableLanguages: LanguageConfig[];
  setLanguage: (language: string, region?: string) => void;
  getLanguageDisplay: () => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentRegion, setCurrentRegion] = useState('canada');
  const [availableLanguages, setAvailableLanguages] = useState<LanguageConfig[]>([]);
  const pathname = usePathname();

  // Load language configuration
  useEffect(() => {
    const loadLanguageConfig = async () => {
      try {
        const response = await fetch('/api/languages');
        if (response.ok) {
          const config = await response.json();
          setAvailableLanguages(config);
          
          // Set default language and region from available options
          if (config.length > 0) {
            const defaultLang = config.find((lang: {code: string, regions: string[]}) => lang.code === 'en') || config[0];
            setCurrentLanguage(defaultLang.code);
            if (defaultLang.regions.length > 0) {
              setCurrentRegion(defaultLang.regions[0]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load language configuration:', error);
        // Fallback to default values
        setAvailableLanguages([{ code: 'en', name: 'EN', regions: ['canada', 'us', 'international'] }]);
      }
    };

    loadLanguageConfig();
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    const savedRegion = localStorage.getItem('selectedRegion');
    
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
    
    if (savedRegion) {
      const currentLangConfig = availableLanguages.find(lang => lang.code === currentLanguage);
      if (currentLangConfig?.regions.includes(savedRegion)) {
        setCurrentRegion(savedRegion);
      }
    }
  }, [availableLanguages, currentLanguage]);

  // Detect language from URL pathname for /docs/ routes
  useEffect(() => {
    if (availableLanguages.length === 0) return;

    const detectLanguageFromPath = () => {
      // Check for language in URL patterns like /docs/en/...
      const pathSegments = pathname.split('/');
      let languageFromPath: string | null = null;

      // Look for language in the path segments
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        if (availableLanguages.some(lang => lang.code === segment)) {
          languageFromPath = segment;
          break;
        }
      }

      // If we found a language in the URL and it's different from current, update it
      if (languageFromPath && languageFromPath !== currentLanguage) {
        const langConfig = availableLanguages.find(lang => lang.code === languageFromPath);
        if (langConfig) {
          setCurrentLanguage(languageFromPath);
          localStorage.setItem('selectedLanguage', languageFromPath);
          
          // Set region to first available region for the detected language
          if (langConfig.regions.length > 0) {
            const firstRegion = langConfig.regions[0];
            setCurrentRegion(firstRegion);
            localStorage.setItem('selectedRegion', firstRegion);
          }
        }
      }
    };

    detectLanguageFromPath();
  }, [pathname, availableLanguages, currentLanguage]);

  const setLanguage = (language: string, region?: string) => {
    const langConfig = availableLanguages.find(lang => lang.code === language);
    if (!langConfig) return;

    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language);

    if (region && langConfig.regions.includes(region)) {
      setCurrentRegion(region);
      localStorage.setItem('selectedRegion', region);
    } else if (langConfig.regions.length > 0) {
      // Set to first available region if no region specified or invalid
      const firstRegion = langConfig.regions[0];
      setCurrentRegion(firstRegion);
      localStorage.setItem('selectedRegion', firstRegion);
    }
  };

  const getLanguageDisplay = () => {
    const langConfig = availableLanguages.find(lang => lang.code === currentLanguage);
    if (!langConfig) return 'EN - Canada';
    
    return `${langConfig.name} - ${currentRegion.charAt(0).toUpperCase() + currentRegion.slice(1)}`;
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      currentRegion,
      availableLanguages,
      setLanguage,
      getLanguageDisplay
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
