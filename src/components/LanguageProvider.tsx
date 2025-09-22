"use client";
import { createContext, useContext, useState, useEffect } from "react";

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
