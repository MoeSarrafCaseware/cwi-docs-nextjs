#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to generate sidebar navigation from TOC files
 * Reads all language folders and their TOC files to create navigation
 */

// Type definitions
interface TOCItem {
  title: string;
  link?: string;
  children?: TOCItem[];
}

interface NavigationItem {
  name: string;
  href: string | null;
  children?: NavigationItem[];
}

interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

interface LanguageConfig {
  code: string;
  name: string;
  regions: string[];
}

interface NavigationData {
  language: string;
  region: string;
  navigationSections: NavigationSection[];
}

interface AllNavigations {
  [key: string]: NavigationData;
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SRC_DIR = path.join(__dirname, '..', 'src');
const CONTENT_DIR = path.join(SRC_DIR, 'content');

// Ensure content directory exists
if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

/**
 * Convert TOC item to navigation item format
 */
function convertTOCToNavigation(tocItem: TOCItem, language: string, region: string | null = null): NavigationItem {
  const navigationItem: NavigationItem = {
    name: tocItem.title,
    href: tocItem.link ? `/${language}${tocItem.link}` : null
  };

  // Add children if they exist
  if (tocItem.children && tocItem.children.length > 0) {
    navigationItem.children = tocItem.children.map((child: TOCItem) => 
      convertTOCToNavigation(child, language, region)
    );
  }

  return navigationItem;
}

/**
 * Generate navigation for a specific language and region
 */
function generateLanguageNavigation(language: string, region: string | null = null): NavigationData | null {
  const languageDir = path.join(PUBLIC_DIR, language);
  
  if (!fs.existsSync(languageDir)) {
    console.warn(`Language directory not found: ${language}`);
    return null;
  }

  const dataDir = path.join(languageDir, 'assets', 'data');
  
  if (!fs.existsSync(dataDir)) {
    console.warn(`Data directory not found for language: ${language}`);
    return null;
  }

  // Find files based on language
  let tocFiles: string[];
  if (language === 'en') {
    // For English: find toc-*.json files
    tocFiles = fs.readdirSync(dataDir)
      .filter((file: string) => file.startsWith('toc-') && file.endsWith('.json'));
  } else {
    // For other languages: find navigation.json files
    tocFiles = fs.readdirSync(dataDir)
      .filter((file: string) => file === 'navigation.json');
  }

  if (tocFiles.length === 0) {
    console.warn(`No navigation files found for language: ${language}`);
    return null;
  }

  const navigationSections: NavigationItem[] = [];

  // Process each TOC file
  for (const tocFile of tocFiles) {
    let fileRegion: string;
    if (language === 'en') {
      // For English: extract region from toc-{region}.json
      fileRegion = tocFile.replace('toc-', '').replace('.json', '');
    } else {
      // For other languages: use the language code as region (since they have navigation.json)
      fileRegion = language;
    }
    
    // If a specific region is requested, only process that region
    if (region && fileRegion !== region) {
      continue;
    }
    
    const tocPath = path.join(dataDir, tocFile);
    
    try {
      const tocData: TOCItem[] = JSON.parse(fs.readFileSync(tocPath, 'utf8'));
      
      // Only create section if TOC has content
      if (tocData && tocData.length > 0) {
        // Convert TOC data to navigation format - flatten the structure
        // Instead of creating a region section, add the TOC items directly
        const convertedItems = tocData.map((item: TOCItem) => convertTOCToNavigation(item, language, fileRegion));
        navigationSections.push(...convertedItems);
        
        console.log(`Processed ${tocFile} for ${language}`);
      } else {
        console.log(`Skipped empty ${tocFile} for ${language}`);
      }
    } catch (error) {
      console.error(`Error processing ${tocFile}:`, (error as Error).message);
    }
  }

  return {
    language,
    region: region || language,
    navigationSections: navigationSections.map((item, index) => ({
      id: `${language}-${region || language}-${index}`,
      title: item.name,
      items: item.children || []
    }))
  };
}

/**
 * Get all available languages from public directory
 */
function getAvailableLanguages(): string[] {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('Public directory not found');
    return [];
  }

  return fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })
    .filter((dirent: any) => dirent.isDirectory())
    .map((dirent: any) => dirent.name)
    .filter((name: string) => name !== 'caseware-logo.svg'); // Exclude non-language directories
}

/**
 * Generate language configuration for the app
 */
