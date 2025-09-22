import { NextRequest, NextResponse } from 'next/server';
import { readHTMLFile } from '@/utils/htmlReader';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const language = searchParams.get('lang') || 'en';
  const region = searchParams.get('region') || 'us';

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results: Array<{title: string, href: string, section: string, score: number, matchType: string, snippet: string}> = [];
    const sectionResults: {[key: string]: Array<{title: string, href: string, section: string, score: number, matchType: string, snippet: string}>} = {};
    const lowercaseQuery = query.toLowerCase();

    // Load navigation for the specified language and region
    let navigationData;
    try {
      // Try language-region specific navigation first
      const navPath = path.join(process.cwd(), 'src', 'content', `sidebar-navigation-${language}-${region}.json`);
      if (fs.existsSync(navPath)) {
        navigationData = JSON.parse(fs.readFileSync(navPath, 'utf8'));
      } else {
        // Fallback to language-only navigation
        const fallbackNavPath = path.join(process.cwd(), 'src', 'content', `sidebar-navigation-${language}.json`);
        if (fs.existsSync(fallbackNavPath)) {
          navigationData = JSON.parse(fs.readFileSync(fallbackNavPath, 'utf8'));
        } else {
          // Final fallback to default navigation
          const defaultNavPath = path.join(process.cwd(), 'src', 'content', 'sidebar-navigation.json');
          navigationData = JSON.parse(fs.readFileSync(defaultNavPath, 'utf8'));
        }
      }
    } catch (error) {
      console.error('Error loading navigation for search:', error);
      return NextResponse.json({ error: 'Failed to load navigation' }, { status: 500 });
    }

    // Search through all navigation items
    for (const section of navigationData.navigationSections) {
        const searchInItems = async (items: Array<{name: string, href?: string, items?: unknown[], children?: unknown[]}>) => {
        for (const item of items) {
          if (item.href) {
            try {
              // Read the actual HTML content
              const content = await readHTMLFile(item.href);
              if (content) {
                // Check if the content contains the search query
                const contentText = content.content.toLowerCase();
                const titleText = content.title.toLowerCase();
                
                let score = 0;
                let matchType = 'title';
                
                // Title match (highest priority)
                if (titleText.includes(lowercaseQuery)) {
                  score += 100;
                  matchType = 'title';
                }
                
                // Content match
                if (contentText.includes(lowercaseQuery)) {
                  score += 30;
                  matchType = 'content';
                }
                
                // Name match
                if (item.name.toLowerCase().includes(lowercaseQuery)) {
                  score += 80;
                  matchType = 'title';
                }
                
                if (score > 0) {
                  // Extract a snippet around the match
                  let snippet = '';
                  if (matchType === 'content') {
                    const index = contentText.indexOf(lowercaseQuery);
                    const start = Math.max(0, index - 100);
                    const end = Math.min(contentText.length, index + 100);
                    snippet = content.content.substring(start, end).replace(/<[^>]*>/g, '');
                    if (start > 0) snippet = '...' + snippet;
                    if (end < contentText.length) snippet = snippet + '...';
                  }
                  
                  const result = {
                    title: item.name,
                    href: item.href,
                    section: section.title,
                    score,
                    matchType,
                    snippet: snippet.trim()
                  };
                  
                  results.push(result);
                  
                  // Group by section
                  if (!sectionResults[section.title]) {
                    sectionResults[section.title] = [];
                  }
                  sectionResults[section.title].push(result);
                }
              }
            } catch (error) {
              console.warn(`Error reading ${item.href}:`, error);
            }
          }
          
          if (item.children) {
            await searchInItems(item.children as Array<{name: string, href?: string, items?: unknown[], children?: unknown[]}>);
          }
        }
      };
      
      await searchInItems(section.items);
    }

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    
    // Sort sections by their highest scoring result
    const sortedSections = Object.keys(sectionResults).sort((a, b) => {
      const maxScoreA = Math.max(...sectionResults[a].map(r => r.score));
      const maxScoreB = Math.max(...sectionResults[b].map(r => r.score));
      return maxScoreB - maxScoreA;
    });
    
    // Sort results within each section by score
    Object.keys(sectionResults).forEach(section => {
      sectionResults[section].sort((a, b) => b.score - a.score);
    });
    
    return NextResponse.json({ 
      results: results.slice(0, 10),
      sectionResults,
      sortedSections,
      query: query
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
