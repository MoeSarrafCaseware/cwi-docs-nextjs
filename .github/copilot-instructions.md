# Caseware Cloud Documentation - AI Coding Assistant Instructions

## Project Overview
This is a Next.js documentation site that serves multi-language Caseware Cloud documentation. The architecture converts static HTML documentation (originally from MadCap Flare) into a dynamic, searchable web application with language/region-based navigation.

## Core Architecture

### Multi-Language Content System
- Static HTML files live in `public/{language}/Content/` (e.g., `public/en/Content/`, `public/es/Content/`)
- Navigation generated from TOC files in `public/{language}/assets/data/toc-*.json`
- Language configuration in `src/content/language-config.json` defines available languages and regions
- Language switching handled by `LanguageProvider` context with region support (en-canada, en-us, etc.)

### Documentation Routing
- Dynamic routing via `src/app/docs/[...slug]/page.tsx` catches all doc paths
- URLs decode to file paths: `/docs/cloud/setup` → `public/{lang}/Content/cloud/setup.htm`
- Content served through API endpoint `/api/content` which reads HTML files via `htmlReader.tsx`

### Key Components
- `HTMLContent`: Client-side component that fetches and renders documentation content
- `Sidebar`: Renders navigation tree from generated JSON files in `src/content/sidebar-navigation-*.json`
- `SearchProvider`: Global search with Cmd+K shortcut (disabled on `/test` routes)
- `LanguageProvider`: Manages current language/region state across the app

## Critical Developer Workflows

### Navigation Generation
```bash
npm run generate-nav  # Runs scripts/generate-navigation.tsx
```
This script is essential - it reads TOC files from all language directories and generates sidebar navigation JSON files. Run after:
- Adding new languages
- Updating TOC files in `public/{lang}/assets/data/`
- Modifying navigation structure

### Development Commands
```bash
npm run dev          # Start dev server with Turbopack (faster)
npm run dev:stable   # Start dev server without Turbopack (if issues)
npm run build        # Build with Turbopack
```

### HTML Content Processing
The `htmlReader.tsx` utility handles complex HTML processing:
- Strips MadCap-specific attributes (`MadCap:*`, `data-mc-*`)
- Processes snippet includes (`.flsnp` files) 
- Cleans HTML while preserving structure for `dangerouslySetInnerHTML`
- Handles relative path resolution for cross-references

## Project-Specific Patterns

### Language/Region Pattern
```typescript
// Always use LanguageProvider for language-aware components
const { currentLanguage, currentRegion, setLanguage } = useLanguage();
// Navigation files follow pattern: sidebar-navigation-{lang}-{region}.json
```

### Content API Pattern
```typescript
// Client-side content loading via API (not direct file reads)
const response = await fetch(`/api/content?href=${encodeURIComponent(href)}`);
```

### Navigation Expansion State
Sidebar uses Set-based expanded state management for nested navigation trees - always use `Set<string>` for expansion tracking.

## File Structure Conventions
- API routes in `src/app/api/{feature}/route.ts`
- Generated content in `src/content/` (auto-generated, don't edit manually)
- Static documentation in `public/{language}/Content/`
- Utility functions in `src/utils/`
- Global state providers in `src/components/{Feature}Provider.tsx`

## Important Integration Points
- Language switching updates both `currentLanguage` and `currentRegion` state
- Search functionality disabled on `/test` routes via pathname checking
- Content paths always prefixed with language code: `/en/Content/...`
- Navigation generation reads different file patterns per language (TOC vs navigation.json)

## Styling Notes
- Dark theme with gray-900 background throughout
- Custom typography styles in `tailwind.config.ts` for documentation content
- Prose styling with `prose-invert` for dark mode content rendering