function generateLanguageConfig(languages: string[]): LanguageConfig[] {
  const languageConfig = languages.map((lang: string) => {
    const languageDir = path.join(PUBLIC_DIR, lang);
    const dataDir = path.join(languageDir, 'assets', 'data');
    
    if (!fs.existsSync(dataDir)) {
      return { code: lang, name: lang.toUpperCase(), regions: [] };
    }

    let regions: string[];
    if (lang === 'en') {
      // For English: find toc-*.json files
      regions = fs.readdirSync(dataDir)
        .filter((file: string) => file.startsWith('toc-') && file.endsWith('.json'))
        .map((file: string) => file.replace('toc-', '').replace('.json', ''));
    } else {
      // For other languages: check if navigation.json exists
      const hasNavigation = fs.readdirSync(dataDir)
        .some((file: string) => file === 'navigation.json');
      regions = hasNavigation ? [lang] : [];
    }

    return {
      code: lang,
      name: lang.toUpperCase(),
      regions: regions
    };
  });

  return languageConfig;
}

/**
 * Main function
 */
function main() {
  console.log('Starting navigation generation...\n');

  // Get all available languages
  const languages = getAvailableLanguages();
  console.log(`Found languages: ${languages.join(', ')}\n`);

  if (languages.length === 0) {
    console.error('No language directories found in public folder');
    process.exit(1);
  }

  // Generate navigation for each language-region combination
  const allNavigations: AllNavigations = {};

  for (const language of languages) {
    console.log(`Processing language: ${language}`);
    
    // Get available regions for this language
    const languageDir = path.join(PUBLIC_DIR, language);
    const dataDir = path.join(languageDir, 'assets', 'data');
    
    if (!fs.existsSync(dataDir)) {
      console.warn(`Data directory not found for language: ${language}`);
      continue;
    }

    let tocFiles: string[];
    if (language === 'en') {
      // For English: find toc-*.json files
      tocFiles = fs.readdirSync(dataDir)
        .filter((file: string) => file.startsWith('toc-') && file.endsWith('.json'));
    } else {
      // For other languages: find navigation.json files
      tocFiles = fs.readdirSync(dataDir)
        .filter((file: string) => file === 'navigation.json');
    }

    if (tocFiles.length === 0) {
      console.warn(`No navigation files found for language: ${language}`);
      continue;
    }

    // Generate navigation for each region
    for (const tocFile of tocFiles) {
      let region: string;
      if (language === 'en') {
        // For English: extract region from toc-{region}.json
        region = tocFile.replace('toc-', '').replace('.json', '');
      } else {
        // For other languages: use the language code as region
        region = language;
      }
      console.log(`Processing region: ${region}`);
      
      const navigation = generateLanguageNavigation(language, region);
      
      if (navigation) {
        const key = `${language}-${region}`;
        allNavigations[key] = navigation;
        
        // Write individual language-region navigation file
        const outputFile = path.join(CONTENT_DIR, `sidebar-navigation-${language}-${region}.json`);
        fs.writeFileSync(outputFile, JSON.stringify(navigation, null, 2));
        console.log(`Generated ${outputFile}`);
      }
    }
    console.log('');
  }

  // Generate language configuration
  const config = generateLanguageConfig(languages);
  const configFile = path.join(CONTENT_DIR, 'language-config.json');
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log(`Generated language configuration: ${configFile}`);

  // Generate combined navigation file (for backward compatibility)
  const combinedFile = path.join(CONTENT_DIR, 'sidebar-navigation.json');
  const defaultLanguage = languages.includes('en') ? 'en' : languages[0];
  const defaultNavigation = allNavigations[`${defaultLanguage}-${defaultLanguage === 'en' ? 'canada' : defaultLanguage}`];
  
  if (defaultNavigation) {
    fs.writeFileSync(combinedFile, JSON.stringify(defaultNavigation, null, 2));
    console.log(`Generated default navigation: ${combinedFile}`);
  }

  console.log('\nNavigation generation completed successfully!');
  console.log(`\nGenerated files:`);
  console.log(`- Language config: ${configFile}`);
  console.log(`- Default navigation: ${combinedFile}`);
  Object.keys(allNavigations).forEach(key => {
    console.log(`- ${key} navigation: sidebar-navigation-${key}.json`);
  });
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateLanguageNavigation,
  getAvailableLanguages,
  generateLanguageConfig
};
