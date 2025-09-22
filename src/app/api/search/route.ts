import { NextRequest, NextResponse } from 'next/server';
import { readHTMLFile } from '@/utils/htmlReader';
import sidebarNavigation from '@/content/sidebar-navigation.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = [];
    const lowercaseQuery = query.toLowerCase();

    // Search through all navigation items
    for (const section of sidebarNavigation.navigationSections) {
      const searchInItems = async (items: any[]) => {
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
                  
                  results.push({
                    title: item.name,
                    href: item.href,
                    section: section.title,
                    score,
                    matchType,
                    snippet: snippet.trim()
                  });
                }
              }
            } catch (error) {
              console.warn(`Error reading ${item.href}:`, error);
            }
          }
          
          if (item.children) {
            await searchInItems(item.children);
          }
        }
      };
      
      await searchInItems(section.items);
    }

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    
    return NextResponse.json({ 
      results: results.slice(0, 10),
      query: query
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
