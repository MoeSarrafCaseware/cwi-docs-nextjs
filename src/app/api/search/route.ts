import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const language = searchParams.get('lang') || 'en';
  const region = searchParams.get('region') || 'canada';
  const limit = searchParams.get('limit') || '20';

  console.log('[Search API] Backend URL:', BACKEND_URL);
  console.log('[Search API] Query:', query, 'Lang:', language, 'Region:', region);

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ 
      results: [], 
      sectionResults: {},
      sortedSections: [],
      total: 0 
    });
  }

  try {
    // Proxy the request to the backend server
    const backendUrl = `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}&lang=${language}&region=${region}&limit=${limit}`;
    
    console.log('[Search API] Fetching from:', backendUrl);
    
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      throw new Error(`Backend search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('[Search API] Results count:', data.total);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Search API] Error:', error);
    
    // Return empty results instead of error to gracefully handle backend unavailability
    return NextResponse.json({ 
      results: [], 
      sectionResults: {},
      sortedSections: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Search failed'
    });
  }
}
