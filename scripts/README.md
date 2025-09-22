# Navigation Generation Script

This script automatically generates sidebar navigation files from TOC (Table of Contents) files for different languages and regions.

## Usage

```bash
# Run the script directly
npx tsx scripts/generate-navigation.tsx

# Or use the npm script
npm run generate-nav
```

## What it does

1. **Scans language folders**: Reads all language directories in `public/` (e.g., `en`, `es`, `fr`)
2. **Finds TOC files**: Looks for `toc-*.json` files in each language's `assets/data/` directory
3. **Generates navigation**: Creates sidebar navigation JSON files for each language
4. **Creates language config**: Generates a language configuration file for the app

## Generated Files

- `src/content/language-config.json` - Language and region configuration
- `src/content/sidebar-navigation.json` - Default navigation (fallback)
- `src/content/sidebar-navigation-{language}.json` - Navigation for each language

## File Structure Expected

```
public/
├── en/
│   └── assets/
│       └── data/
│           ├── toc-canada.json
│           ├── toc-us.json
│           └── toc-international.json
├── es/
│   └── assets/
│       └── data/
│           ├── toc-canada.json
│           └── toc-us.json
└── fr/
    └── assets/
        └── data/
            └── toc-international.json
```

## Features

- **Automatic language detection**: Finds all language folders automatically
- **Region support**: Handles multiple regions per language (Canada, US, International)
- **Support section**: Includes a "Support and FAQs" section in each navigation
- **Error handling**: Gracefully handles missing files or directories
- **Backward compatibility**: Maintains the existing navigation structure

## Adding New Languages

1. Create a new language folder in `public/` (e.g., `public/fr/`)
2. Add the language's content in `public/fr/Content/`
3. Create TOC files in `public/fr/assets/data/` (e.g., `toc-canada.json`)
4. Run the script: `npm run generate-nav`

The script will automatically detect the new language and generate the appropriate navigation files.
