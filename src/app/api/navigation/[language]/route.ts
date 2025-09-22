import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string }> }
) {
  try {
    const { language } = await params;
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    
    // Try language-region combination first
    let navPath;
    if (region) {
      navPath = path.join(process.cwd(), 'src', 'content', `sidebar-navigation-${language}-${region}.json`);
    } else {
      // Fallback to language-only
      navPath = path.join(process.cwd(), 'src', 'content', `sidebar-navigation-${language}.json`);
    }
    
    if (!fs.existsSync(navPath)) {
      return NextResponse.json({ error: 'Navigation not found for this language/region' }, { status: 404 });
    }

    const navigation = JSON.parse(fs.readFileSync(navPath, 'utf8'));
    return NextResponse.json(navigation);
  } catch (error) {
    console.error('Error loading navigation:', error);
    return NextResponse.json({ error: 'Failed to load navigation' }, { status: 500 });
  }
}
